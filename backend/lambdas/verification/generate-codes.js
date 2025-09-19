const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const QRCode = require('qrcode');

const client = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(client);
const s3 = new S3Client({});

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    try {
        const { roleQuantities } = JSON.parse(event.body);
        
        if (!roleQuantities) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'roleQuantities is required'
                })
            };
        }

        // Validar que el usuario sea organizador
        const userId = event.requestContext.authorizer.claims.sub;
        if (!userId) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'Unauthorized'
                })
            };
        }

        // Generar códigos para cada rol
        const allCodes = [];
        const batchWrites = [];
        
        for (const [role, quantity] of Object.entries(roleQuantities)) {
            if (quantity > 0) {
                const roleCodes = await generateCodesForRole(role, quantity, userId);
                allCodes.push(...roleCodes);
                
                // Agregar códigos a batches
                roleCodes.forEach(codeItem => {
                    // Crear nuevo batch si no existe o si el actual está lleno
                    if (batchWrites.length === 0 || batchWrites[batchWrites.length - 1].length >= 25) {
                        batchWrites.push([]);
                    }
                    
                    batchWrites[batchWrites.length - 1].push({
                        PutRequest: { Item: codeItem }
                    });
                });
            }
        }

        // Ejecutar batch writes
        for (const batch of batchWrites) {
            await dynamodb.send(new BatchWriteCommand({
                RequestItems: {
                    [process.env.VERIFICATION_CODES_TABLE]: batch
                }
            }));
        }

        // Generar PDF con QR codes
        const pdfUrl = await generateQRPDF(allCodes);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    message: `Generated ${allCodes.length} verification codes`,
                    totalCodes: allCodes.length,
                    codesByRole: roleQuantities,
                    pdfUrl: pdfUrl
                }
            })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message
            })
        };
    }
};

async function generateCodesForRole(role, quantity, generatedBy) {
    const codes = [];
    const initialPoints = getInitialPointsByRole(role);
    
    for (let i = 0; i < quantity; i++) {
        const verificationCode = generateUniqueCode();
        
        const codeItem = {
            verificationCode: verificationCode,
            role: role,
            initialPoints: initialPoints,
            used: "false",
            createdAt: new Date().toISOString(),
            generatedBy: generatedBy,
            expiresAt: getExpirationDate()
        };
        
        codes.push(codeItem);
    }
    
    return codes;
}

function generateUniqueCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

function getInitialPointsByRole(role) {
    const pointsMap = {
        'ATTENDEE': 200,
        'SPEAKER': 200,
        'SPONSOR': 200,
        'VOLUNTEER': 200,
        'ORGANIZER': 200
    };
    
    return pointsMap[role] || 50;
}

function getExpirationDate() {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30);
    return expirationDate.toISOString();
}

async function generateQRPDF(codes) {
    try {
        // Generar QR codes para cada código
        const codesWithQR = [];
        for (const code of codes) {
            const qrDataURL = await QRCode.toDataURL(code.verificationCode, {
                width: 150,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            
            codesWithQR.push({
                ...code,
                qrCode: qrDataURL
            });
        }

        // Crear contenido HTML con 12 códigos por página (3 por fila)
        const htmlContent = generateHTMLContent(codesWithQR);
        
        // Guardar en S3
        const fileName = `verification-codes-${Date.now()}.html`;
        
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `verification-codes/${fileName}`,
            Body: htmlContent,
            ContentType: 'text/html'
        }));

        return `https://${process.env.S3_BUCKET}.s3.amazonaws.com/verification-codes/${fileName}`;
    } catch (error) {
        console.error('Error generating QR PDF:', error);
        return null;
    }
}

function generateHTMLContent(codesWithQR) {
    const roleGroups = {};
    
    // Agrupar códigos por rol
    codesWithQR.forEach(code => {
        if (!roleGroups[code.role]) {
            roleGroups[code.role] = [];
        }
        roleGroups[code.role].push(code);
    });

    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Códigos de Verificación - Kinua</title>
        <style>
            @page {
                size: letter;
                margin: 0.25in;
            }
            
            body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 0;
                font-size: 12px;
            }
            
            .page {
                width: 8.5in;
                height: 11in;
                padding: 0.25in;
                box-sizing: border-box;
                page-break-after: always;
            }
            
            .page:last-child {
                page-break-after: avoid;
            }
            
            .codes-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                grid-template-rows: repeat(4, 1fr);
                gap: 10px;
                height: calc(11in - 0.5in);
            }
            
            .code-item {
                border: 2px solid #333;
                border-radius: 8px;
                padding: 15px;
                text-align: center;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background: #FFFFFF;
                position: relative;
            }
            
            .code-item .role {
                font-size: 16px;
                font-weight: bold;
                color: #333;
                margin-bottom: 10px;
                text-transform: uppercase;
            }
            
            .code-item .qr-code {
                margin: 10px 0;
            }
            
            .code-item .qr-code img {
                width: 100px;
                height: 100px;
                border: 1px solid #ccc;
            }
            
            .code-item .verification-code {
                font-size: 18px;
                font-weight: bold;
                color: #000;
                letter-spacing: 2px;
                margin-top: 10px;
            }
            
            @media print {
                body { margin: 0; }
                .page { page-break-after: always; }
            }
        </style>
    </head>
    <body>
    `;

    // Generar páginas con 12 códigos cada una (3 por fila)
    let allCodes = [];
    for (const [role, roleCodes] of Object.entries(roleGroups)) {
        allCodes.push(...roleCodes);
    }

    // Dividir en páginas de 12 códigos
    const codesPerPage = 12;
    const pages = [];
    for (let i = 0; i < allCodes.length; i += codesPerPage) {
        pages.push(allCodes.slice(i, i + codesPerPage));
    }

    pages.forEach((pageCodes, pageIndex) => {
        html += `
        <div class="page">
            <div class="codes-grid">
        `;
        
        pageCodes.forEach(code => {
            html += `
                <div class="code-item">
                    <div class="role">${getRoleDisplayName(code.role)}</div>
                    <div class="qr-code">
                        <img src="${code.qrCode}" alt="QR Code ${code.verificationCode}">
                    </div>
                    <div class="verification-code">${code.verificationCode}</div>
                </div>
            `;
        });
        
        // Rellenar espacios vacíos si la página no está completa
        const emptySlots = codesPerPage - pageCodes.length;
        for (let i = 0; i < emptySlots; i++) {
            html += `<div class="code-item" style="border: 2px dashed #ccc; background: #FFFFFF;">
                <div class="role" style="color: #999;">VACÍO</div>
                <div class="qr-code">
                    <div style="width: 100px; height: 100px; background: #f0f0f0; border: 1px solid #ccc;"></div>
                </div>
                <div class="verification-code" style="color: #999;">------</div>
            </div>`;
        }
        
        html += `
            </div>
        </div>
        `;
    });

    html += `
    </body>
    </html>
    `;

    return html;
}

function getRoleDisplayName(role) {
    const roleNames = {
        'ATTENDEE': 'Asistente',
        'SPEAKER': 'Expositor',
        'SPONSOR': 'Patrocinador',
        'VOLUNTEER': 'Voluntario',
        'ORGANIZER': 'Organizador'
    };
    
    return roleNames[role] || role;
} 
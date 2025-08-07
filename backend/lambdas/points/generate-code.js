const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, BatchWriteCommand } = require('@aws-sdk/lib-dynamodb');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const QRCode = require('qrcode');

const dynamodb = DynamoDBDocumentClient.from(new DynamoDBClient());
const s3 = new S3Client();

// Definición de tipos de cards con sus características visuales
const CARD_TYPES = {
    'common': { 
        points: 5, 
        rarity: 'COMMON',
        color: '#151729',
        borderColor: '#151729',
        textColor: '#FFFFFF',
        description: 'Escaneá para acumular rewrites y puntos',
        expiresAt: '2025-12-31T23:59:59.000Z'
    },
    'rare': { 
        points: 10, 
        rarity: 'RARE',
        color: '#F39C12',
        borderColor: '#F39C12',
        textColor: '#FFFFFF',
        description: 'Reclamá tus puntos en la nube',
        expiresAt: '2025-12-31T23:59:59.000Z'
    },
    'epic': { 
        points: 20, 
        rarity: 'EPIC',
        color: '#9B59B6',
        borderColor: '#9B59B6',
        textColor: '#FFFFFF',
        description: '¡Escaneá este tesoro dorado!',
        expiresAt: '2025-12-31T23:59:59.000Z'
    },
    'dinamic': { 
        points: null, // Se define en la request
        rarity: 'DINAMIC',
        color: '#E74C3C',
        borderColor: '#E74C3C',
        textColor: '#FFFFFF',
        description: null, // Se define en la request
        expiresAt: null // Se define en la request
    }
};

// Definición de cards con nombres y descripciones específicas
const CARD_DESIGNS = {
    'common': {
        name: 'Llama Backendera',
        description: 'Escaneá para acumular puntos'
    },
    'rare': {
        name: 'Cloud Walker',
        description: 'Reclamá tus puntos en la nube'
    },
    'epic': {
        name: 'Token Dorado',
        description: '¡Escaneá este tesoro dorado!'
    },
    'dinamic': {
        name: 'Código Dinámico',
        description: 'Código personalizable'
    }
};

exports.handler = async (event) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'POST,OPTIONS'
    };

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({})
        };
    }

    try {
        // Validar que el usuario sea organizador
        let userId;
        try {
            if (event.requestContext?.authorizer?.claims?.sub) {
                userId = event.requestContext.authorizer.claims.sub;
            } else if (event.requestContext?.authorizer?.jwt?.claims?.sub) {
                userId = event.requestContext.authorizer.jwt.claims.sub;
            } else {
                throw new Error('No se pudo obtener el userId del token');
            }
        } catch (error) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'No autorizado'
                })
            };
        }

        const body = JSON.parse(event.body);
        const { cardType, quantity = 1, customName, customDescription, points, maxUses, expiresAt } = body;

        // Validaciones
        if (!cardType || !CARD_TYPES[cardType]) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: `Tipo de card inválido. Tipos válidos: ${Object.keys(CARD_TYPES).join(', ')}`
                })
            };
        }

        // Validaciones específicas para dinamic
        if (cardType === 'dinamic') {
            if (!points || points <= 0) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Para cards dinámicas, los puntos deben ser mayores a 0'
                    })
                };
            }
            
            if (quantity !== 1) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'Las cards dinámicas solo pueden generar 1 código'
                    })
                };
            }
        } else {
            // Para cards predefinidas, cantidad entre 1 y 1000
            if (quantity <= 0 || quantity > 1000) {
                return {
                    statusCode: 400,
                    headers,
                    body: JSON.stringify({
                        success: false,
                        error: 'La cantidad debe estar entre 1 y 1000'
                    })
                };
            }
        }

        const cardConfig = CARD_TYPES[cardType];
        const cardDesign = CARD_DESIGNS[cardType];
        const now = new Date();
        const codes = [];
        const cardImages = [];

        // Determinar puntos y configuración según el tipo (una vez fuera del bucle)
        let finalPoints, finalMaxUses, finalExpiresAt, finalDescription;
        
        if (cardType === 'dinamic') {
            finalPoints = points;
            finalMaxUses = maxUses || 1;
            finalExpiresAt = expiresAt || null;
            finalDescription = customDescription || 'Código dinámico personalizable';
        } else {
            finalPoints = cardConfig.points;
            finalMaxUses = 1; // Una vez por usuario para cards predefinidas
            finalExpiresAt = cardConfig.expiresAt;
            finalDescription = customDescription || cardDesign.description;
        }

        // Generar códigos
        for (let i = 0; i < quantity; i++) {
            // Generar código de 6 caracteres sin prefijos
            const code = generateRandomCode(6);

            const codeItem = {
                code,
                type: 'card',
                points: finalPoints,
                maxUses: finalMaxUses,
                createdAt: now.toISOString(),
                expiresAt: finalExpiresAt,
                description: finalDescription,
                cardType,
                generatedBy: userId
            };

            codes.push(codeItem);

            // Generar QR code con solo el código
            const qrImageDataURL = await QRCode.toDataURL(code, {
                width: 200,
                margin: 2,
                color: { dark: '#000000', light: '#FFFFFF' }
            });

            cardImages.push({
                code,
                qrDataURL: qrImageDataURL,
                cardType,
                points: finalPoints,
                name: customName || cardDesign.name,
                description: finalDescription,
                rarity: cardConfig.rarity,
                color: cardConfig.color,
                borderColor: cardConfig.borderColor,
                textColor: cardConfig.textColor,
                maxUses: finalMaxUses,
                expiresAt: finalExpiresAt
            });
        }

        // Guardar códigos en DynamoDB
        if (codes.length === 1) {
            // Un solo código
            await dynamodb.send(new PutCommand({
                TableName: process.env.POINTS_CODES_TABLE,
                Item: codes[0]
            }));
        } else {
            // Múltiples códigos en lotes
            const batchSize = 25;
            for (let i = 0; i < codes.length; i += batchSize) {
                const batch = codes.slice(i, i + batchSize);
                const writeRequests = batch.map(code => ({
                    PutRequest: {
                        Item: code
                    }
                }));

                await dynamodb.send(new BatchWriteCommand({
                    RequestItems: {
                        [process.env.POINTS_CODES_TABLE]: writeRequests
                    }
                }));
            }
        }

        // Generar HTML con las cards
        const htmlContent = generateCardsHTML(cardImages, cardType);
        const fileName = `cards-${cardType}-${Date.now()}.html`;
        
        await s3.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: `points-codes/${fileName}`,
            Body: htmlContent,
            ContentType: 'text/html'
        }));

        const htmlUrl = `https://${process.env.S3_BUCKET}.s3.amazonaws.com/points-codes/${fileName}`;

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: {
                    cards: codes.map(c => ({
                        code: c.code,
                        type: c.type,
                        points: c.points,
                        cardType: c.cardType,
                        description: c.description,
                        maxUses: c.maxUses,
                        expiresAt: c.expiresAt
                    })),
                    totalCards: codes.length,
                    cardType,
                    points: finalPoints,
                    htmlUrl,
                    generatedAt: now.toISOString()
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

function generateRandomCode(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

function generateCardsHTML(cardImages, cardType) {
    const cardsPerPage = 6; // 3x2 grid = 6 cards por página
    const pages = [];
    
    for (let i = 0; i < cardImages.length; i += cardsPerPage) {
        pages.push(cardImages.slice(i, i + cardsPerPage));
    }

    let html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cards de Puntos - reEvent</title>
        <style>
            @page { size: letter; margin: 0.3in; }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 0; 
                font-size: 10px; 
                background: #f5f5f5;
            }
            .page { 
                width: 8.5in; 
                height: 11in; 
                padding: 0.3in; 
                box-sizing: border-box; 
                page-break-after: always; 
                background: white;
            }
            .page:last-child { page-break-after: avoid; }
            .header { 
                text-align: center; 
                margin-bottom: 20px; 
                border-bottom: 2px solid #333; 
                padding-bottom: 10px; 
            }
            .header h1 { 
                margin: 0; 
                font-size: 24px; 
                color: #333; 
                font-weight: bold;
            }
            .header p { 
                margin: 5px 0; 
                color: #666; 
                font-size: 12px;
            }
            .cards-grid { 
                display: grid; 
                grid-template-columns: repeat(3, 70mm); 
                grid-template-rows: repeat(2, 100mm); 
                gap: 2mm; 
                justify-content: center;
                align-content: center;
                height: calc(11in - 0.6in - 80px); 
            }
            .card { 
                width: 70mm;
                height: 100mm;
                border-radius: 12px; 
                padding: 20px; 
                text-align: center; 
                display: flex; 
                flex-direction: column; 
                justify-content: space-between; 
                align-items: center; 
                position: relative; 
                box-shadow: 0 3px 6px rgba(0,0,0,0.15);
                border: 2px solid;
                overflow: hidden;
                box-sizing: border-box;
            }
            .card .rarity { 
                font-size: 10px; 
                font-weight: bold; 
                margin-bottom: 16px; 
                text-transform: uppercase; 
                padding: 3px 8px;
                border-radius: 10px;
                background: #018858;
                letter-spacing: 1px;
            }
            .card .name { 
                font-size: 25px;
                font-weight: 500;
                padding-bottom: 80px;
                padding-right: 40px;
                color: #FFFFFF;
                line-height: 1.1;
                text-align: start;
                width: 150px;
            }
            .card .description { 
                font-size: 9px;
                line-height: 1.2;
                opacity: 0.9;
                text-align: center;
                padding: 8px 4px;
            }
            .card .qr-section { 
                display: flex; 
                align-items: center; 
                justify-content: space-between; 
                width: 100%;
                padding: 0 12px;
            }
            .card .points-left, .card .points-right { 
                font-size: 20px; 
                font-weight: bold; 
                display: flex; 
                align-items: center;
                justify-content: center;
                width: 35px;
                height: 35px;
                border-radius: 50%;
                background: #fea300;
                border: 2px solid #f38b0f;
            }
            .card .qr-code { 
                flex: 1; 
                margin: 0; 
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .card .qr-code img { 
                width: 90px; 
                height: 90px; 
                border: 2px solid rgba(255,255,255,0.4); 
                border-radius: 8px;
                background: white;
                padding: 4px;
            }
            .card .code { 
                font-size: 16px; 
                font-weight: bold; 
                letter-spacing: 2px; 
                font-family: 'Courier New', monospace;
                background: rgba(0,0,0,0.1);
                padding: 4px 8px;
                border-radius: 6px;
            }
            .card .details { 
                font-size: 7px;
                opacity: 0.7;
                text-align: center;
            }
            .footer { 
                text-align: center; 
                margin-top: 15px; 
                font-size: 9px; 
                color: #666; 
                border-top: 1px solid #ccc; 
                padding-top: 8px; 
            }
            @media print { 
                body { margin: 0; } 
                .page { page-break-after: always; } 
                .cards-grid { gap: 2mm; }
            }
        </style>
    </head>
    <body>
    `;

    pages.forEach((pageCards, pageIndex) => {
        html += `
        <div class="page">
            <div class="header">
                <h1>Cards de Puntos - reEvent</h1>
                <p>Tipo: ${cardType.toUpperCase()} | Página ${pageIndex + 1} de ${pages.length} | Generado: ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="cards-grid">
        `;
        
        pageCards.forEach(card => {
            const details = [];
            if (card.maxUses && card.maxUses > 1) {
                details.push(`Máx: ${card.maxUses} usos`);
            }
            if (card.expiresAt) {
                const expDate = new Date(card.expiresAt).toLocaleDateString();
                details.push(`Exp: ${expDate}`);
            }
            
            html += `
                <div class="card" style="background: ${card.color}; color: ${card.textColor}; border: 2px solid ${card.borderColor};">
                    <div class="rarity">${card.rarity}</div>
                    <div class="name">${card.name}</div>
                    <div class="description">${card.description}</div>
                    <div class="qr-section">
                        <div class="points-left">${card.points}</div>
                        <div class="qr-code">
                            <img src="${card.qrDataURL}" alt="QR Code ${card.code}">
                        </div>
                        <div class="points-right">${card.points}</div>
                    </div>
                    <div class="code">${card.code}</div>
                    ${details.length > 0 ? `<div class="details">${details.join(' | ')}</div>` : ''}
                </div>
            `;
        });
        
        // Rellenar espacios vacíos
        const emptySlots = cardsPerPage - pageCards.length;
        for (let i = 0; i < emptySlots; i++) {
            html += `<div class="card" style="border: 2px dashed #ccc; background: #f0f0f0; color: #999;">
                <div class="rarity">VACÍO</div>
                <div class="name">Sin Card</div>
                <div class="description">Espacio disponible</div>
                <div class="qr-section">
                    <div class="points-left">0</div>
                    <div class="qr-code">
                        <div style="width: 90px; height: 90px; background: #f0f0f0; border: 2px solid #ccc; border-radius: 8px;"></div>
                    </div>
                    <div class="points-right">0</div>
                </div>
                <div class="code">------</div>
            </div>`;
        }
        
        html += `
            </div>
            
            <div class="footer">
                <p>Total de cards: ${cardImages.length} | Cada código solo puede ser usado una vez por usuario</p>
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
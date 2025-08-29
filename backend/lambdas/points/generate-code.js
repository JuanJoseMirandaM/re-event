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
        color: '#E2C0FF', // Lila
        borderColor: '#FF8C00',
        textColor: '#FFFFFF',
        flameIcon: 'https://raw.githubusercontent.com/JuanJoseMirandaM/re-event/main/frontend/re-event-frontend/public/images/app_card_1.png'
    },
    'rare': { 
        points: 10, 
        color: '#9AD8F0', // Celeste
        borderColor: '#FFA500',
        textColor: '#FFFFFF',
        flameIcon: 'https://raw.githubusercontent.com/JuanJoseMirandaM/re-event/main/frontend/re-event-frontend/public/images/app_card_2.png'
    },
    'epic': { 
        points: 20, 
        color: '#EBA06B', // Naranja claro
        borderColor: '#FF7F00',
        textColor: '#FFFFFF',
        flameIcon: 'https://raw.githubusercontent.com/JuanJoseMirandaM/re-event/main/frontend/re-event-frontend/public/images/app_card_3.jpeg'
    },
    'secret': { 
        points: null, // Se genera aleatoriamente entre 10-50
        color: '#173851', // Azul oscuro
        borderColor: '#FF6B35',
        textColor: '#FFFFFF',
        flameIcon: 'https://raw.githubusercontent.com/JuanJoseMirandaM/re-event/main/frontend/re-event-frontend/public/images/app_card_4.png'
    }
};

// Definición de cards con nombres y descripciones específicas
const CARD_DESIGNS = {
    'common': {
        name: 'Llama Backendera',
        description: 'Tarjeta Common - Comienza tu colección de puntos.'
    },
    'rare': {
        name: 'Cloud Walker',
        description: 'Tarjeta Rare - Avanzar más rápido en tu ranking de puntos.'
    },
    'epic': {
        name: 'Token Dorado',
        description: 'Tarjeta Epic - La tarjeta más valiosa del evento.'
    },
    'secret': {
        name: 'Código Secreto',
        description: 'Tarjeta Secreta - Una sorpresa espero te guste!'
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
        const { sheets = 1 } = body; // Solo pedimos cantidad de hojas

        // Validaciones
        if (sheets <= 0 || sheets > 100) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    success: false,
                    error: 'La cantidad de hojas debe estar entre 1 y 100'
                })
            };
        }

        const now = new Date();
        const codes = [];
        const cardImages = [];

        // Generar hojas completas con distribución específica
        const cardsPerSheet = 10; // 5 common + 3 rare + 1 epic + 1 secret
        
        for (let sheet = 0; sheet < sheets; sheet++) {
            // Generar distribución para esta hoja
            const sheetCards = generateSheetDistribution();
            
            for (const cardInfo of sheetCards) {
                // Generar código de 6 caracteres sin prefijos
                const code = generateRandomCode(6);
                
                // Determinar puntos según el tipo
                let cardPoints;
                let cardDescription;
                
                if (cardInfo.type === 'secret') {
                    cardPoints = Math.floor(Math.random() * 41) + 10; // 10-50 puntos
                    cardDescription = `Tarjeta Secreta - Una sorpresa esperándote. ¡Descubre cuántos puntos vale!`;
                } else {
                    cardPoints = CARD_TYPES[cardInfo.type].points;
                    cardDescription = CARD_DESIGNS[cardInfo.type].description;
                }

                const codeItem = {
                    code,
                    type: 'card',
                    points: cardPoints,
                    maxUses: 1, // Una vez por usuario
                    createdAt: now.toISOString(),
                    expiresAt: '2025-12-31T23:59:59.000Z',
                    description: cardDescription,
                    cardType: cardInfo.type,
                    generatedBy: userId
                };

                codes.push(codeItem);

                // Generar QR code con solo el código
                const qrImageDataURL = await QRCode.toDataURL(code, {
                    width: 120, // QR más pequeño para cards compactas
                    margin: 1, // Margen mínimo para aprovechar espacio
                    color: { dark: '#000000', light: '#FFFFFF' },
                    errorCorrectionLevel: 'M' // Nivel medio de corrección de errores
                });

                cardImages.push({
                    code,
                    qrDataURL: qrImageDataURL,
                    cardType: cardInfo.type,
                    points: cardPoints,
                    name: CARD_DESIGNS[cardInfo.type].name,
                    description: cardDescription,
                    color: CARD_TYPES[cardInfo.type].color,
                    borderColor: CARD_TYPES[cardInfo.type].borderColor,
                    textColor: CARD_TYPES[cardInfo.type].textColor,
                    flameIcon: CARD_TYPES[cardInfo.type].flameIcon,
                    maxUses: 1,
                    expiresAt: '2025-12-31T23:59:59.000Z'
                });
            }
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
        const htmlContent = generateCardsHTML(cardImages);
        const fileName = `cards-mixed-${sheets}-sheets-${Date.now()}.html`;
        
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
                    totalSheets: sheets,
                    cardsPerSheet: cardsPerSheet,
                    distribution: {
                        common: 5,
                        rare: 3,
                        epic: 1,
                        secret: 1
                    },
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

function generateSheetDistribution() {
    // Distribución fija por hoja: 5 common + 3 rare + 1 epic + 1 secret
    const distribution = [
        { type: 'common', count: 5 },
        { type: 'rare', count: 3 },
        { type: 'epic', count: 1 },
        { type: 'secret', count: 1 }
    ];
    
    const sheetCards = [];
    
    distribution.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
            sheetCards.push({ type });
        }
    });
    
    // Mezclar aleatoriamente las cards para que no sean predecibles
    return shuffleArray(sheetCards);
}

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function generateCardsHTML(cardImages) {
    const cardsPerPage = 10; // 5 filas x 2 columnas = 10 cards por página
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
        <title>Cards de Puntos - AWS</title>
        <style>
            @page { 
                size: letter portrait; 
                margin: 0.2in; /* Márgenes más estrechos */
            }
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; 
                padding: 0; 
                font-size: 8px; /* Texto más pequeño para cards compactos */
                background: #f5f5f5;
            }
            .page { 
                width: 8.5in; 
                height: 11in; 
                padding: 0.2in; /* Padding más estrecho */
                box-sizing: border-box; 
                page-break-after: always; 
                background: white;
            }
            .page:last-child { page-break-after: avoid; }
            
            /* Grid de 5x2 para 10 cards por página en portrait */
            .cards-grid { 
                display: grid; 
                grid-template-columns: repeat(2, 3.5in); /* 2 columnas de 3.5" cada una */
                grid-template-rows: repeat(5, 2in); /* 5 filas de 2" cada una */
                gap: 0.1in; /* Gap muy estrecho entre cards */
                justify-content: center;
                align-content: center;
                height: calc(11in - 0.4in); /* Altura total menos padding */
            }
            
            .card { 
                width: 3.5in; /* Ancho exacto de 3.5" */
                height: 2in; /* Alto exacto de 2" */
                border-radius: 12px; 
                padding: 12px; 
                text-align: left; 
                display: flex; 
                flex-direction: column; 
                justify-content: space-between; 
                position: relative; 
                box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                border: 2px solid #111111;
                overflow: hidden;
                box-sizing: border-box;
            }
            
            .card .header { 
                text-align: center; 
            }
            
            .card .header-text { 
                font-size: 16px; 
                font-weight: 500; 
                color: #FFFFFF; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0;
            }
            
            .card .content { 
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
            }
            
            .card .left-section { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                flex: 1;
            }
            
            .card .flame-icon { 
                width: auto; 
                height: 100px; 
                display: flex; 
                align-items: center; 
                justify-content: center;
            }
            
            .card .flame-icon img { 
                width: 100%; 
                height: 100%; 
            }
            
            .card .points-text { 
                font-size: 18px; 
                font-weight: bold; 
                color: #FFFFFF; 
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 0;
            }
            
            .card .right-section { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center;
                height: 100%;
                flex: 1;
            }
            
            .card .qr-code { 
                width: 100px; 
                height: 100px; 
                border: 2px solid #FFFFFF; 
                border-radius: 6px;
                background: white;
                padding: 2px;
            }
            
            .code-container { 
                background: #FFFFFF; 
                padding: 6px 12px; 
                border-radius: 6px; 
                border: 1px solid #DDD;
                width: fit-content;
                margin: 0 auto;
            }
            
            .code { 
                font-size: 16px;
                font-weight: bold;
                color: #000000;
                font-family: 'Courier New', monospace;
                letter-spacing: 1px;
                margin: 0;
                background: #FFF;
                padding: 5px;
            }
            
            .footer { 
                text-align: center; 
                font-size: 8px; 
                color: #666; 
                border-top: 1px solid #ccc; 
                padding-top: 5px; 
            }

            .footer p { 
                margin: 0;
            }

            @media print { 
                body { margin: 0; } 
                .page { page-break-after: always; } 
                .cards-grid { gap: 0.1in; }
            }
        </style>
    </head>
    <body>
    `;

    pages.forEach((pageCards, pageIndex) => {
        html += `
        <div class="page">
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
                <div class="card" style="background: ${card.color};">
                    <div class="header">
                        <p class="header-text">AWS Community Day</p>
                    </div>
                    <div class="content">
                        <div class="left-section">
                            <div class="flame-icon">
                                <img src="${card.flameIcon}" alt="Flame Icon">
                            </div>
                            <p class="points-text">${card.cardType === 'secret' ? '? POINTS' : `${card.points} POINTS`}</p>
                        </div>
                        <div class="right-section">
                            <img class="qr-code" src="${card.qrDataURL}" alt="QR Code ${card.code}">
                        </div>
                    </div>
                    <div class="code-container">
                        <span class="code">${card.code}</span>
                    </div>
                </div>
            `;
        });
        
        // Rellenar espacios vacíos
        const emptySlots = cardsPerPage - pageCards.length;
        for (let i = 0; i < emptySlots; i++) {
            html += `<div class="card" style="border: 2px dashed #ccc; background: #f0f0f0;">
                <div class="header">
                    <p class="header-text" style="color: #999;">VACÍO</p>
                </div>
                <div class="content">
                    <div class="left-section">
                        <div class="flame-icon">
                            <div style="width: 40px; height: 40px; background: #ccc; border-radius: 50%;"></div>
                        </div>
                        <p class="points-text" style="color: #999;">0 POINTS</p>
                    </div>
                    <div class="right-section">
                        <div class="qr-code">
                            <div style="width: 60px; height: 60px; background: #f0f0f0; border: 2px solid #ccc; border-radius: 6px;"></div>
                        </div>
                        <div class="code-container">
                            <p class="code" style="color: #999;">------</p>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        
        html += `
            </div>
            
            <div class="footer">
                <p>Generado el: ${new Date().toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })} | Total: ${cardImages.length} cards</p>
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
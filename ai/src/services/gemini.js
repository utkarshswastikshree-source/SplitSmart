
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const receiptSchema = {
    type: "OBJECT",
    properties: {
        merchant: { type: "STRING" },
        currency: { type: "STRING" },
        items: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    quantity: { type: "NUMBER" },
                    unit_price: { type: "NUMBER" },
                    total_price: { type: "NUMBER" }
                },
                required: [
                    "name",
                    "quantity",
                    "unit_price",
                    "total_price"
                ]
            }
        },
        tax: { type: "NUMBER" },
        total: { type: "NUMBER" }
    },
    required: ["merchant", "currency", "items", "tax", "total"]
};

async function scanReceipt(imageBuffer, mimeType) {
    const imageBase64 = imageBuffer.toString("base64");

    console.log("Sending image to Gemini...");

  
    const startTime = Date.now();
    console.time("GEMINI_API_TIME");
    const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: [
            {
                inlineData: {
                    mimeType,
                    data: imageBase64
                }
            },
            {
                text: `
                    Analyze this receipt image.

                    Extract:
                    - Merchant name
                    - Identify the currency from the receipt.
                    - Use the correct ISO 4217 currency code (SGD, INR, USD, etc.).
                    - Never assume the currency is INR.
                    - If currency cannot be identified, reject the receipt.
                    - Every purchased item
                    - Quantity
                    - Unit price
                    - Total price per item
                    - Total tax
                    - Final bill total
                    - Do not invent missing information.
                    - Reject images that are not genuine receipts.
                    - Do not confuse subtotal with final total.
                    Rules:
                    1. Return only information visible in the receipt.
                    2. Never invent missing prices or items.
                    3. If the image is not a receipt, reject it.
                    4. If the receipt is unreadable, reject it.
                    5. If information is missing, do not guess.
                    6. Use numerical values for all amounts.
                    7. Distinguish subtotal, tax and final total.
                `
            }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: receiptSchema,
            temperature: 0
        }
    });
    console.timeEnd("GEMINI_API_TIME");
    console.log(
    `Gemini response received in ${(Date.now() - startTime) / 1000} seconds`
    );
    const result = JSON.parse(response.text);

    validateReceipt(result);

    return result;
}

function validateReceipt(receipt) {
    if (
        !receipt.merchant ||
        !receipt.currency ||
        !Array.isArray(receipt.items) ||
        receipt.items.length === 0 ||
        typeof receipt.tax !== "number" ||
        typeof receipt.total !== "number"
    ) {
        throw new Error("Invalid or unreadable receipt.");
    }

    for (const item of receipt.items) {
        if (
            !item.name ||
            !Number.isFinite(item.quantity) ||
            !Number.isFinite(item.unit_price) ||
            !Number.isFinite(item.total_price) ||
            item.quantity <= 0 ||
            item.unit_price < 0 ||
            item.total_price < 0
        ) {
            throw new Error("Receipt contains invalid item information.");
        }
    }

    if (receipt.tax < 0 || receipt.total < 0) {
        throw new Error("Invalid receipt amounts.");
    }
}

module.exports = { scanReceipt };

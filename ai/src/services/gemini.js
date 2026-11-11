
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

        subtotal: {
            type: "NUMBER",
            nullable: true
        },

        discount: {
            type: "NUMBER",
            nullable: true
        },

        taxBreakdown: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    name: { type: "STRING" },
                    rate: {
                        type: "NUMBER",
                        nullable: true
                    },
                    amount: { type: "NUMBER" }
                },
                required: ["name", "rate", "amount"]
            }
        },

        // Combined tax amount, when identifiable.
        tax: {
            type: "NUMBER",
            nullable: true
        },

        serviceCharge: {
            type: "NUMBER",
            nullable: true
        },

        total: { type: "NUMBER" }
    },

    required: [
        "merchant",
        "currency",
        "items",
        "subtotal",
        "discount",
        "taxBreakdown",
        "tax",
        "serviceCharge",
        "total"
    ]
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
                    Analyze this receipt image and extract its information.

                    Extract:
                    - Merchant name
                    - Currency using ISO 4217 code (INR, SGD, USD, etc.)
                    - Every purchased item
                    - Quantity
                    - Unit price
                    - Total price per item
                    - Subtotal, if printed
                    - Total discount, if printed
                    - Individual tax entries, if identifiable
                    - Combined tax amount, if identifiable
                    - Service charge, if printed
                    - Final bill total

                    IMPORTANT RULES:

                    1. Only extract information visible in the receipt.
                    2. Never invent or estimate missing values.
                    3. If a field is not printed or cannot be identified,
                       return null for that field.
                    4. Do not assume the currency is INR.
                    5. If the currency cannot be identified, reject the receipt.
                    6. Reject images that are not genuine receipts.
                    7. Reject unreadable receipts.
                    8. Do not confuse subtotal with final total.
                    9. Do not treat a discount as a tax.
                    10. Do not combine service charges with taxes.
                    11. For taxBreakdown, preserve separate entries such as
                        CGST, SGST, IGST, VAT or other identifiable taxes.
                    12. For each tax entry, extract its printed name,
                        rate and amount. If the rate is not printed,
                        return null for rate.
                    13. The tax field should contain the combined tax
                        amount only when it can be reliably identified.
                    14. Do not add taxBreakdown amounts to tax again.
                    15. Use numerical values for all monetary amounts.
                    16. Return an empty taxBreakdown array if no
                        individual tax entries are identifiable.
                    17. Preserve the original currency and item details.
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
        typeof receipt.total !== "number" ||
        !Number.isFinite(receipt.total) ||
        !Array.isArray(receipt.taxBreakdown)
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

    const optionalAmounts = [
        receipt.subtotal,
        receipt.discount,
        receipt.tax,
        receipt.serviceCharge
    ];

    for (const amount of optionalAmounts) {
        if (
            amount !== null &&
            (!Number.isFinite(amount) || amount < 0)
        ) {
            throw new Error("Receipt contains invalid monetary values.");
        }
    }

    for (const taxEntry of receipt.taxBreakdown) {
        if (
            !taxEntry.name ||
            !Number.isFinite(taxEntry.amount) ||
            taxEntry.amount < 0 ||
            (
                taxEntry.rate !== null &&
                (
                    !Number.isFinite(taxEntry.rate) ||
                    taxEntry.rate < 0
                )
            )
        ) {
            throw new Error("Receipt contains invalid tax information.");
        }
    }
}

module.exports = { scanReceipt };

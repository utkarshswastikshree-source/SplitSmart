
async function scanReceipt(imageBuffer, mimeType) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  const base64Image = imageBuffer.toString("base64");

  const prompt = `
You are an expert receipt scanning AI.

Extract the following information from this receipt:
- merchant
- ISO currency code
- every purchased item
- quantity
- unit price
- total price for each item
- subtotal
- discount
- individual tax breakdown
- combined tax
- service charge
- final total

Return ONLY valid JSON in this exact structure:

{
  "merchant": "Restaurant name",
  "currency": "INR",
  "items": [
    {
      "name": "Item name",
      "quantity": 1,
      "unit_price": 100,
      "total_price": 100
    }
  ],
  "subtotal": 100,
  "discount": null,
  "taxBreakdown": [
    {
      "name": "CGST",
      "rate": 2.5,
      "amount": 2.5
    }
  ],
  "tax": 5,
  "serviceCharge": null,
  "total": 105
}

Rules:
- Extract only information visible in the image.
- Never invent missing values.
- Use null for unavailable optional amounts.
- Use an empty array if no tax breakdown is visible.
- Use numerical values, not strings, for amounts.
- Reject unreadable or non-receipt images.
- Do not double-count taxes.
`;

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "qwen/qwen3.8-27b",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0,
        max_completion_tokens: 2048,
        response_format: {
          type: "json_object"
        }
      })
    }
  );

  const result = await response.json();

  if (!response.ok) {
    console.error("Groq API Error:", result);
    throw new Error(
      result.error?.message || "Groq receipt scanning failed."
    );
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI returned an empty response.");
  }

  let receipt;

  try {
    receipt = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON.");
  }

  if (
    !receipt.merchant ||
    !receipt.currency ||
    !Array.isArray(receipt.items) ||
    receipt.items.length === 0 ||
    !Number.isFinite(receipt.total) ||
    receipt.total <= 0
  ) {
    throw new Error("Invalid receipt data.");
  }

  for (const item of receipt.items) {
    if (
      !item.name ||
      !Number.isFinite(item.quantity) ||
      item.quantity <= 0 ||
      !Number.isFinite(item.unit_price) ||
      !Number.isFinite(item.total_price) ||
      item.unit_price < 0 ||
      item.total_price < 0
    ) {
      throw new Error("Invalid receipt item.");
    }
  }

  return receipt;
}

module.exports = { scanReceipt };

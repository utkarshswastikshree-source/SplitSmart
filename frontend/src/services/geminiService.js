// Gemini AI Service Layer
// Future Integration Note:
// Replace simulated methods with official Google Gemini API calls via Node.js backend:
// import { GoogleGenerativeAI } from '@google/generative-ai';
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

import { SAMPLE_RECEIPTS, AI_KNOWLEDGE_BASE } from './mockData';

/**
 * Scans and extracts items from a receipt image using Gemini Vision model
 * @param {File|string} imageFileOrUrl - The receipt image
 * @param {Function} onProgress - Callback for scan status updates
 * @returns {Promise<Object>} Extracted structured receipt data
 */
export async function scanReceiptWithGemini(imageFileOrUrl, onProgress = () => {}) {
  // Step 1: Preprocessing
  onProgress({ step: 1, message: 'Uploading receipt image to Gemini Vision OCR...', percent: 25 });
  await new Promise((r) => setTimeout(r, 600));

  // Step 2: Line detection
  onProgress({ step: 2, message: 'Detecting merchant, invoice date, and line items...', percent: 55 });
  await new Promise((r) => setTimeout(r, 600));

  // Step 3: Financial parsing
  onProgress({ step: 3, message: 'Validating item prices, GST/taxes, and totals...', percent: 85 });
  await new Promise((r) => setTimeout(r, 500));

  // Return a sample or generated receipt
  // Check if a sample matched or provide default
  let selectedSample = SAMPLE_RECEIPTS[0]; // Fisherman's Wharf default

  if (typeof imageFileOrUrl === 'string') {
    if (imageFileOrUrl.includes('sample-cafe') || imageFileOrUrl.includes('pizza')) {
      selectedSample = SAMPLE_RECEIPTS[1];
    } else if (imageFileOrUrl.includes('sample-groceries') || imageFileOrUrl.includes('blinkit')) {
      selectedSample = SAMPLE_RECEIPTS[2];
    }
  }

  const subtotal = selectedSample.items.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * selectedSample.taxRate);
  const serviceCharge = selectedSample.serviceCharge || 0;
  const grandTotal = subtotal + taxAmount + serviceCharge;

  onProgress({ step: 4, message: 'Receipt extracted successfully!', percent: 100 });

  return {
    id: `scan-${Date.now()}`,
    merchant: selectedSample.merchant,
    date: selectedSample.date,
    category: selectedSample.category,
    image: selectedSample.image,
    items: selectedSample.items.map((it, idx) => ({
      id: it.id || `item-${idx + 1}`,
      name: it.name,
      qty: it.qty,
      price: it.price,
      amount: it.amount,
      assignedMemberIds: [], // Initially unassigned or equal
    })),
    subtotal,
    taxRate: selectedSample.taxRate,
    taxAmount,
    serviceCharge,
    grandTotal,
    confidence: 0.98,
    currency: 'INR',
  };
}

/**
 * Natural Language Split Parser
 * Uses Gemini AI to translate natural language instructions into member allocations.
 * Example prompt: "Rahul and Aman share pizza. Kumar gets the burger. Everyone shares drinks."
 * 
 * @param {string} prompt - User instruction
 * @param {Array} items - List of bill items
 * @param {Array} members - Group members
 * @returns {Promise<Object>} Updated items with assignedMemberIds and explanation
 */
export async function parseSplitInstructionsWithGemini(prompt, items, members) {
  // Simulate AI parsing delay
  await new Promise((r) => setTimeout(r, 700));

  const lowerPrompt = prompt.toLowerCase();
  const memberMap = {};
  members.forEach((m) => {
    const firstName = m.name.split(' ')[0].toLowerCase();
    memberMap[firstName] = m.id;
  });

  const updatedItems = items.map((item) => {
    const itemName = item.name.toLowerCase();
    let assigned = [...item.assignedMemberIds];

    // Check for "everyone" or "share all"
    if (lowerPrompt.includes('everyone') || lowerPrompt.includes('all share') || lowerPrompt.includes('split equally')) {
      if (
        (lowerPrompt.includes('drinks') && (itemName.includes('beer') || itemName.includes('mojito') || itemName.includes('cocktail') || itemName.includes('shake') || itemName.includes('water'))) ||
        (lowerPrompt.includes('food') && !itemName.includes('beer') && !itemName.includes('shake')) ||
        !lowerPrompt.includes('except')
      ) {
        assigned = members.map((m) => m.id);
      }
    }

    // Check specific items mentioned in prompt
    const matchesItem = (keywords) => keywords.some((k) => itemName.includes(k));

    // Pizza check
    if (matchesItem(['pizza']) && lowerPrompt.includes('pizza')) {
      assigned = [];
      if (lowerPrompt.includes('rahul')) assigned.push(memberMap['rahul']);
      if (lowerPrompt.includes('aman')) assigned.push(memberMap['aman']);
      if (lowerPrompt.includes('kumar')) assigned.push(memberMap['kumar']);
      if (lowerPrompt.includes('priya')) assigned.push(memberMap['priya']);
    }

    // Burger check
    if (matchesItem(['burger']) && lowerPrompt.includes('burger')) {
      assigned = [];
      if (lowerPrompt.includes('kumar gets the burger') || lowerPrompt.includes('kumar gets burger') || lowerPrompt.includes('burger to kumar')) {
        assigned.push(memberMap['kumar']);
      } else if (lowerPrompt.includes('aman')) {
        assigned.push(memberMap['aman']);
      }
    }

    // Prawns / Seafood check
    if (matchesItem(['prawn', 'fish', 'pomfret']) && (lowerPrompt.includes('prawn') || lowerPrompt.includes('seafood') || lowerPrompt.includes('fish'))) {
      assigned = [];
      if (lowerPrompt.includes('rahul')) assigned.push(memberMap['rahul']);
      if (lowerPrompt.includes('kumar')) assigned.push(memberMap['kumar']);
      if (lowerPrompt.includes('priya')) assigned.push(memberMap['priya']);
      if (lowerPrompt.includes('aman') && !lowerPrompt.includes('except aman')) assigned.push(memberMap['aman']);
    }

    // Drinks / Beer check
    if (matchesItem(['beer', 'draught', 'mojito', 'iced', 'thickshake', 'water', 'energy']) && (lowerPrompt.includes('drink') || lowerPrompt.includes('beer') || lowerPrompt.includes('shakes'))) {
      if (lowerPrompt.includes('everyone shares drinks') || lowerPrompt.includes('all share drinks')) {
        assigned = members.map((m) => m.id);
      }
    }

    // If still empty, default to everyone
    if (assigned.length === 0) {
      assigned = members.map((m) => m.id);
    }

    // Remove duplicates and undefined
    assigned = Array.from(new Set(assigned)).filter(Boolean);

    return {
      ...item,
      assignedMemberIds: assigned,
    };
  });

  return {
    success: true,
    items: updatedItems,
    summary: `Understood! Parsed prompt into individual item allocations across ${members.length} members.`,
  };
}

/**
 * AI Assistant Chat query handler
 * @param {string} userQuestion
 * @param {Object} context - Current state & group context
 * @returns {Promise<Object>} Assistant response with text, cards, or suggested actions
 */
export async function queryAiAssistant(userQuestion, context = {}) {
  await new Promise((r) => setTimeout(r, 650));

  for (const entry of AI_KNOWLEDGE_BASE) {
    if (entry.queryMatch.test(userQuestion)) {
      return {
        text: entry.response,
        action: entry.action || null,
        chartData: entry.chartData || null,
      };
    }
  }

  // Default fallback response
  return {
    text: `I've analyzed your question against the current ledger:
    
- Active Group: **${context.groupName || 'Goa Trip 2024'}**
- Total recorded expenses: **₹28,440**
- You are owed: **₹2,450**

You can ask me to break down expenses by member, simulate bill splits with custom rules (e.g. *"split equally except Kumar pays 20% less"*), or initiate one-click PayPal settlements.`,
    action: null,
  };
}


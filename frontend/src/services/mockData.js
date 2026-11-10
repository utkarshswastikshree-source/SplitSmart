// Mock Data for SplitSmart
// Realistic Goa Trip dataset featuring Rahul (Current User), Aman, Kumar, and Priya.

export const CURRENT_USER = {
  id: 'user-1',
  name: 'Rahul Sharma',
  email: 'rahul.sharma@splitsmart.io',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  paypalEmail: 'rahul.sharma-buyer@sandbox.paypal.com',
  upiId: 'rahul@oksbi',
  phone: '+91 98765 43210',
};

export const GROUP_MEMBERS = [
  {
    id: 'user-1',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@splitsmart.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    paypalEmail: 'rahul.sharma-buyer@sandbox.paypal.com',
    isCurrentUser: true,
    role: 'Admin',
  },
  {
    id: 'user-2',
    name: 'Aman Verma',
    email: 'aman.verma@example.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    paypalEmail: 'aman.verma-merchant@sandbox.paypal.com',
    isCurrentUser: false,
    role: 'Member',
  },
  {
    id: 'user-3',
    name: 'Kumar Mangalam',
    email: 'kumar.m@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    paypalEmail: 'kumar.m-pay@sandbox.paypal.com',
    isCurrentUser: false,
    role: 'Member',
  },
  {
    id: 'user-4',
    name: 'Priya Patel',
    email: 'priya.patel@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    paypalEmail: 'priya.patel-pay@sandbox.paypal.com',
    isCurrentUser: false,
    role: 'Member',
  },
];

export const INITIAL_GROUPS = [
  {
    id: 'group-goa',
    name: 'Goa Trip 2024 🏖️',
    description: 'Baga, Vagator, scooty rides, shacks, and seafood with the gang.',
    category: 'Trip',
    currency: 'INR',
    currencySymbol: '₹',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-11-01T10:00:00.000Z',
    members: GROUP_MEMBERS,
    totalExpenses: 28440,
    userNetBalance: 2450, // Positive means Rahul is owed ₹2,450
  },
  {
    id: 'group-flat',
    name: 'Flat 402 Bandra 🏠',
    description: 'Monthly groceries, WiFi, maid, electricity, and water filter maintenance.',
    category: 'Home',
    currency: 'INR',
    currencySymbol: '₹',
    coverImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-10-01T10:00:00.000Z',
    members: [GROUP_MEMBERS[0], GROUP_MEMBERS[1], GROUP_MEMBERS[3]],
    totalExpenses: 42100,
    userNetBalance: -850, // Rahul owes ₹850
  },
  {
    id: 'group-hackathon',
    name: 'Bangalore Hackathon ⚡',
    description: 'Cabs, cloud credits, midnight pizzas, and energy drinks.',
    category: 'Project',
    currency: 'INR',
    currencySymbol: '₹',
    coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
    createdAt: '2024-10-20T10:00:00.000Z',
    members: [GROUP_MEMBERS[0], GROUP_MEMBERS[2]],
    totalExpenses: 12500,
    userNetBalance: 0,
  },
];

export const INITIAL_EXPENSES = [
  {
    id: 'exp-1',
    groupId: 'group-goa',
    title: "Fisherman's Wharf Seafood & Drinks",
    category: 'Food & Dining',
    categoryIcon: 'Utensils',
    amount: 6840,
    paidById: 'user-1', // Rahul paid ₹6,840
    date: '2024-11-08T20:30:00.000Z',
    receiptUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80',
    status: 'Settled',
    splitType: 'AI Itemized',
    notes: 'Scanned via Gemini Vision and split with AI prompt.',
    shares: [
      { memberId: 'user-1', amount: 1710 },
      { memberId: 'user-2', amount: 1710 },
      { memberId: 'user-3', amount: 1710 },
      { memberId: 'user-4', amount: 1710 },
    ],
  },
  {
    id: 'exp-2',
    groupId: 'group-goa',
    title: 'Infantaria Bakery Breakfast & Coffee',
    category: 'Food & Dining',
    categoryIcon: 'Coffee',
    amount: 3920,
    paidById: 'user-1', // Rahul paid ₹3,920
    date: '2024-11-09T09:30:00.000Z',
    receiptUrl: null,
    status: 'Pending Settlement',
    splitType: 'Equal Split',
    notes: 'Croissants, eggs benedict, pastries and iced lattes.',
    shares: [
      { memberId: 'user-1', amount: 980 },
      { memberId: 'user-2', amount: 980 },
      { memberId: 'user-3', amount: 980 },
      { memberId: 'user-4', amount: 980 },
    ],
  },
  {
    id: 'exp-3',
    groupId: 'group-goa',
    title: 'Curlies Beach Shack & Sunset Dinner',
    category: 'Entertainment',
    categoryIcon: 'GlassWater',
    amount: 7110,
    paidById: 'user-4', // Priya paid ₹7,110
    date: '2024-11-09T18:45:00.000Z',
    receiptUrl: null,
    status: 'Settled',
    splitType: 'Equal Split',
    notes: 'Cocktails, appetizers and beach shack cover charge.',
    shares: [
      { memberId: 'user-1', amount: 1777.5 },
      { memberId: 'user-2', amount: 1777.5 },
      { memberId: 'user-3', amount: 1777.5 },
      { memberId: 'user-4', amount: 1777.5 },
    ],
  },
  {
    id: 'exp-4',
    groupId: 'group-goa',
    title: 'Beach Sports & Scuba Gear Rental',
    category: 'Entertainment',
    categoryIcon: 'GlassWater',
    amount: 5260,
    paidById: 'user-3', // Kumar paid ₹5,260
    date: '2024-11-08T11:00:00.000Z',
    receiptUrl: null,
    status: 'Pending Settlement',
    splitType: 'Equal Split',
    notes: 'Scuba diving masks, boat ride and safety equipment.',
    shares: [
      { memberId: 'user-1', amount: 1315 },
      { memberId: 'user-2', amount: 1315 },
      { memberId: 'user-3', amount: 1315 },
      { memberId: 'user-4', amount: 1315 },
    ],
  },
  {
    id: 'exp-5',
    groupId: 'group-goa',
    title: 'Activa Scooters Rental & Beach Fuel',
    category: 'Transport',
    categoryIcon: 'Car',
    amount: 5310,
    paidById: 'user-2', // Aman paid ₹5,310
    date: '2024-11-07T10:15:00.000Z',
    receiptUrl: null,
    status: 'Pending Settlement',
    splitType: 'Equal Split',
    notes: '2 Scooters for 3 days + full tank petrol and helmets.',
    shares: [
      { memberId: 'user-1', amount: 1327.5 },
      { memberId: 'user-2', amount: 1327.5 },
      { memberId: 'user-3', amount: 1327.5 },
      { memberId: 'user-4', amount: 1327.5 },
    ],
  },
];

export const INITIAL_SETTLEMENTS = [
  {
    id: 'settle-1',
    groupId: 'group-goa',
    fromUserId: 'user-2', // Aman Verma
    toUserId: 'user-1',   // Rahul Sharma
    amount: 1200,
    status: 'Completed',
    paymentMethod: 'PayPal',
    paypalTxnId: 'PAYID-MT79102948',
    paidAt: '2024-11-09T22:15:00.000Z',
    note: 'Initial settlement via PayPal Sandbox',
  },
  {
    id: 'settle-2',
    groupId: 'group-goa',
    fromUserId: 'user-3', // Kumar Mangalam
    toUserId: 'user-1',   // Rahul Sharma
    amount: 1850,
    status: 'Pending',
    paymentMethod: 'PayPal',
    paypalTxnId: null,
    paidAt: null,
    note: 'Outstanding balance for Goa expenses',
  },
  {
    id: 'settle-3',
    groupId: 'group-goa',
    fromUserId: 'user-2', // Aman Verma
    toUserId: 'user-1',   // Rahul Sharma
    amount: 600,
    status: 'Pending',
    paymentMethod: 'PayPal',
    paypalTxnId: null,
    paidAt: null,
    note: 'Remaining balance for scooters and breakfast',
  },
];

// Preset sample receipts for instant testing in the AI Receipt Scanner
export const SAMPLE_RECEIPTS = [
  {
    id: 'sample-seafood',
    name: "Fisherman's Wharf - Goa (Dinner)",
    merchant: "The Fisherman's Wharf, Salcette, Goa",
    date: '2024-11-08',
    category: 'Food & Dining',
    taxRate: 0.05, // 5% GST
    serviceCharge: 250,
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    items: [
      { id: 'it-1', name: 'Butter Garlic Prawns (Large)', qty: 2, price: 650, amount: 1300 },
      { id: 'it-2', name: 'Goan Fish Curry & Rice', qty: 2, price: 480, amount: 960 },
      { id: 'it-3', name: 'Tandoori Pomfret Fry', qty: 1, price: 850, amount: 850 },
      { id: 'it-4', name: 'Garlic Butter Naan', qty: 4, price: 90, amount: 360 },
      { id: 'it-5', name: 'Kingfisher Premium Draught (Pitcher)', qty: 2, price: 550, amount: 1100 },
      { id: 'it-6', name: 'Kokum Virgin Mojito', qty: 2, price: 240, amount: 480 },
      { id: 'it-7', name: 'Bebinca with Vanilla Gelato', qty: 2, price: 290, amount: 580 },
    ],
  },
  {
    id: 'sample-cafe',
    name: 'Cafe Lilliput - Anjuna (Lunch & Shakes)',
    merchant: 'Cafe Lilliput, South Anjuna Beach, Goa',
    date: '2024-11-09',
    category: 'Food & Dining',
    taxRate: 0.05,
    serviceCharge: 180,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    items: [
      { id: 'it-10', name: 'Woodfired Margherita Pizza', qty: 1, price: 550, amount: 550 },
      { id: 'it-11', name: 'Smoked Chicken Burger with Fries', qty: 2, price: 420, amount: 840 },
      { id: 'it-12', name: 'Loaded Guacamole Nachos', qty: 1, price: 390, amount: 390 },
      { id: 'it-13', name: 'Belgian Chocolate Thickshake', qty: 2, price: 260, amount: 520 },
      { id: 'it-14', name: 'Iced Americano', qty: 2, price: 180, amount: 360 },
    ],
  },
  {
    id: 'sample-groceries',
    name: 'Blinkit Superstore - Beach Supplies',
    merchant: 'Blinkit Retail Ltd., Calangute Hub',
    date: '2024-11-07',
    category: 'Groceries',
    taxRate: 0.12,
    serviceCharge: 35,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80',
    items: [
      { id: 'it-20', name: 'Bisleri Mineral Water 5L Can', qty: 2, price: 75, amount: 150 },
      { id: 'it-21', name: 'Red Bull Energy Drinks (4-Pack)', qty: 1, price: 480, amount: 480 },
      { id: 'it-22', name: 'Doritos Sweet Chili Large', qty: 3, price: 60, amount: 180 },
      { id: 'it-23', name: 'Party Ice Cubes Bag 2kg', qty: 2, price: 90, amount: 180 },
      { id: 'it-24', name: 'Sunscreen Lotion SPF 50', qty: 1, price: 450, amount: 450 },
    ],
  },
];

// Pre-built AI queries and responses for the AI Assistant chat page
export const AI_KNOWLEDGE_BASE = [
  {
    queryMatch: /who owes me/i,
    title: 'Outstanding Balances Owed to You',
    response: `Based on the **Goa Trip 2024** ledger, you are currently owed a net total of **₹2,450**:

1. **Kumar Mangalam** owes you **₹1,850** (Pending settlement from trip expenses).
2. **Aman Verma** owes you **₹600** (Remaining balance, after paying ₹1,200 via PayPal yesterday).

Total amount receivable: **₹2,450**. Priya Patel is completely squared up (₹0 balance). Would you like to send a payment reminder to Kumar or Aman?`,
    action: {
      label: 'Open Settlement Page',
      type: 'navigate',
      path: '/settlement',
    },
  },
  {
    queryMatch: /food|dining|eat/i,
    title: 'Food & Dining Breakdown',
    response: `You and your group have spent a total of **₹10,760** across dining outings on the Goa trip:

- **Fisherman's Wharf**: ₹6,840 *(Paid by Rahul, split equally ₹1,710 each)*
- **Infantaria Bakery**: ₹3,920 *(Paid by Rahul, split equally ₹980 each)*

Your personal consumption share of these meals is **₹2,690**, and ₹8,070 was covered for your group members.`,
    chartData: [
      { name: 'Rahul', spend: 2690 },
      { name: 'Kumar', spend: 2690 },
      { name: 'Aman', spend: 2690 },
      { name: 'Priya', spend: 2690 },
    ],
  },
  {
    queryMatch: /rahul pays 200 extra|extra/i,
    title: 'Custom Split Simulation',
    response: `Here is the revised breakdown with the rule: *"Split equally except Rahul pays ₹200 extra"*:

Let's assume the bill total is **₹1,800** across 4 members (Base split = ₹400 each):
- **Rahul Sharma**: ₹400 + ₹200 = **₹600**
- **Aman Verma**: ₹400 = **₹400**
- **Kumar Mangalam**: ₹400 = **₹400**
- **Priya Patel**: ₹400 = **₹400**

Total verified: ₹600 + ₹400 + ₹400 + ₹400 = **₹1,800** ✅.
Would you like me to apply this rule to your current bill?`,
  },
  {
    queryMatch: /minimum transaction|optimize|simplify/i,
    title: 'Optimal Settlement Plan',
    response: `Instead of 6 individual back-and-forth transfers among 4 people, SplitSmart's **Min-Cash-Flow Algorithm** reduces the debt to just **2 single transfers**:

1. **Kumar Mangalam** pays **Rahul Sharma** **₹1,850** via PayPal.
2. **Aman Verma** pays **Priya Patel** **₹600** via PayPal.

This completely settles all Goa trip accounts with **0 debt leftover**!`,
    action: {
      label: 'Open Settlement Matrix',
      type: 'navigate',
      path: '/settlement',
    },
  },
];


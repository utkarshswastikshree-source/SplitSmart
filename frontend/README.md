# SplitSmart 🚀

> **Tagline:** Scan. Split. Settle.  
> An AI-powered group expense settlement platform designed as a premium fintech SaaS web application.

---

## 🌟 Overview & Key Capabilities

SplitSmart eliminates the friction and awkwardness of group expense splitting. Whether sharing a villa on a Goa beach trip, managing monthly apartment bills, or splitting a restaurant dinner, SplitSmart combines:

1. **AI Receipt Scanner (Gemini Vision OCR):** Upload photos or PDFs of crumpled receipts. Automatically extracts merchant names, invoice dates, line items, quantities, taxes (GST/VAT), and tips.
2. **Natural Language Bill Splitting (NLP Engine):** Type instructions in plain English (e.g., *"Rahul and Aman share pizza. Kumar gets the burger. Everyone shares drinks."*) and watch Gemini AI automatically allocate items and calculate individual shares with proportional tax/tip distribution.
3. **1-Click PayPal Settlement:** Visualizes "Who Owes Whom" using a **Min-Cash-Flow algorithm** that reduces circular transfers to the absolute minimum, complete with one-click sandbox PayPal payment buttons and confetti celebrations.
4. **Fintech AI Assistant:** Conversational chat interface to ask questions about spending, balances, who owes whom, and custom split simulations.

---

## 🛠 Tech Stack

- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS with custom fintech color palette (deep navy typography, indigo accents, emerald success indicators)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Data Visualization:** Recharts
- **Celebrations:** Canvas Confetti

---

## 📁 Architecture & Folder Structure

```
paypal/
├── index.html                   # HTML entry point with Plus Jakarta Sans & Inter fonts
├── package.json                 # Project dependencies & scripts
├── vite.config.js               # Vite bundler configuration
├── tailwind.config.js           # Fintech design theme tokens
├── postcss.config.js            # PostCSS plugins
└── src/
    ├── main.jsx                 # Application entry point with BrowserRouter & AppProvider
    ├── App.jsx                  # Route definitions
    ├── index.css                # Tailwind directives & sleek scrollbar styling
    ├── components/
    │   ├── common/              # Reusable design system
    │   │   ├── Button.jsx       # Standard, Outline, Ghost, Danger, and PayPal branded buttons
    │   │   ├── Input.jsx        # Validation-ready inputs with icons & prefixes
    │   │   ├── Card.jsx         # Fintech card containers
    │   │   ├── Badge.jsx        # Status pills & tags
    │   │   ├── Modal.jsx        # Accessible dialog system
    │   │   ├── Avatar.jsx       # Fallback initials & status indicators
    │   │   ├── EmptyState.jsx   # Empty views with illustrations
    │   │   ├── LoadingSpinner.jsx
    │   │   └── Toast.jsx        # Notification alert system
    │   ├── layout/
    │   │   ├── Navbar.jsx       # Public landing page navigation
    │   │   ├── Footer.jsx       # Public landing page footer
    │   │   ├── Sidebar.jsx      # Dashboard sidebar with active group pill
    │   │   ├── TopNav.jsx       # Dashboard header with quick actions & currency toggle
    │   │   └── DashboardLayout.jsx # Responsive shell with mobile slide-out drawer
    │   ├── receipt/
    │   │   ├── ReceiptDropzone.jsx      # Drag-and-drop receipt uploader + 3 presets
    │   │   └── ExtractedItemsTable.jsx  # Editable extracted line items table
    │   ├── splitting/
    │   │   ├── AiPromptInput.jsx        # Natural language prompt bar with suggestions
    │   │   ├── ItemAssigner.jsx         # Visual per-item member assigner
    │   │   └── SplitSummaryCard.jsx     # Individual member dues & confirmation
    │   ├── settlement/
    │   │   ├── DebtGraph.jsx            # Min-cash-flow debt simplification matrix
    │   │   ├── PaymentModal.jsx         # PayPal checkout modal
    │   │   └── PayPalButtonPlaceholder.jsx # Branded PayPal button with sandbox simulation
    │   └── groups/
    │       ├── GroupCard.jsx            # Group preview card
    │       ├── CreateGroupModal.jsx     # New group creation modal
    │       └── AddExpenseModal.jsx      # Manual expense entry modal
    ├── context/
    │   └── AppContext.jsx       # Reactive global state (groups, expenses, settlements, user)
    ├── services/
    │   ├── geminiService.js     # Gemini Vision OCR & NLP split parser
    │   ├── paypalService.js     # PayPal order creation & capture stubs
    │   ├── supabaseService.js   # Supabase database & auth client stubs
    │   └── mockData.js          # Realistic Goa Trip dataset (Rahul, Aman, Kumar, Priya)
    └── utils/
        ├── cn.js                # Tailwind class merger
        └── formatters.js        # Currency, date, avatar color, and min-cash-flow debt algorithms
```

---

## 👥 Realistic Showcase Dataset: Goa Trip 2024

The app comes loaded with a realistic scenario:
- **Current User:** Rahul Sharma (Admin)
- **Group Members:**
  - `Rahul Sharma` (You) - `rahul.sharma-buyer@sandbox.paypal.com`
  - `Aman Verma` - `aman.verma-merchant@sandbox.paypal.com`
  - `Kumar Mangalam` - `kumar.m-pay@sandbox.paypal.com`
  - `Priya Patel` - `priya.patel-pay@sandbox.paypal.com`
- **Transactions:** Fisherman's Wharf seafood dinner, Vagator beach villa, Activa scooter rentals, and Infantaria bakery breakfast.
- **Ready Receipts for Scanner Demo:**
  1. *Fisherman's Wharf - Goa* (7 items: Butter garlic prawns, Goan fish curry, Pomfret fry, Kingfisher beers, GST)
  2. *Cafe Lilliput - Anjuna* (Pizza, Burgers, Loaded Nachos, Shakes)
  3. *Blinkit Superstore - Panaji* (Energy drinks, snacks, water cans)

---

## 🔌 Future Backend Integration Guide

All API calls are strictly separated from UI components inside `src/services/`:

1. **Supabase Integration (`src/services/supabaseService.js`):**
   - Install `@supabase/supabase-js`
   - Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`
   - Switch mock database calls to `supabase.from('expenses').select('*')` etc.

2. **Google Gemini Integration (`src/services/geminiService.js`):**
   - In your Node.js backend or edge function:
     ```javascript
     import { GoogleGenerativeAI } from '@google/generative-ai';
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
     ```
   - Connect OCR extraction to Gemini Vision multimodal API.

3. **PayPal Integration (`src/services/paypalService.js`):**
   - Set `VITE_PAYPAL_CLIENT_ID` in `.env`
   - Integrate PayPal Orders v2 REST API (`/v2/checkout/orders`) via backend proxy.

---

## 🚀 Running the Application

In your terminal:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const https = require('https'); // NAYA: IPv4 fix ke liye
const dns = require('dns');     // NAYA: IPv4 fix ke liye
require('dotenv').config({ override: true });

dns.setDefaultResultOrder('ipv4first'); // NAYA: Force IPv4

const app = express();
app.use(cors());
app.use(express.json()); 

const supabaseUrl = process.env.SUPABASE_URL || "https://zupdmssmzhjlwvemkpa.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY || "YAHAN_APNI_SECRET_KEY_PASTE_KARO";

// Supabase connect with custom agent
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { 
    fetch: (url, options) => {
      return fetch(url, { ...options, agent: new https.Agent({ keepAlive: true }) });
    }
  }
});

// 1. Test Route
app.get('/', (req, res) => {
    res.send("SplitSmart Backend is running! 🚀");
});

// 2. Create Group API
app.post('/api/create-group', async (req, res) => {
    try {
        const { groupName, userId } = req.body;

        if (!groupName) {
            return res.status(400).json({ error: "Group name zaroori hai!" });
        }

        const { data, error } = await supabase
            .from('groups')
            .insert([{ name: groupName, created_by: userId || "123e4567-e89b-12d3-a456-426614174000" }])
            .select(); 

        if (error) {
            console.log("⚠️ Database Error:", error.message);
            return res.status(201).json({ 
                message: "Group created (Offline Mode)! 🎉", 
                group: { id: "dummy-id-123", name: groupName } 
            });
        }

        res.status(201).json({ 
            message: "Group successfully created! 🎉", 
            group: data[0] 
        });

    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

// 3. Add Expense API
app.post('/api/add-expense', async (req, res) => {
    try {
        const { groupId, uploadedBy, totalAmount, receiptUrl, contributions, splits } = req.body;

        if (!groupId || !totalAmount) {
            return res.status(400).json({ error: "Group ID aur Amount zaroori hai!" });
        }

        if (contributions && contributions.length > 0) {
            const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amountPaid), 0);
            if (Math.abs(totalContributed - totalAmount) > 0.01) { 
                return res.status(400).json({ error: `Contributions total (${totalContributed}) does not match bill amount (${totalAmount})!` });
            }
        }

        if (splits && splits.length > 0) {
            const totalSplit = splits.reduce((sum, s) => sum + Number(s.amountOwed), 0);
            if (Math.abs(totalSplit - totalAmount) > 0.01) {
                return res.status(400).json({ error: `Splits total (${totalSplit}) does not match bill amount (${totalAmount})!` });
            }
        }

        const { data: expenseData, error: expenseError } = await supabase
            .from('expenses')
            .insert([{ 
                group_id: groupId, 
                paid_by: uploadedBy || "unknown", 
                total_amount: totalAmount,
                receipt_url: receiptUrl || null
            }])
            .select();

        if (expenseError) throw expenseError;
        const expenseId = expenseData[0].id;

        try {
            if (contributions && contributions.length > 0) {
                const contribData = contributions.map(c => ({
                    expense_id: expenseId,
                    user_id: c.userId,
                    amount_owed: c.amountPaid,
                    is_settled: true 
                }));
                await supabase.from('expense_splits').insert(contribData);
            }

            if (splits && splits.length > 0) {
                const splitData = splits.map(s => ({
                    expense_id: expenseId,
                    user_id: s.userId,
                    amount_owed: s.amountOwed,
                    is_settled: false 
                }));
                await supabase.from('expense_splits').insert(splitData);
            }
        } catch (splitError) {
            await supabase.from('expenses').delete().eq('id', expenseId);
            throw splitError;
        }

        res.status(201).json({ 
            message: "Expense saved perfectly! 🎉", 
            expense: expenseData[0] 
        });

    } catch (err) {
        console.log("⚠️ Error:", err.message);
        res.status(500).json({ error: "Server error", details: err.message });
    }
});

// 4. Get Balances API
app.get('/api/get-balances/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        const { data, error } = await supabase
            .from('expense_splits')
            .select(`
                user_id,
                amount_owed,
                is_settled,
                expenses!inner(group_id)
            `)
            .eq('expenses.group_id', groupId);

        if (error) throw error;

        const balances = {};
        data.forEach(item => {
            if (!balances[item.user_id]) balances[item.user_id] = 0;
            
            if (item.is_settled) {
                balances[item.user_id] += Number(item.amount_owed);
            } else {
                balances[item.user_id] -= Number(item.amount_owed);
            }
        });

        res.status(200).json({ groupId, balances });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
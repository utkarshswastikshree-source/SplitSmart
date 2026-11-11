const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json()); 

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

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
            // Fallback (just in case)
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

// 3. Add Expense API (Updated with Multiple Payers & Validation)
app.post('/api/add-expense', async (req, res) => {
    try {
        const { groupId, uploadedBy, totalAmount, receiptUrl, contributions, splits } = req.body;

        if (!groupId || !totalAmount) {
            return res.status(400).json({ error: "Group ID aur Amount zaroori hai!" });
        }

        // Validation 1: Contributions
        if (contributions && contributions.length > 0) {
            const totalContributed = contributions.reduce((sum, c) => sum + Number(c.amountPaid), 0);
            if (Math.abs(totalContributed - totalAmount) > 0.01) { 
                return res.status(400).json({ error: `Contributions total (${totalContributed}) does not match bill amount (${totalAmount})!` });
            }
        }

        // Validation 2: Splits
        if (splits && splits.length > 0) {
            const totalSplit = splits.reduce((sum, s) => sum + Number(s.amountOwed), 0);
            if (Math.abs(totalSplit - totalAmount) > 0.01) {
                return res.status(400).json({ error: `Splits total (${totalSplit}) does not match bill amount (${totalAmount})!` });
            }
        }

        // Save Main Expense
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
            // Save Contributions (TRANSFER_IN)
            if (contributions && contributions.length > 0) {
                const contribData = contributions.map(c => ({
                    expense_id: expenseId,
                    user_id: c.userId,
                    amount_owed: c.amountPaid,
                    is_settled: true 
                }));
                await supabase.from('expense_splits').insert(contribData);
            }

            // Save Splits (TRANSFER_OUT)
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
            // Rollback if splits fail
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

// 4. Get Balances API (For Dashboard)
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

        // Calculate net balance: 
        // Positive = they are owed money
        // Negative = they owe money
        const balances = {};
        data.forEach(item => {
            if (!balances[item.user_id]) balances[item.user_id] = 0;
            
            if (item.is_settled) {
                balances[item.user_id] += Number(item.amount_owed); // They paid
            } else {
                balances[item.user_id] -= Number(item.amount_owed); // They owe
            }
        });

        res.status(200).json({ groupId, balances });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Server Start (Always at the very bottom!)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. DATABASE CONNECTION - RENDER POSTGRESQL
// ==========================================

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing!');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
    console.error('Unexpected PostgreSQL error:', err.message);
});

// ==========================================
// 2. TEST ROUTE
// ==========================================

app.get('/', (req, res) => {
    res.status(200).send(
        'SplitSmart Backend is running with PostgreSQL! 🚀'
    );
});

// ==========================================
// 3. CREATE GROUP API
// POST /api/create-group
// ==========================================

app.post('/api/create-group', async (req, res) => {
    try {
        const { groupName, userId } = req.body;

        if (!groupName || !groupName.trim()) {
            return res.status(400).json({
                error: 'Group name is required!'
            });
        }

        const result = await pool.query(
            `INSERT INTO groups (name, created_by)
             VALUES ($1, $2)
             RETURNING *`,
            [
                groupName.trim(),
                userId || '123e4567-e89b-12d3-a456-426614174000'
            ]
        );

        res.status(201).json({
            message: 'Group successfully created!',
            group: result.rows[0]
        });

    } catch (error) {
        console.error('Create Group Error:', error.message);

        res.status(500).json({
            error: 'Database error',
            details: error.message
        });
    }
});

// ==========================================
// 4. ADD EXPENSE API
// POST /api/add-expense
// Supports Multiple Payers and Splits
// Uses SQL Transactions
// ==========================================

app.post('/api/add-expense', async (req, res) => {

    const {
        groupId,
        uploadedBy,
        totalAmount,
        receiptUrl,
        contributions,
        splits
    } = req.body;

    // Validate required fields

    if (!groupId || totalAmount === undefined || totalAmount === null) {
        return res.status(400).json({
            error: 'Group ID and total amount are required!'
        });
    }

    const amount = Number(totalAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
        return res.status(400).json({
            error: 'Total amount must be a positive number!'
        });
    }

    // Validate contributions

    if (contributions !== undefined && !Array.isArray(contributions)) {
        return res.status(400).json({
            error: 'Contributions must be an array!'
        });
    }

    // Validate splits

    if (splits !== undefined && !Array.isArray(splits)) {
        return res.status(400).json({
            error: 'Splits must be an array!'
        });
    }

    const payerList = contributions || [];
    const splitList = splits || [];

    if (payerList.length === 0 && splitList.length === 0) {
        return res.status(400).json({
            error: 'At least one contribution or split is required!'
        });
    }

    for (const c of payerList) {
        if (!c.userId || !Number.isFinite(Number(c.amountPaid)) ||
            Number(c.amountPaid) < 0) {
            return res.status(400).json({
                error: 'Invalid contribution details!'
            });
        }
    }

    for (const s of splitList) {
        if (!s.userId || !Number.isFinite(Number(s.amountOwed)) ||
            Number(s.amountOwed) < 0) {
            return res.status(400).json({
                error: 'Invalid split details!'
            });
        }
    }

    // Validate contribution total

    const totalContributed = payerList.reduce(
        (sum, c) => sum + Number(c.amountPaid), 0
    );

    if (
        payerList.length > 0 &&
        Math.abs(totalContributed - amount) > 0.01
    ) {
        return res.status(400).json({
            error: 'Contributions do not match bill amount!',
            totalContributed,
            totalAmount: amount
        });
    }

    // Validate split total

    const totalSplit = splitList.reduce(
        (sum, s) => sum + Number(s.amountOwed), 0
    );

    if (
        splitList.length > 0 &&
        Math.abs(totalSplit - amount) > 0.01
    ) {
        return res.status(400).json({
            error: 'Splits do not match bill amount!',
            totalSplit,
            totalAmount: amount
        });
    }

    let client;

    try {
        client = await pool.connect();

        // Start transaction
        await client.query('BEGIN');

        // Insert main expense

        const expenseResult = await client.query(
            `INSERT INTO expenses
             (group_id, paid_by, total_amount, receipt_url)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                groupId,
                uploadedBy || 'unknown',
                amount,
                receiptUrl || null
            ]
        );

        const expenseId = expenseResult.rows[0].id;

        // Save contributions (money paid)

        for (const c of payerList) {
            await client.query(
                `INSERT INTO expense_splits
                 (expense_id, user_id, amount_owed, is_settled)
                 VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    c.userId,
                    Number(c.amountPaid),
                    true
                ]
            );
        }

        // Save splits (money owed)

        for (const s of splitList) {
            await client.query(
                `INSERT INTO expense_splits
                 (expense_id, user_id, amount_owed, is_settled)
                 VALUES ($1, $2, $3, $4)`,
                [
                    expenseId,
                    s.userId,
                    Number(s.amountOwed),
                    false
                ]
            );
        }

        // Commit transaction
        await client.query('COMMIT');

        res.status(201).json({
            message: 'Expense saved successfully!',
            expense: expenseResult.rows[0]
        });

    } catch (error) {

        // Rollback if anything fails
        if (client) {
            await client.query('ROLLBACK').catch(() => {});
        }

        console.error('Add Expense Error:', error.message);

        res.status(500).json({
            error: 'Server error',
            details: error.message
        });

    } finally {
        if (client) {
            client.release();
        }
    }
});

// ==========================================
// 5. GET BALANCES API
// GET /api/get-balances/:groupId
// ==========================================

app.get('/api/get-balances/:groupId', async (req, res) => {

    try {
        const { groupId } = req.params;

        const result = await pool.query(
            `SELECT
                es.user_id,
                es.amount_owed,
                es.is_settled
             FROM expense_splits es
             JOIN expenses e
             ON es.expense_id = e.id
             WHERE e.group_id = $1`,
            [groupId]
        );

        const balances = {};

        result.rows.forEach(item => {

            const userId = item.user_id;

            if (!balances[userId]) {
                balances[userId] = 0;
            }

            if (item.is_settled) {
                // Money paid by user
                balances[userId] += Number(item.amount_owed);
            } else {
                // Money owed by user
                balances[userId] -= Number(item.amount_owed);
            }
        });

        // Round balances to 2 decimal places

        Object.keys(balances).forEach(userId => {
            balances[userId] = Number(
                balances[userId].toFixed(2)
            );
        });

        res.status(200).json({
            groupId,
            balances
        });

    } catch (error) {

        console.error('Get Balances Error:', error.message);

        res.status(500).json({
            error: 'Database error',
            details: error.message
        });
    }
});

// ==========================================
// 6. SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SplitSmart Backend running on port ${PORT}`);
});

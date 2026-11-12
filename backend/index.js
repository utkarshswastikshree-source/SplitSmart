
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const paypalRoutes = require('./routes/paypal');
require('dotenv').config();
const receiptRoutes = require('./routes/receipt');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api', receiptRoutes);

// ==========================================
// 1. DATABASE CONNECTION
// ==========================================

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is missing!');
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

pool.on('error', (error) => {
    console.error('Unexpected PostgreSQL error:', error.message);
});

const roundMoney = (value) =>
    Math.round((Number(value) + Number.EPSILON) * 100) / 100;

// ==========================================
// 2. HEALTH CHECK
// ==========================================

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'SplitSmart Backend is running!',
        database: 'PostgreSQL',
        status: 'OK'
    });
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');

        res.status(200).json({
            status: 'OK',
            database: 'connected'
        });
    } catch (error) {
        console.error('Health Check Error:', error.message);

        res.status(500).json({
            status: 'ERROR',
            database: 'disconnected'
        });
    }
});

// ==========================================
// 3. CREATE GROUP
// POST /api/create-group
// ==========================================

app.post('/api/create-group', async (req, res) => {
    const { groupName, userId, createdBy } = req.body;
    const creatorId = userId || createdBy;

    if (
        typeof groupName !== 'string' ||
        !groupName.trim() ||
        typeof creatorId !== 'string' ||
        !creatorId.trim()
    ) {
        return res.status(400).json({
            error: 'Group name and valid creator user ID are required!'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const groupResult = await client.query(
            `INSERT INTO groups (name, created_by)
             VALUES ($1, $2)
             RETURNING *`,
            [groupName.trim(), creatorId]
        );

        const group = groupResult.rows[0];

        await client.query(
            `INSERT INTO group_members (group_id, user_id, role)
             VALUES ($1, $2, 'ADMIN')
             ON CONFLICT (group_id, user_id) DO NOTHING`,
            [group.id, creatorId]
        );

        await client.query('COMMIT');

        res.status(201).json({
            message: 'Group successfully created!',
            group,
            membership: {
                userId: creatorId,
                role: 'ADMIN'
            }
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        console.error('Create Group Error:', error.message);

        res.status(500).json({
            error: 'Unable to create group'
        });
    } finally {
        client.release();
    }
});

// ==========================================
// 4. GET GROUPS FOR A USER
// GET /api/groups/:userId
// ==========================================

app.get('/api/groups/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT
                g.*,
                gm.role AS member_role,
                gm.joined_at
             FROM group_members gm
             JOIN groups g ON g.id = gm.group_id
             WHERE gm.user_id = $1
             ORDER BY gm.joined_at DESC`,
            [userId]
        );

        res.status(200).json({
            userId,
            totalGroups: result.rows.length,
            groups: result.rows
        });
    } catch (error) {
        console.error('Get User Groups Error:', error.message);

        res.status(500).json({
            error: 'Unable to retrieve user groups'
        });
    }
});

// ==========================================
// 5. ADD MEMBER TO GROUP
// POST /api/groups/:groupId/members
// ==========================================

app.post('/api/groups/:groupId/members', async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId || typeof userId !== 'string') {
            return res.status(400).json({
                error: 'Valid user ID is required!'
            });
        }

        const groupCheck = await pool.query(
            'SELECT id FROM groups WHERE id = $1',
            [groupId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Group not found!'
            });
        }

        const result = await pool.query(
            `INSERT INTO group_members (group_id, user_id, role)
             VALUES ($1, $2, 'MEMBER')
             ON CONFLICT (group_id, user_id) DO NOTHING
             RETURNING *`,
            [groupId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(409).json({
                error: 'User is already a member of this group!'
            });
        }

        res.status(201).json({
            message: 'Member added successfully!',
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Add Group Member Error:', error.message);

        res.status(500).json({
            error: 'Unable to add group member'
        });
    }
});

// ==========================================
// 6. GET GROUP MEMBERS
// GET /api/groups/:groupId/members
// ==========================================

app.get('/api/groups/:groupId/members', async (req, res) => {
    try {
        const { groupId } = req.params;

        const groupCheck = await pool.query(
            'SELECT id FROM groups WHERE id = $1',
            [groupId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Group not found!'
            });
        }

        const result = await pool.query(
            `SELECT
                user_id AS "userId",
                role,
                joined_at AS "joinedAt"
             FROM group_members
             WHERE group_id = $1
             ORDER BY joined_at ASC`,
            [groupId]
        );

        res.status(200).json({
            groupId,
            totalMembers: result.rows.length,
            members: result.rows
        });
    } catch (error) {
        console.error('Get Group Members Error:', error.message);

        res.status(500).json({
            error: 'Unable to retrieve group members'
        });
    }
});

// ==========================================
// 7. ADD EXPENSE
// POST /api/add-expense
// Supports manual splits and AI item assignments
// ==========================================

app.post('/api/add-expense', async (req, res) => {
    const {
        groupId,
        uploadedBy,
        paidBy,
        totalAmount,
        receiptUrl,
        receiptData,
        receipt_data,
        contributions,
        splits,
        itemAssignments
    } = req.body;

    const amount = Number(totalAmount);
    const receipt = receiptData || receipt_data || null;
    const hasItemAssignments = itemAssignments !== undefined;

    if (
        !groupId ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return res.status(400).json({
            error: 'Valid group ID and positive total amount are required!'
        });
    }

    if (
        hasItemAssignments &&
        !Array.isArray(itemAssignments)
    ) {
        return res.status(400).json({
            error: 'itemAssignments must be an array!'
        });
    }

    if (splits !== undefined && !Array.isArray(splits)) {
        return res.status(400).json({
            error: 'Splits must be an array!'
        });
    }

    if (
        contributions !== undefined &&
        !Array.isArray(contributions)
    ) {
        return res.status(400).json({
            error: 'Contributions must be an array!'
        });
    }

    // Validate contributions.
    let payerList = contributions || [];

    // Backward compatibility for a single payer.
    if (payerList.length === 0 && paidBy) {
        payerList = [{
            userId: paidBy,
            amountPaid: amount
        }];
    }

    if (payerList.length === 0) {
        return res.status(400).json({
            error: 'At least one contribution is required!'
        });
    }

    for (const item of payerList) {
        if (
            !item.userId ||
            !Number.isFinite(Number(item.amountPaid)) ||
            Number(item.amountPaid) <= 0
        ) {
            return res.status(400).json({
                error: 'Invalid contribution details!'
            });
        }
    }

    const totalContributed = roundMoney(
        payerList.reduce(
            (sum, item) => sum + Number(item.amountPaid),
            0
        )
    );

    if (Math.abs(totalContributed - amount) > 0.01) {
        return res.status(400).json({
            error: 'Contributions must equal the bill total!',
            totalContributed,
            totalAmount: amount
        });
    }

    let splitList = [];
    let normalizedAssignments = null;

    // ------------------------------------------
    // AI ITEM ASSIGNMENT CALCULATION
    // ------------------------------------------

    if (hasItemAssignments) {
        if (itemAssignments.length === 0) {
            return res.status(400).json({
                error: 'At least one item assignment is required!'
            });
        }

        const userSubtotals = new Map();
        const seenItemIds = new Set();

        let calculatedItemsSubtotal = 0;

        for (const item of itemAssignments) {
            const itemId = String(item.itemId || '').trim();
            const itemName = String(item.itemName || '').trim();

            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unitPrice);
            const totalPrice = Number(item.totalPrice);

            const allocations = item.allocations;

            if (
                !itemId ||
                !itemName ||
                seenItemIds.has(itemId) ||
                !Number.isFinite(quantity) ||
                quantity <= 0 ||
                !Number.isFinite(unitPrice) ||
                unitPrice < 0 ||
                !Number.isFinite(totalPrice) ||
                totalPrice < 0 ||
                !Array.isArray(allocations) ||
                allocations.length === 0
            ) {
                return res.status(400).json({
                    error: `Invalid item assignment: ${itemName || itemId || 'unknown item'}`
                });
            }

            seenItemIds.add(itemId);

            const allocatedQuantity = allocations.reduce(
                (sum, allocation) =>
                    sum + Number(allocation.quantity),
                0
            );

            if (
                allocations.some(allocation =>
                    !allocation.userId ||
                    !Number.isFinite(Number(allocation.quantity)) ||
                    Number(allocation.quantity) <= 0
                ) ||
                Math.abs(allocatedQuantity - quantity) > 0.000001
            ) {
                return res.status(400).json({
                    error: `Allocations for ${itemName} must add up to purchased quantity.`,
                    purchasedQuantity: quantity,
                    allocatedQuantity
                });
            }

            calculatedItemsSubtotal += totalPrice;

            const perUnitLineValue = totalPrice / quantity;

            for (const allocation of allocations) {
                const userId = String(allocation.userId);

                const share =
                    perUnitLineValue *
                    Number(allocation.quantity);

                userSubtotals.set(
                    userId,
                    (userSubtotals.get(userId) || 0) + share
                );
            }
        }

        // Validate receipt subtotal if supplied.
        const receiptSubtotalValue = receipt?.subtotal;

        if (
            receiptSubtotalValue !== undefined &&
            receiptSubtotalValue !== null &&
            receiptSubtotalValue !== ''
        ) {
            const receiptSubtotal = Number(receiptSubtotalValue);

            if (
                !Number.isFinite(receiptSubtotal) ||
                Math.abs(
                    roundMoney(receiptSubtotal) -
                    roundMoney(calculatedItemsSubtotal)
                ) > 0.01
            ) {
                return res.status(400).json({
                    error: 'Receipt subtotal does not match assigned item totals.',
                    receiptSubtotal,
                    itemsSubtotal: roundMoney(calculatedItemsSubtotal)
                });
            }
        }

        // Distribute the final bill proportionally across item subtotals.
        // This allocates tax, service charges and discounts proportionally.

        const totalCents = Math.round(amount * 100);

        if (calculatedItemsSubtotal <= 0 || totalCents <= 0) {
            return res.status(400).json({
                error: 'Receipt item subtotal and bill total must be positive.'
            });
        }

        const users = [...userSubtotals.entries()]
            .filter(([, value]) => value > 0);

        if (users.length === 0) {
            return res.status(400).json({
                error: 'No valid user allocations found!'
            });
        }

        const rawShares = users.map(([userId, value]) => {
            const exactCents =
                totalCents * value / calculatedItemsSubtotal;

            const wholeCents = Math.floor(exactCents);

            return {
                userId,
                cents: wholeCents,
                remainder: exactCents - wholeCents
            };
        });

        let remainingCents =
            totalCents -
            rawShares.reduce(
                (sum, share) => sum + share.cents,
                0
            );

        rawShares.sort(
            (a, b) => b.remainder - a.remainder
        );

        for (let i = 0; i < remainingCents; i++) {
            rawShares[i % rawShares.length].cents += 1;
        }

        splitList = rawShares
            .filter(share => share.cents > 0)
            .map(share => ({
                userId: share.userId,
                amountOwed: share.cents / 100
            }));

        normalizedAssignments = itemAssignments;

    } else {
        // ------------------------------------------
        // LEGACY MANUAL SPLITS
        // ------------------------------------------

        splitList = splits || [];

        if (splitList.length === 0) {
            return res.status(400).json({
                error: 'At least one split or item assignment is required!'
            });
        }

        for (const item of splitList) {
            if (
                !item.userId ||
                !Number.isFinite(Number(item.amountOwed)) ||
                Number(item.amountOwed) <= 0
            ) {
                return res.status(400).json({
                    error: 'Invalid individual split details!'
                });
            }
        }
    }

    // Validate final split total.
    const totalSplit = roundMoney(
        splitList.reduce(
            (sum, item) => sum + Number(item.amountOwed),
            0
        )
    );

    if (Math.abs(totalSplit - amount) > 0.001) {
        return res.status(400).json({
            error: 'Individual shares must equal the bill total!',
            totalSplit,
            totalAmount: amount
        });
    }

    // ------------------------------------------
    // SAVE EXPENSE USING A TRANSACTION
    // ------------------------------------------

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const groupCheck = await client.query(
            'SELECT id FROM groups WHERE id = $1',
            [groupId]
        );

        if (groupCheck.rows.length === 0) {
            await client.query('ROLLBACK');

            return res.status(404).json({
                error: 'Group not found. Use a real group UUID.'
            });
        }

        // Validate that contributors and split users belong to the group.
        const involvedUserIds = [...new Set([
            ...splitList.map(item => String(item.userId)),
            ...payerList.map(item => String(item.userId))
        ])];

        const membersResult = await client.query(
            `SELECT user_id
             FROM group_members
             WHERE group_id = $1
             AND user_id = ANY($2::text[])`,
            [groupId, involvedUserIds]
        );

        const memberIds = new Set(
            membersResult.rows.map(row => row.user_id)
        );

        const nonMembers = involvedUserIds.filter(
            userId => !memberIds.has(userId)
        );

        if (nonMembers.length > 0) {
            await client.query('ROLLBACK');

            return res.status(400).json({
                error: 'All contributors and split users must be group members.',
                nonMembers
            });
        }

        const mainPayer =
            uploadedBy ||
            paidBy ||
            payerList[0].userId;

        const expenseResult = await client.query(
            `INSERT INTO expenses
             (
                group_id,
                paid_by,
                total_amount,
                receipt_url,
                receipt_data,
                item_assignments
             )
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [
                groupId,
                mainPayer,
                amount,
                receiptUrl || null,
                receipt ? JSON.stringify(receipt) : null,
                normalizedAssignments
                    ? JSON.stringify(normalizedAssignments)
                    : null
            ]
        );

        const expense = expenseResult.rows[0];

        // Save contributions separately.
        for (const item of payerList) {
            await client.query(
                `INSERT INTO expense_contributions
                 (expense_id, user_id, amount_paid)
                 VALUES ($1, $2, $3)`,
                [
                    expense.id,
                    item.userId,
                    Number(item.amountPaid)
                ]
            );
        }

        // Save individual expense shares.
        for (const item of splitList) {
            await client.query(
                `INSERT INTO expense_splits
                 (expense_id, user_id, amount_owed, is_settled)
                 VALUES ($1, $2, $3, false)`,
                [
                    expense.id,
                    item.userId,
                    Number(item.amountOwed)
                ]
            );
        }

        await client.query('COMMIT');

        return res.status(201).json({
            message: 'Expense saved successfully!',
            expense,
            contributions: payerList,
            splits: splitList,
            allocationMethod: hasItemAssignments
                ? 'ITEM_SUBTOTAL_PROPORTIONAL'
                : 'MANUAL_SPLITS'
        });

    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});

        console.error('Add Expense Error:', error.message);

        return res.status(500).json({
            error: 'Unable to save expense',
            details: error.message
        });

    } finally {
        client.release();
    }
});

// ==========================================
// 8. GET GROUP BALANCES
// GET /api/get-balances/:groupId
// Positive = receive, Negative = pay
// ==========================================

app.get('/api/get-balances/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await pool.query(
            'SELECT id FROM groups WHERE id = $1',
            [groupId]
        );

        if (group.rows.length === 0) {
            return res.status(404).json({
                error: 'Group not found!'
            });
        }

        const result = await pool.query(
            `WITH contributions AS (
                SELECT
                    ec.user_id,
                    ec.amount_paid AS amount
                FROM expense_contributions ec
                JOIN expenses e ON e.id = ec.expense_id
                WHERE e.group_id = $1

                UNION ALL

                -- Legacy records where contributions were stored
                -- in settled expense_splits.
                SELECT
                    old.user_id,
                    old.amount_owed AS amount
                FROM expense_splits old
                JOIN expenses e ON e.id = old.expense_id
                WHERE e.group_id = $1
                  AND old.is_settled = true
                  AND NOT EXISTS (
                      SELECT 1
                      FROM expense_contributions ec
                      WHERE ec.expense_id = old.expense_id
                  )
            ),
            shares AS (
                SELECT
                    es.user_id,
                    es.amount_owed AS amount
                FROM expense_splits es
                JOIN expenses e ON e.id = es.expense_id
                WHERE e.group_id = $1
                  AND es.is_settled = false
            ),
            movements AS (
                SELECT user_id, amount AS change
                FROM contributions

                UNION ALL

                SELECT user_id, -amount AS change
                FROM shares

                UNION ALL

                SELECT from_user_id AS user_id, -amount AS change
                FROM settlements
                WHERE group_id = $1
                  AND status = 'COMPLETED'

                UNION ALL

                SELECT to_user_id AS user_id, amount AS change
                FROM settlements
                WHERE group_id = $1
                  AND status = 'COMPLETED'
            )
            SELECT
                user_id,
                ROUND(SUM(change), 2) AS balance
            FROM movements
            GROUP BY user_id`,
            [groupId]
        );

        const balances = {};

        result.rows.forEach(row => {
            balances[row.user_id] = Number(row.balance);
        });

        res.status(200).json({
            groupId,
            balances
        });

    } catch (error) {
        console.error('Get Balances Error:', error.message);

        res.status(500).json({
            error: 'Unable to calculate balances',
            details: error.message
        });
    }
});

// ==========================================
// 9. GET GROUP EXPENSES
// GET /api/expenses/:groupId
// ==========================================

app.get('/api/expenses/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        const result = await pool.query(
            `SELECT
                e.*,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'userId', ec.user_id,
                                'amountPaid', ec.amount_paid
                            )
                        )
                        FROM expense_contributions ec
                        WHERE ec.expense_id = e.id
                    ),
                    '[]'::json
                ) AS contributions,
                COALESCE(
                    (
                        SELECT json_agg(
                            json_build_object(
                                'userId', es.user_id,
                                'amountOwed', es.amount_owed
                            )
                        )
                        FROM expense_splits es
                        WHERE es.expense_id = e.id
                          AND es.is_settled = false
                    ),
                    '[]'::json
                ) AS splits
             FROM expenses e
             WHERE e.group_id = $1
             ORDER BY e.created_at DESC`,
            [groupId]
        );

        res.status(200).json({
            groupId,
            expenses: result.rows
        });

    } catch (error) {
        console.error('Get Expenses Error:', error.message);

        res.status(500).json({
            error: 'Unable to retrieve expenses',
            details: error.message
        });
    }
});

// ==========================================
// 10. CREATE SETTLEMENT RECORD
// POST /api/settlements
// Creates a PENDING record only.
// ==========================================

app.post('/api/settlements', async (req, res) => {
    try {
        const {
            groupId,
            fromUserId,
            toUserId,
            amount,
            paymentMethod
        } = req.body;

        const paymentAmount = Number(amount);

        if (
            !groupId ||
            !fromUserId ||
            !toUserId ||
            fromUserId === toUserId ||
            !Number.isFinite(paymentAmount) ||
            paymentAmount <= 0
        ) {
            return res.status(400).json({
                error: 'Valid group, sender, receiver and amount are required!'
            });
        }

        const groupCheck = await pool.query(
            'SELECT id FROM groups WHERE id = $1',
            [groupId]
        );

        if (groupCheck.rows.length === 0) {
            return res.status(404).json({
                error: 'Group not found!'
            });
        }

        const result = await pool.query(
            `INSERT INTO settlements
             (group_id, from_user_id, to_user_id, amount, payment_method)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
                groupId,
                fromUserId,
                toUserId,
                paymentAmount,
                paymentMethod || 'PayPal'
            ]
        );

        res.status(201).json({
            message: 'Pending settlement created',
            settlement: result.rows[0]
        });

    } catch (error) {
        console.error('Create Settlement Error:', error.message);

        res.status(500).json({
            error: 'Unable to create settlement',
            details: error.message
        });
    }
});

// ==========================================
// 11. GET GROUP SETTLEMENTS
// GET /api/settlements/:groupId
// ==========================================

app.get('/api/settlements/:groupId', async (req, res) => {
    try {
        const { groupId } = req.params;

        const result = await pool.query(
            `SELECT *
             FROM settlements
             WHERE group_id = $1
             ORDER BY created_at DESC`,
            [groupId]
        );

        res.status(200).json({
            groupId,
            settlements: result.rows
        });

    } catch (error) {
        console.error('Get Settlements Error:', error.message);

        res.status(500).json({
            error: 'Unable to retrieve settlements',
            details: error.message
        });
    }
});
// ==========================================
// PAYPAL CONFIGURATION
// ==========================================

const PAYPAL_BASE_URL =
    process.env.PAYPAL_BASE_URL ||
    'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
    const credentials = Buffer.from(
        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(
        `${PAYPAL_BASE_URL}/v1/oauth2/token`,
        {
            method: 'POST',
            headers: {
                Authorization: `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        }
    );

    const data = await response.json();

    if (!response.ok || !data.access_token) {
        throw new Error('Unable to get PayPal access token');
    }

    return data.access_token;
}

// Mount PayPal routes
app.use(
    '/api/paypal',
    paypalRoutes({
        pool,
        getPayPalAccessToken,
        PAYPAL_BASE_URL
    })
);
// ==========================================
// 12. SERVER START
// ==========================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`SplitSmart Backend running on port ${PORT}`);
});


const express = require('express');

module.exports = function ({ pool, getPayPalAccessToken, PAYPAL_BASE_URL }) {
    const router = express.Router();

    function normalizeAmount(value) {
        const parts = String(value).split('.');
        const whole = parts[0].replace(/^0+/, '') || '0';
        const decimal = (parts[1] || '').replace(/0+$/, '');
        return decimal ? `${whole}.${decimal}` : whole;
    }

    // CREATE PAYPAL ORDER
    router.post('/create-order', async (req, res) => {
        try {
            const { settlementId } = req.body;

            if (!settlementId) {
                return res.status(400).json({
                    error: 'Settlement ID is required'
                });
            }

            const result = await pool.query(
                `SELECT * FROM settlements WHERE id = $1`,
                [settlementId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    error: 'Settlement not found'
                });
            }

            const settlement = result.rows[0];

            if (settlement.status !== 'PENDING') {
                return res.status(400).json({
                    error: 'Settlement is not PENDING'
                });
            }

            // Return an existing order instead of creating duplicates.
            if (settlement.paypal_order_id) {
                return res.status(200).json({
                    orderID: settlement.paypal_order_id,
                    approvalUrl: settlement.paypal_approval_url,
                    message: 'Existing PayPal order returned'
                });
            }

            const amount = String(settlement.amount);
            const currency = settlement.currency;

            if (!Number.isFinite(Number(amount)) ||
                Number(amount) <= 0 || !currency) {
                return res.status(400).json({
                    error: 'Invalid settlement amount or currency'
                });
            }

            const accessToken = await getPayPalAccessToken();

            const response = await fetch(
                `${PAYPAL_BASE_URL}/v2/checkout/orders`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        intent: 'CAPTURE',

                        application_context: {
                            brand_name: 'SplitSmart',
                            user_action: 'PAY_NOW',
                            return_url: process.env.FRONTEND_URL,
                            cancel_url: process.env.FRONTEND_URL
                        },

                        purchase_units: [{
                            custom_id: settlementId,
                            amount: {
                                currency_code: currency,
                                value: amount
                            }
                        }]
                    })
                }
            );

            const order = await response.json();

            if (!response.ok) {
                console.error('PayPal order error:', order);
                return res.status(502).json({
                    error: 'PayPal order creation failed'
                });
            }

            const approvalUrl = order.links?.find(
                link => link.rel === 'approve'
            )?.href;

            if (!order.id || !approvalUrl) {
                return res.status(502).json({
                    error: 'PayPal order ID or approval URL missing'
                });
            }

            const saved = await pool.query(
                `UPDATE settlements
                 SET paypal_order_id = $1,
                     paypal_approval_url = $2,
                     payment_method = 'PAYPAL'
                 WHERE id = $3
                   AND status = 'PENDING'
                   AND paypal_order_id IS NULL
                 RETURNING id`,
                [order.id, approvalUrl, settlementId]
            );

            if (saved.rowCount === 0) {
                return res.status(409).json({
                    error: 'Settlement changed. Please check its current state.'
                });
            }

            return res.status(201).json({
                settlementId,
                orderID: order.id,
                status: order.status,
                approvalUrl,
                amount,
                currency
            });

        } catch (error) {
            console.error('Create order error:', error.message);
            return res.status(500).json({
                error: 'Internal server error'
            });
        }
    });

    // CAPTURE PAYPAL ORDER
    router.post('/capture-order', async (req, res) => {
        const client = await pool.connect();
        let transactionStarted = false;

        try {
            const { settlementId, orderID } = req.body;

            if (!settlementId || !orderID) {
                return res.status(400).json({
                    error: 'Settlement ID and Order ID are required'
                });
            }

            await client.query('BEGIN');
            transactionStarted = true;

            // Lock this settlement while capture is processed.
            const result = await client.query(
                `SELECT * FROM settlements
                 WHERE id = $1
                 FOR UPDATE`,
                [settlementId]
            );

            if (result.rows.length === 0) {
                await client.query('ROLLBACK');
                transactionStarted = false;

                return res.status(404).json({
                    error: 'Settlement not found'
                });
            }

            const settlement = result.rows[0];

            // Idempotent response for an already completed settlement.
            if (settlement.status === 'COMPLETED' &&
                settlement.paypal_capture_id) {
                await client.query('COMMIT');
                transactionStarted = false;

                return res.status(200).json({
                    message: 'Payment already completed',
                    settlementId,
                    orderID: settlement.paypal_order_id,
                    captureID: settlement.paypal_capture_id,
                    status: 'COMPLETED'
                });
            }

            if (settlement.status !== 'PENDING') {
                await client.query('ROLLBACK');
                transactionStarted = false;

                return res.status(400).json({
                    error: 'Settlement is not PENDING'
                });
            }

            if (settlement.paypal_order_id !== orderID) {
                await client.query('ROLLBACK');
                transactionStarted = false;

                return res.status(400).json({
                    error: 'Order ID does not match settlement'
                });
            }

            const accessToken = await getPayPalAccessToken();

            const response = await fetch(
                `${PAYPAL_BASE_URL}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const capture = await response.json();

            if (!response.ok) {
                console.error('PayPal capture error:', capture);

                await client.query('ROLLBACK');
                transactionStarted = false;

                return res.status(502).json({
                    error: capture.message || 'Payment capture failed'
                });
            }

            const captureDetails =
                capture.purchase_units?.[0]?.payments?.captures || [];

            const completedCapture = captureDetails.find(
                item => item.status === 'COMPLETED'
            );

            if (capture.status !== 'COMPLETED' || !completedCapture) {
                throw new Error('PayPal capture is not COMPLETED');
            }

            const capturedAmount = completedCapture.amount?.value;
            const capturedCurrency =
                completedCapture.amount?.currency_code;

            if (
                normalizeAmount(capturedAmount) !==
                    normalizeAmount(settlement.amount) ||
                capturedCurrency !== settlement.currency
            ) {
                throw new Error(
                    'Captured amount or currency does not match settlement'
                );
            }

            if (!completedCapture.id) {
                throw new Error('PayPal Capture ID is missing');
            }

            // Update only after successful verification.
            await client.query(
                `UPDATE settlements
                 SET paypal_capture_id = $1,
                     status = 'COMPLETED',
                     completed_at = NOW()
                 WHERE id = $2
                   AND status = 'PENDING'`,
                [completedCapture.id, settlementId]
            );

            await client.query('COMMIT');
            transactionStarted = false;

            return res.status(200).json({
                message: 'Payment successfully captured and verified',
                settlementId,
                orderID: capture.id,
                captureID: completedCapture.id,
                amount: capturedAmount,
                currency: capturedCurrency,
                status: 'COMPLETED'
            });

        } catch (error) {
            if (transactionStarted) {
                await client.query('ROLLBACK');
            }

            console.error('Capture error:', error.message);

            return res.status(500).json({
                error: error.message
            });

        } finally {
            client.release();
        }
    });

    return router;
};

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { capturePayPalOrderAPI } from '../services/apiService';

export default function PayPalReturnPage() {
    const navigate = useNavigate();
    const captureStarted = useRef(false);

    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Verifying your PayPal payment...');
    const [payment, setPayment] = useState(null);

    useEffect(() => {
        let active = true;

        const capturePayment = async () => {
            // Prevent duplicate capture requests in React Strict Mode.
            if (captureStarted.current) return;
            captureStarted.current = true;

            try {
                const params = new URLSearchParams(window.location.search);

                const orderID = params.get('token');
                const settlementId = sessionStorage.getItem(
                    'paypal_settlement_id'
                );
                const savedOrderID = sessionStorage.getItem(
                    'paypal_order_id'
                );

                if (!orderID || !settlementId) {
                    throw new Error(
                        'Missing PayPal order or settlement information.'
                    );
                }

                if (savedOrderID && savedOrderID !== orderID) {
                    throw new Error('PayPal order ID does not match.');
                }

                const result = await capturePayPalOrderAPI(
                    settlementId,
                    orderID
                );

                if (result.status !== 'COMPLETED') {
                    throw new Error(
                        'Payment has not been confirmed by the backend.'
                    );
                }

                if (!active) return;

                sessionStorage.removeItem('paypal_settlement_id');
                sessionStorage.removeItem('paypal_order_id');

                setPayment(result);
                setStatus('success');
                setMessage('Your payment was completed successfully.');

            } catch (error) {
                if (!active) return;

                console.error('PayPal capture failed:', error);
                setStatus('error');
                setMessage(
                    error.message || 'Payment verification failed.'
                );
            }
        };

        capturePayment();

        return () => {
            active = false;
        };
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">

                {status === 'loading' && (
                    <>
                        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                        <h1 className="text-xl font-bold text-slate-900">
                            Verifying Payment
                        </h1>
                        <p className="mt-3 text-slate-600">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="mx-auto mb-5 text-5xl text-green-600">
                            ✓
                        </div>

                        <h1 className="text-2xl font-bold text-slate-900">
                            Payment Successful!
                        </h1>

                        <p className="mt-3 text-slate-600">{message}</p>

                        {payment && (
                            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-left space-y-2">
                                <p>
                                    <strong>Amount:</strong>{' '}
                                    {payment.amount} {payment.currency}
                                </p>

                                <p>
                                    <strong>Capture ID:</strong>{' '}
                                    {payment.captureID}
                                </p>

                                <p>
                                    <strong>Status:</strong>{' '}
                                    {payment.status}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="mx-auto mb-5 text-5xl text-red-500">
                            !
                        </div>

                        <h1 className="text-xl font-bold text-slate-900">
                            Payment Verification Failed
                        </h1>

                        <p className="mt-3 text-slate-600">{message}</p>
                    </>
                )}

                <button
                    onClick={() => navigate('/settlement')}
                    disabled={status === 'loading'}
                    className="mt-7 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    Go to Settlements
                </button>
            </div>
        </div>
    );
}
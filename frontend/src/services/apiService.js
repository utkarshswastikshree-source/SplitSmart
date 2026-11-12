
const API_BASE_URL = 'https://splitsmart-backend-zhwd.onrender.com';

// Frontend member IDs mapped to actual backend UUIDs
export const BACKEND_USER_IDS = {
    'user-1': '123e4567-e89b-12d3-a456-426614174000', // Rahul Sharma
    'user-2': '11111111-1111-1111-1111-111111111111', // Aman Verma
    'user-3': '22222222-2222-2222-2222-222222222222', // Kumar Mangalam
    'user-4': '33333333-3333-3333-3333-333333333333', // Priya Patel
};

// Common API request handler
async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE_URL}${endpoint} `, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            data.details ||
            `Request failed(${response.status})`
        );
    }

    return data;
}

// Create a group
export async function createGroupAPI(groupName) {
    return apiRequest('/api/create-group', {
        method: 'POST',
        body: JSON.stringify({
            groupName,
            userId: BACKEND_USER_IDS['user-1'],
        }),
    });
}

// Fetch all groups for a user
export async function getGroupsAPI(userId) {
    return apiRequest(`/ api / groups / ${userId} `);
}

// Fetch members of a group
export async function getGroupMembersAPI(groupId) {
    return apiRequest(`/ api / groups / ${groupId}/members`);
}

// Add an expense with multiple contributors
export async function addExpenseAPI({
    groupId,
    uploadedBy,
    receiptData,
    contributions,
    itemAssignments,
}) {
    return apiRequest('/api/add-expense', {
        method: 'POST',
        body: JSON.stringify({
            groupId,
            uploadedBy,
            receiptData,
            contributions,
            itemAssignments,
        }),
    });
}

// Scan receipt using the AI backend
export async function scanReceiptAPI(receiptFile) {
    const formData = new FormData();
    formData.append('receipt', receiptFile);

    const response = await fetch(
        'https://splitsmart-ai-ucf4.onrender.com/api/scan-receipt',
        {
            method: 'POST',
            body: formData,
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
        throw new Error(
            data.message ||
            data.error ||
            data.details ||
            'Receipt scanning failed.'
        );
    }

    if (!data.data || !Array.isArray(data.data.items)) {
        throw new Error('Invalid receipt data received from AI.');
    }

    return data.data;
}

// Create a pending settlement in the backend
export async function createSettlementAPI({
    groupId,
    fromUserId,
    toUserId,
    amount,
    paymentMethod = 'PAYPAL',
}) {
    return apiRequest('/api/settlements', {
        method: 'POST',
        body: JSON.stringify({
            groupId,
            fromUserId,
            toUserId,
            amount,
            paymentMethod,
        }),
    });
}

// Create PayPal order for an existing pending settlement
export async function createPayPalOrderAPI(settlementId) {
    return apiRequest('/api/paypal/create-order', {
        method: 'POST',
        body: JSON.stringify({
            settlementId,
        }),
    });
}

// Capture an approved PayPal order
export async function capturePayPalOrderAPI(settlementId, orderID) {
    return apiRequest('/api/paypal/capture-order', {
        method: 'POST',
        body: JSON.stringify({
            settlementId,
            orderID,
        }),
    });
}

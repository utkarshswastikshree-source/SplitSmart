
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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || `Request failed (${response.status})`);
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

// Add an expense
export async function addExpenseAPI({
    groupId,
    paidBy,
    totalAmount,
    receiptUrl = null,
    splits,
}) {
    return apiRequest('/api/add-expense', {
        method: 'POST',
        body: JSON.stringify({
            groupId,
            paidBy,
            totalAmount,
            receiptUrl,
            splits,
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
        throw new Error(data.message || 'Receipt scanning failed.');
    }

    return data.data;
}
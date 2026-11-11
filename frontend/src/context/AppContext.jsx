import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CURRENT_USER,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
  SAMPLE_RECEIPTS,
} from '../services/mockData';
import confetti from 'canvas-confetti';
import { createGroupAPI, addExpenseAPI, BACKEND_USER_IDS } from '../services/apiService';
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [currentGroupId, setCurrentGroupId] = useState(INITIAL_GROUPS[0].id);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [currency, setCurrency] = useState('INR');
  const [toasts, setToasts] = useState([]);

  // Active scan state: carries extracted receipt from /scan into /split
  const [activeScan, setActiveScan] = useState(null);

  // AI chat messages
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello Rahul! I'm **SplitSmart AI**, your personal expense assistant.
      
I've loaded the ledger for **Goa Trip 2024**. You can ask me questions like:
- *"Who owes me the most?"*
- *"How much did we spend on food?"*
- *"Split this bill equally except Rahul pays ₹200 extra."*
- *"Suggest optimal settlement with minimum transactions."*

How can I help you today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const currentGroup = groups.find((g) => g.id === currentGroupId) || groups[0];

  // Toast notification manager
  const addToast = ({ type = 'info', title, message, duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Add an expense using the live backend
  const addExpense = async (newExpenseData) => {
    try {
      const paidBy = BACKEND_USER_IDS[newExpenseData.paidById];

      if (!paidBy) {
        throw new Error('Invalid payer ID.');
      }

      const splits = newExpenseData.shares.map((share) => {
        const userId = BACKEND_USER_IDS[share.memberId];

        if (!userId) {
          throw new Error(`Invalid member ID: ${share.memberId}`);
        }

        return {
          userId,
          amountOwed: Number(share.amount),
        };
      });

      const response = await addExpenseAPI({
        groupId: currentGroupId,
        paidBy,
        totalAmount: Number(newExpenseData.amount),
        receiptUrl: null,
        splits,
      });

      const newExpense = {
        id: response.expense.id,
        groupId: currentGroupId,
        date: response.expense.created_at,
        status: 'Pending Settlement',
        ...newExpenseData,
      };

      setExpenses((prev) => [newExpense, ...prev]);

      setGroups((prev) =>
        prev.map((g) =>
          g.id === currentGroupId
            ? { ...g, totalExpenses: g.totalExpenses + Number(newExpense.amount) }
            : g
        )
      );

      addToast({
        type: 'success',
        title: 'Expense Added',
        message: `"${newExpense.title}" added to ${currentGroup.name}.`,
      });

      return newExpense;
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Expense Failed',
        message: error.message,
      });

      throw error;
    }
  };

  // Create a group using the live backend
  const createGroup = async (groupData) => {
    try {
      const response = await createGroupAPI(groupData.name);

      const newGroup = {
        createdAt: response.group.created_at,
        totalExpenses: 0,
        userNetBalance: 0,
        currency: currency,
        currencySymbol: currency === 'INR' ? '₹' : '$',
        coverImage: 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&auto=format&fit=crop&q=80',
        ...groupData,
        id: response.group.id,
      };

      setGroups((prev) => [newGroup, ...prev]);
      setCurrentGroupId(newGroup.id);

      addToast({
        type: 'success',
        title: 'Group Created',
        message: `"${newGroup.name}" created successfully.`,
      });

      return newGroup;
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Group Creation Failed',
        message: error.message,
      });

      throw error;
    }
  };

  // Settle a debt
  const settleDebt = ({ fromUserId, toUserId, amount, paymentMethod = 'PayPal', note = '' }) => {
    const txnId = `PAYID-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const paidAt = new Date().toISOString();

    let settlementRecord = {
      id: `settle-${Date.now()}`,
      groupId: currentGroupId,
      fromUserId,
      toUserId,
      amount: Number(amount),
      status: 'Completed',
      paymentMethod,
      paypalTxnId: txnId,
      paidAt,
      note: note || `Settlement via ${paymentMethod}`,
    };

    setSettlements((prev) => {
      // Find if an existing pending settlement matches between these two members
      const pendingIdx = prev.findIndex(
        (s) =>
          s.groupId === currentGroupId &&
          s.fromUserId === fromUserId &&
          s.toUserId === toUserId &&
          s.status === 'Pending'
      );

      if (pendingIdx !== -1) {
        const updated = [...prev];
        settlementRecord = {
          ...updated[pendingIdx],
          amount: Number(amount),
          status: 'Completed',
          paymentMethod,
          paypalTxnId: txnId,
          paidAt,
          note: note || `Settlement via ${paymentMethod}`,
        };
        updated[pendingIdx] = settlementRecord;
        return updated;
      }

      return [settlementRecord, ...prev];
    });

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#4F46E5', '#10B981', '#0070BA', '#FFC439'],
      });
    } catch (e) {
      // safe fallback
    }

    addToast({
      type: 'success',
      title: 'Payment Successful',
      message: `Settled ${currency === 'INR' ? '₹' : '$'}${amount} via ${paymentMethod}!`,
    });

    return settlementRecord;
  };

  // Add AI message to conversation
  const addAiMessage = (msg) => {
    setAiChatHistory((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...msg,
      },
    ]);
  };

  // Calculate current user's net balance across active group
  const calculateGroupBalances = (groupId = currentGroupId) => {
    const groupExpenses = expenses.filter((e) => e.groupId === groupId);
    const groupMembers = currentGroup?.members || [];

    // Net balance per member: { memberId: balance }
    // Positive means member is owed money; Negative means member owes money
    const balances = {};
    groupMembers.forEach((m) => {
      balances[m.id] = 0;
    });

    groupExpenses.forEach((exp) => {
      const payerId = exp.paidById;
      const totalAmount = Number(exp.amount);

      // Payer gets credited
      if (balances[payerId] !== undefined) {
        balances[payerId] += totalAmount;
      }

      // Each share gets debited
      if (exp.shares && exp.shares.length > 0) {
        exp.shares.forEach((share) => {
          if (balances[share.memberId] !== undefined) {
            balances[share.memberId] -= Number(share.amount);
          }
        });
      } else {
        // Equal fallback
        const perPerson = totalAmount / groupMembers.length;
        groupMembers.forEach((m) => {
          balances[m.id] -= perPerson;
        });
      }
    });

    // Factor in completed settlements
    const groupSettlements = settlements.filter(
      (s) => s.groupId === groupId && s.status === 'Completed'
    );

    groupSettlements.forEach((s) => {
      // From payer paid To receiver
      if (balances[s.fromUserId] !== undefined) {
        balances[s.fromUserId] += Number(s.amount);
      }
      if (balances[s.toUserId] !== undefined) {
        balances[s.toUserId] -= Number(s.amount);
      }
    });

    return balances;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        groups,
        setGroups,
        currentGroup,
        currentGroupId,
        setCurrentGroupId,
        createGroup,
        expenses,
        addExpense,
        settlements,
        settleDebt,
        activeScan,
        setActiveScan,
        toasts,
        addToast,
        removeToast,
        aiChatHistory,
        addAiMessage,
        currency,
        setCurrency,
        calculateGroupBalances,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}


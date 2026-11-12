
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import {
  CURRENT_USER,
  GROUP_MEMBERS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
} from '../services/mockData';

import confetti from 'canvas-confetti';

import {
  createGroupAPI,
  addExpenseAPI,
  getGroupsAPI,
  getGroupMembersAPI,
  createSettlementAPI,
  createPayPalOrderAPI,
  BACKEND_USER_IDS,
} from '../services/apiService';

const AppContext = createContext(null);

const isValidUUID = (id) =>
  typeof id === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(CURRENT_USER);
  const [groups, setGroups] = useState([]);

  const [currentGroupId, setCurrentGroupId] = useState(
    () => localStorage.getItem('splitsmart_current_group') || null
  );

  const [groupsLoading, setGroupsLoading] = useState(true);

  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [settlements, setSettlements] = useState(INITIAL_SETTLEMENTS);
  const [currency, setCurrency] = useState('INR');
  const [toasts, setToasts] = useState([]);

  const [activeScan, setActiveScan] = useState(null);

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

  // Toast notification manager
  const addToast = ({
    type = 'info',
    title,
    message,
    duration = 4000,
  }) => {
    const id = `toast-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 4)}`;

    const newToast = { id, type, title, message };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch groups and members from backend
  useEffect(() => {
    let cancelled = false;

    const fetchGroups = async () => {
      try {
        setGroupsLoading(true);

        const backendUserId =
          BACKEND_USER_IDS[currentUser.id] ||
          (isValidUUID(currentUser.id) ? currentUser.id : null);

        if (!backendUserId) {
          throw new Error('Invalid current user ID.');
        }

        const response = await getGroupsAPI(backendUserId);

        const profileMap = Object.fromEntries(
          GROUP_MEMBERS.map((member) => [
            BACKEND_USER_IDS[member.id],
            member,
          ])
        );

        const mappedGroups = await Promise.all(
          (response.groups || []).map(async (group) => {
            let members = [];

            try {
              const memberResponse = await getGroupMembersAPI(group.id);

              members = (memberResponse.members || []).map((member) => {
                const profile = profileMap[member.userId];

                return {
                  ...(profile || {}),
                  id: profile?.id || member.userId,
                  role: member.role,
                };
              });
            } catch (error) {
              console.error(
                `Failed to fetch members for ${group.id}:`,
                error
              );
            }

            return {
              id: group.id,
              name: group.name,
              description: group.description || '',
              category: group.category || 'Group',
              currency: 'INR',
              currencySymbol: '₹',
              coverImage: null,
              createdAt: group.created_at || null,
              created_by: group.created_by,
              members,
              totalExpenses: 0,
              userNetBalance: 0,
            };
          })
        );

        if (cancelled) return;

        setGroups(mappedGroups);

        setCurrentGroupId((previousId) => {
          const savedId =
            previousId ||
            localStorage.getItem('splitsmart_current_group');

          return mappedGroups.some((group) => group.id === savedId)
            ? savedId
            : mappedGroups[0]?.id || null;
        });
      } catch (error) {
        console.error('Failed to fetch groups:', error);

        if (!cancelled) {
          addToast({
            type: 'error',
            title: 'Groups Loading Failed',
            message: error.message,
          });
        }
      } finally {
        if (!cancelled) {
          setGroupsLoading(false);
        }
      }
    };

    fetchGroups();

    return () => {
      cancelled = true;
    };
  }, [currentUser.id]);

  // Save selected group ID
  useEffect(() => {
    if (isValidUUID(currentGroupId)) {
      localStorage.setItem(
        'splitsmart_current_group',
        currentGroupId
      );
    } else {
      localStorage.removeItem('splitsmart_current_group');
    }
  }, [currentGroupId]);

  const currentGroup =
    groups.find((g) => g.id === currentGroupId) || groups[0];

  // Create group using backend
  const createGroup = async (groupData) => {
    try {
      const response = await createGroupAPI(groupData.name);

      const newGroup = {
        createdAt: response.group.created_at,
        totalExpenses: 0,
        userNetBalance: 0,
        currency,
        currencySymbol: currency === 'INR' ? '₹' : '$',
        coverImage:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        ...groupData,
        id: response.group.id,
      };

      setGroups((prev) => [newGroup, ...prev]);
      setCurrentGroupId(newGroup.id);

      addToast({
        type: 'success',
        title: 'Group Created',
        message: `${newGroup.name} created successfully.`,
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

  // Add expense using backend
  const addExpense = async (newExpenseData) => {
    try {
      if (!isValidUUID(currentGroupId)) {
        throw new Error(
          'Please create or select a backend-created group before adding expenses.'
        );
      }

      const uploadedBy =
        BACKEND_USER_IDS[currentUser.id] ||
        (isValidUUID(currentUser.id) ? currentUser.id : null);

      if (!uploadedBy) {
        throw new Error('Invalid uploader ID.');
      }

      if (!newExpenseData.receiptData) {
        throw new Error('Original receipt data is missing.');
      }

      const contributions = newExpenseData.contributions.map((member) => {
        const userId =
          BACKEND_USER_IDS[member.memberId] ||
          (isValidUUID(member.memberId) ? member.memberId : null);

        const amountPaid = Number(member.amountPaid);

        if (!userId) {
          throw new Error(
            `Invalid contributor ID: ${member.memberId}`
          );
        }

        if (!Number.isFinite(amountPaid) || amountPaid < 0) {
          throw new Error(
            `Invalid contribution amount for ${member.memberId}`
          );
        }

        return {
          userId,
          amountPaid,
        };
      });

      // Filter out zero-value contributions before sending to backend.
      // Group members and item allocations remain unchanged.
      const validContributions = contributions.filter(
        (item) => Number(item.amountPaid) > 0
      );

      const itemAssignments = newExpenseData.itemAssignments.map((item) => {
        const itemId = item.itemId ?? item.id;
        const itemName = item.itemName ?? item.name;

        if (!itemId || !itemName) {
          throw new Error('Missing item ID or item name.');
        }

        const allocations = (
          Array.isArray(item.allocations) ? item.allocations : []
        ).map((allocation) => {
          const userId =
            BACKEND_USER_IDS[allocation.memberId] ||
            (isValidUUID(allocation.memberId)
              ? allocation.memberId
              : null);

          const quantity = Number(allocation.quantity);

          if (!userId) {
            throw new Error(
              `Invalid allocation member ID: ${allocation.memberId}`
            );
          }

          if (!Number.isFinite(quantity) || quantity < 0) {
            throw new Error(
              `Invalid allocation quantity for ${itemName}`
            );
          }

          return {
            userId,
            quantity,
          };
        });

        const purchasedQuantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        const totalPrice = Number(item.totalPrice);

        if (
          !Number.isFinite(purchasedQuantity) ||
          purchasedQuantity <= 0 ||
          !Number.isFinite(unitPrice) ||
          unitPrice < 0 ||
          !Number.isFinite(totalPrice) ||
          totalPrice < 0
        ) {
          throw new Error(`Invalid item details for ${itemName}`);
        }

        const allocatedQuantity = allocations.reduce(
          (sum, allocation) => sum + allocation.quantity,
          0
        );

        if (
          Math.abs(allocatedQuantity - purchasedQuantity) > 0.000001
        ) {
          throw new Error(
            `Allocated quantities for "${itemName}" must equal its purchased quantity.`
          );
        }

        return {
          itemId,
          itemName,
          quantity: purchasedQuantity,
          unitPrice,
          totalPrice,
          allocations,
        };
      });

      const response = await addExpenseAPI({
        groupId: currentGroupId,
        uploadedBy,
        totalAmount: Number(newExpenseData.totalAmount),
        receiptData: newExpenseData.receiptData,
        contributions: validContributions,
        itemAssignments,
      });

      addToast({
        type: 'success',
        title: 'Expense Request Successful',
        message: 'The backend accepted the expense request.',
      });

      return response;
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Expense Failed',
        message: error.message,
      });

      throw error;
    }
  };

  // Start real PayPal payment
  const startPayPalPayment = async ({
    fromUserId,
    toUserId,
    amount,
  }) => {
    try {
      if (!isValidUUID(currentGroupId)) {
        throw new Error('Please select a valid group.');
      }

      // Support both frontend aliases and backend UUIDs
      const backendFromUserId =
        BACKEND_USER_IDS[fromUserId] ||
        (isValidUUID(fromUserId) ? fromUserId : null);

      const backendToUserId =
        BACKEND_USER_IDS[toUserId] ||
        (isValidUUID(toUserId) ? toUserId : null);

      if (!backendFromUserId || !backendToUserId) {
        throw new Error('Invalid payer or receiver ID.');
      }

      if (backendFromUserId === backendToUserId) {
        throw new Error('Payer and receiver cannot be the same user.');
      }

      const paymentAmount = Number(amount);

      if (!Number.isFinite(paymentAmount) || paymentAmount <= 0) {
        throw new Error('Please enter a valid payment amount.');
      }

      // STEP 1: Create pending settlement
      const settlementResponse = await createSettlementAPI({
        groupId: currentGroupId,
        fromUserId: backendFromUserId,
        toUserId: backendToUserId,
        amount: paymentAmount,
        paymentMethod: 'PAYPAL',
      });

      // STEP 2: Extract settlement ID
      const settlementId = settlementResponse?.settlement?.id;

      if (!settlementId) {
        throw new Error(
          'Backend did not return a settlement ID.'
        );
      }

      // STEP 3: Create PayPal order
      const orderResponse = await createPayPalOrderAPI(settlementId);

      const {
        orderID,
        approvalUrl,
        amount: paypalAmount,
        currency: paypalCurrency,
      } = orderResponse;

      if (!orderID || !approvalUrl) {
        throw new Error('PayPal order creation failed.');
      }

      // Do not assume the PayPal currency matches the app currency.
      console.log('PayPal order details:', {
        amount: paypalAmount,
        currency: paypalCurrency,
        orderID,
        settlementId,
      });

      // STEP 4: Save IDs before redirecting
      sessionStorage.setItem(
        'paypal_settlement_id',
        settlementId
      );

      sessionStorage.setItem(
        'paypal_order_id',
        orderID
      );

      // STEP 5: Redirect to PayPal
      window.location.assign(approvalUrl);
    } catch (error) {
      console.error('PayPal payment initiation failed:', error);

      addToast({
        type: 'error',
        title: 'Payment Initialization Failed',
        message: error.message,
      });

      throw error;
    }
  };

  // Existing local mock settlement function.
  // Do not use this for real PayPal payments.
  const settleDebt = ({
    fromUserId,
    toUserId,
    amount,
    paymentMethod = 'PayPal',
    note = '',
  }) => {
    const txnId = `PAYID-${Math.random()
      .toString(36)
      .substring(2, 9)
      .toUpperCase()}`;

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

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#4F46E5', '#10B981', '#0070BA', '#FFC439'],
      });
    } catch (error) {
      console.error('Confetti animation failed:', error);
    }

    addToast({
      type: 'success',
      title: 'Payment Successful',
      message: `Settled ${currency === 'INR' ? '₹' : '$'
        }${amount} via ${paymentMethod}!`,
    });

    return settlementRecord;
  };

  // Add AI message
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

  // Calculate local demo balances
  const calculateGroupBalances = (groupId = currentGroupId) => {
    const groupExpenses = expenses.filter(
      (e) => e.groupId === groupId
    );

    const groupMembers = currentGroup?.members || [];

    const balances = {};

    groupMembers.forEach((member) => {
      balances[member.id] = 0;
    });

    groupExpenses.forEach((expense) => {
      const payerId = expense.paidById;
      const totalAmount = Number(expense.amount);

      if (balances[payerId] !== undefined) {
        balances[payerId] += totalAmount;
      }

      if (expense.shares && expense.shares.length > 0) {
        expense.shares.forEach((share) => {
          if (balances[share.memberId] !== undefined) {
            balances[share.memberId] -= Number(share.amount);
          }
        });
      } else if (groupMembers.length > 0) {
        const perPerson = totalAmount / groupMembers.length;

        groupMembers.forEach((member) => {
          balances[member.id] -= perPerson;
        });
      }
    });

    const groupSettlements = settlements.filter(
      (settlement) =>
        settlement.groupId === groupId &&
        settlement.status === 'Completed'
    );

    groupSettlements.forEach((settlement) => {
      if (balances[settlement.fromUserId] !== undefined) {
        balances[settlement.fromUserId] += Number(settlement.amount);
      }

      if (balances[settlement.toUserId] !== undefined) {
        balances[settlement.toUserId] -= Number(settlement.amount);
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
        groupsLoading,
        createGroup,
        expenses,
        addExpense,
        settlements,
        settleDebt,
        startPayPalPayment,
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

// Supabase Database & Auth Service Layer
// Future Integration Note:
// In production, connect with @supabase/supabase-js:
// import { createClient } from '@supabase/supabase-js';
// export const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

import {
  CURRENT_USER,
  INITIAL_GROUPS,
  INITIAL_EXPENSES,
  INITIAL_SETTLEMENTS,
} from './mockData';

export async function getCurrentUser() {
  await new Promise((r) => setTimeout(r, 100));
  return CURRENT_USER;
}

export async function getGroups() {
  await new Promise((r) => setTimeout(r, 200));
  return INITIAL_GROUPS;
}

export async function getGroupById(groupId) {
  await new Promise((r) => setTimeout(r, 150));
  return INITIAL_GROUPS.find((g) => g.id === groupId) || INITIAL_GROUPS[0];
}

export async function createGroup(groupData) {
  await new Promise((r) => setTimeout(r, 300));
  const newGroup = {
    id: `group-${Date.now()}`,
    createdAt: new Date().toISOString(),
    members: groupData.members || [CURRENT_USER],
    totalExpenses: 0,
    userNetBalance: 0,
    ...groupData,
  };
  return newGroup;
}

export async function getExpenses(groupId) {
  await new Promise((r) => setTimeout(r, 200));
  return INITIAL_EXPENSES.filter((e) => !groupId || e.groupId === groupId);
}

export async function createExpense(expenseData) {
  await new Promise((r) => setTimeout(r, 300));
  return {
    id: `exp-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'Pending Settlement',
    ...expenseData,
  };
}

export async function getSettlements(groupId) {
  await new Promise((r) => setTimeout(r, 150));
  return INITIAL_SETTLEMENTS.filter((s) => !groupId || s.groupId === groupId);
}

export async function recordSettlement(settlementData) {
  await new Promise((r) => setTimeout(r, 350));
  return {
    id: `settle-${Date.now()}`,
    paidAt: new Date().toISOString(),
    status: 'Completed',
    ...settlementData,
  };
}


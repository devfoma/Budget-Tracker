import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import type { Budget, Profile, ReportRange, Transaction, TransactionType } from '../types';

export const defaultProfile: Profile = {
  id: uid('user'),
  fullName: '',
  email: '',
  currency: '₦',
  monthlyIncomeEstimate: undefined,
  avatarUri: undefined,
  appLockEnabled: true,
  hasCompletedProfile: false,
};

const legacyDemoTransactionIds = new Set(['txn-1', 'txn-2', 'txn-3', 'txn-4']);
const legacyDemoBudgetIds = new Set(['budget-1', 'budget-2', 'budget-3']);

export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function formatMoney(amount: number, currency = '₦') {
  return `${currency || '₦'}${Math.round(amount).toLocaleString('en-NG')}`;
}

export function sumTransactions(transactions: Transaction[], type: TransactionType) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');
  return initials.toUpperCase() || 'U';
}

export function getCompactCategoryName(category: string) {
  const compactNames: Record<string, string> = {
    Transport: 'Transp.',
    Shopping: 'Shop',
    Savings: 'Save',
    Business: 'Biz',
    Allowance: 'Allow.',
  };
  return compactNames[category] ?? category;
}

export function normalizeProfile(profile: Partial<Profile> | null): Profile {
  const fullName = profile?.fullName?.trim() ?? '';
  return {
    ...defaultProfile,
    ...profile,
    id: profile?.id || uid('user'),
    fullName,
    currency: profile?.currency || '₦',
    hasCompletedProfile: Boolean(profile?.hasCompletedProfile || (fullName && fullName !== 'Alex' && fullName !== 'User')),
  };
}

export function getRangeDays(range: ReportRange) {
  switch (range) {
    case 'Week':
      return 7;
    case 'Year':
      return 365;
    case 'Month':
    default:
      return 30;
  }
}

export function getTransactionsInRange(transactions: Transaction[], range: ReportRange, periodOffset = 0) {
  const rangeMs = getRangeDays(range) * 24 * 60 * 60 * 1000;
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const endTime = end.getTime() - rangeMs * periodOffset;
  const startTime = endTime - rangeMs;

  return transactions.filter((transaction) => {
    const time = new Date(transaction.date).getTime();
    return time > startTime && time <= endTime;
  });
}

export function getSavingsRate(income: number, expenses: number) {
  if (income <= 0) {
    return 0;
  }
  return Math.round((Math.max(0, income - expenses) / income) * 100);
}

export function getExpenseChange(currentExpenses: number, previousExpenses: number) {
  if (previousExpenses <= 0) {
    return currentExpenses > 0 ? 100 : 0;
  }
  return Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100);
}

export function formatChange(change: number) {
  return `${change > 0 ? '+' : ''}${change}%`;
}

export function getAverageDailyExpense(transactions: Transaction[], expenses: number) {
  if (transactions.length === 0 || expenses <= 0) {
    return 0;
  }
  const times = transactions.map((transaction) => new Date(transaction.date).getTime());
  const first = Math.min(...times);
  const last = Math.max(...times);
  const days = Math.max(1, Math.ceil((last - first) / (24 * 60 * 60 * 1000)) + 1);
  return expenses / days;
}

export function getBudgetStatus(budget: Budget, spent: number) {
  const progress = spent / budget.limit;
  if (spent > budget.limit) {
    return {
      isPassed: true,
      isWarning: true,
      progress,
      overBy: spent - budget.limit,
    };
  }

  return {
    isPassed: false,
    isWarning: progress >= budget.threshold / 100,
    progress,
    overBy: 0,
  };
}

export function getFinancialHealthLabel(income: number, expenses: number, budgets: Budget[]) {
  if (income <= 0 && expenses <= 0 && budgets.length === 0) {
    return 'Financial health: waiting for data';
  }
  if (income > 0 && expenses <= income) {
    return 'Financial health: steady';
  }
  if (expenses > income) {
    return 'Financial health: needs attention';
  }
  return 'Financial health: building history';
}

export function buildTrendPoints(transactions: Transaction[], range: ReportRange) {
  const buckets = range === 'Week' ? 7 : range === 'Month' ? 6 : 12;
  const bucketTotals = Array.from({ length: buckets }, () => 0);
  const rangeMs = getRangeDays(range) * 24 * 60 * 60 * 1000;
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const endTime = now.getTime();
  const startTime = endTime - rangeMs;
  const bucketMs = rangeMs / buckets;

  transactions
    .filter((transaction) => transaction.type === 'expense')
    .forEach((transaction) => {
      const time = new Date(transaction.date).getTime();
      const index = Math.min(buckets - 1, Math.max(0, Math.floor((time - startTime) / bucketMs)));
      bucketTotals[index] += transaction.amount;
    });

  const max = Math.max(...bucketTotals);
  if (max <= 0) {
    return Array.from({ length: buckets }, (_, index) => {
      const x = 8 + (284 / Math.max(1, buckets - 1)) * index;
      return `${Math.round(x)},124`;
    }).join(' ');
  }

  return bucketTotals
    .map((amount, index) => {
      const x = 8 + (284 / Math.max(1, buckets - 1)) * index;
      const y = 132 - (amount / max) * 96;
      return `${Math.round(x)},${Math.round(y)}`;
    })
    .join(' ');
}

export function escapeCsvValue(value: string | number | undefined) {
  const stringValue = value === undefined ? '' : String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export function buildReportCsv({
  profile,
  range,
  transactions,
  budgets,
  income,
  expenses,
  balance,
}: {
  profile: Profile;
  range: ReportRange;
  transactions: Transaction[];
  budgets: Budget[];
  income: number;
  expenses: number;
  balance: number;
}) {
  const budgetRows = budgets.map((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((total, transaction) => total + transaction.amount, 0);
    const status = getBudgetStatus(budget, spent);
    return [
      budget.name,
      budget.category,
      budget.limit,
      spent,
      Math.max(0, budget.limit - spent),
      status.isPassed ? 'Passed' : status.isWarning ? 'Warning' : 'On track',
    ];
  });

  const rows = [
    ['Budget Tracker Report'],
    ['User', profile.fullName || 'User'],
    ['Range', range],
    ['Generated At', new Date().toLocaleString()],
    [],
    ['Summary'],
    ['Total Income', income],
    ['Total Expenses', expenses],
    ['Balance', balance],
    [],
    ['Budgets'],
    ['Name', 'Category', 'Limit', 'Spent', 'Remaining', 'Status'],
    ...budgetRows,
    [],
    ['Transactions'],
    ['Date', 'Type', 'Category', 'Description', 'Method', 'Amount'],
    ...transactions.map((transaction) => [
      new Date(transaction.date).toLocaleString(),
      transaction.type,
      transaction.category,
      transaction.description,
      transaction.method,
      transaction.amount,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvValue).join(',')).join('\n');
}

export async function shareReportCsv(csv: string, range: ReportRange) {
  const fileName = `budget-tracker-${range.toLowerCase()}-report.csv`;
  const file = new FileSystem.File(FileSystem.Paths.cache, fileName);
  file.create({ overwrite: true, intermediates: true });
  file.write(csv);

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/csv',
      dialogTitle: 'Download Budget Tracker report',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    Alert.alert('Report ready', `CSV saved to ${file.uri}`);
  }
}

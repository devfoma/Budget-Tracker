import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { expenseCategories, legacyDemoBudgetIds, legacyDemoTransactionIds, storageKeys } from '../constants';
import { colors } from '../theme';
import type { AppData, Budget, Profile, Transaction } from '../types';
import { defaultProfile, normalizeProfile, sumTransactions, uid } from '../utils/finance';
import { styles } from '../styles';

const DataContext = createContext<AppData | null>(null);

export function useAppData() {
  const data = useContext(DataContext);
  if (!data) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return data;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alertsRead, setAlertsRead] = useState(false);

  useEffect(() => {
    async function load() {
      const [storedProfile, storedTransactions, storedBudgets] = await Promise.all([
        AsyncStorage.getItem(storageKeys.profile),
        AsyncStorage.getItem(storageKeys.transactions),
        AsyncStorage.getItem(storageKeys.budgets),
      ]);

      if (storedProfile) {
        setProfile(normalizeProfile(JSON.parse(storedProfile) as Partial<Profile>));
      } else {
        const freshProfile = normalizeProfile(null);
        setProfile(freshProfile);
        await AsyncStorage.setItem(storageKeys.profile, JSON.stringify(freshProfile));
      }

      if (storedTransactions) {
        setTransactions(
          (JSON.parse(storedTransactions) as Transaction[]).filter(
            (transaction) => !legacyDemoTransactionIds.has(transaction.id),
          ),
        );
      }
      if (storedBudgets) {
        setBudgets((JSON.parse(storedBudgets) as Budget[]).filter((budget) => !legacyDemoBudgetIds.has(budget.id)));
      }
      setReady(true);
    }

    void load();
  }, []);

  useEffect(() => {
    if (ready) {
      void AsyncStorage.setItem(storageKeys.transactions, JSON.stringify(transactions));
    }
  }, [ready, transactions]);

  useEffect(() => {
    if (ready) {
      void AsyncStorage.setItem(storageKeys.budgets, JSON.stringify(budgets));
    }
  }, [ready, budgets]);

  useEffect(() => {
    if (ready) {
      void AsyncStorage.setItem(storageKeys.profile, JSON.stringify(profile));
    }
  }, [ready, profile]);

  const value = useMemo<AppData>(
    () => ({
      profile,
      transactions,
      budgets,
      alertsRead,
      addTransaction: (transaction) => {
        setTransactions((current) => [
          {
            id: uid('txn'),
            date: new Date().toISOString(),
            edited: false,
            ...transaction,
          },
          ...current,
        ]);
        setAlertsRead(false);
      },
      updateTransaction: (id, transactionUpdates) => {
        setTransactions((current) =>
          current.map((transaction) =>
            transaction.id === id && !transaction.edited
              ? {
                  ...transaction,
                  ...transactionUpdates,
                  edited: true,
                }
              : transaction,
          ),
        );
        setAlertsRead(false);
      },
      addBudget: (budget) => {
        setBudgets((current) => [{ id: uid('budget'), ...budget }, ...current]);
        setAlertsRead(false);
      },
      updateBudget: (id, budgetUpdates) => {
        setBudgets((current) =>
          current.map((budget) =>
            budget.id === id
              ? {
                  ...budget,
                  ...budgetUpdates,
                }
              : budget,
          ),
        );
        setAlertsRead(false);
      },
      updateProfile: (profileUpdates) => {
        setProfile((current) =>
          normalizeProfile({
            ...current,
            ...profileUpdates,
            hasCompletedProfile: true,
          }),
        );
      },
      toggleAppLock: () => {
        setProfile((current) => ({ ...current, appLockEnabled: !current.appLockEnabled }));
      },
      markAlertsRead: () => setAlertsRead(true),
    }),
    [alertsRead, budgets, profile, transactions],
  );

  if (!ready) {
    return (
      <LinearGradient colors={['#07111f', '#0b1326', '#10231f']} style={styles.shell}>
        <View style={styles.loadingWrap}>
          <ShieldCheck color={colors.primary} size={34} />
          <Text style={styles.loadingTitle}>Budget Tracker</Text>
          <Text style={styles.loadingText}>Preparing your local workspace</Text>
        </View>
      </LinearGradient>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useSummary() {
  const { transactions, budgets } = useAppData();
  const income = sumTransactions(transactions, 'income');
  const expenses = sumTransactions(transactions, 'expense');
  const balance = income - expenses;
  const spentByCategory = expenseCategories.map((category) => ({
    category,
    amount: transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0),
  }));
  const topCategory = [...spentByCategory].sort((a, b) => b.amount - a.amount)[0];
  const budgetTotal = budgets.reduce((total, budget) => total + budget.limit, 0);
  const budgetSpent = budgets.reduce((total, budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    return total + spent;
  }, 0);

  return { income, expenses, balance, spentByCategory, topCategory, budgetTotal, budgetSpent };
}

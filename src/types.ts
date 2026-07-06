import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Dashboard: undefined;
  Activity: undefined;
  Add: undefined;
  Budgets: undefined;
  Reports: undefined;
};

export type ScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;
export type TransactionType = 'income' | 'expense';
export type ReportRange = 'Week' | 'Month' | 'Year';

export type Profile = {
  id: string;
  fullName: string;
  email?: string;
  currency: string;
  monthlyIncomeEstimate?: number;
  avatarUri?: string;
  appLockEnabled: boolean;
  hasCompletedProfile: boolean;
};

export type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  method: string;
  date: string;
  edited?: boolean;
};

export type Budget = {
  id: string;
  name: string;
  category: string;
  limit: number;
  threshold: number;
};

export type AppData = {
  profile: Profile;
  transactions: Transaction[];
  budgets: Budget[];
  alertsRead: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'edited'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id' | 'date' | 'edited'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  updateBudget: (id: string, budget: Omit<Budget, 'id'>) => void;
  updateProfile: (profile: Partial<Profile>) => void;
  toggleAppLock: () => void;
  markAlertsRead: () => void;
};

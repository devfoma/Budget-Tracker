import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNavigationContainerRef,
  NavigationContainer,
  RouteProp,
} from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Bell,
  Bus,
  Calendar,
  CheckCircle,
  ChevronRight,
  CirclePlus,
  Filter,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  LayoutDashboard,
  LockKeyhole,
  MoreHorizontal,
  PiggyBank,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Tags,
  TrendingUp,
  User,
  Utensils,
  Wallet,
  Wifi,
  X,
} from 'lucide-react-native';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  DimensionValue,
  Easing,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { SafeAreaProvider } from 'react-native-safe-area-context';

type RootTabParamList = {
  Dashboard: undefined;
  Activity: undefined;
  Add: undefined;
  Budgets: undefined;
  Reports: undefined;
};

type ScreenProps<T extends keyof RootTabParamList> = BottomTabScreenProps<RootTabParamList, T>;
type TransactionType = 'income' | 'expense';
type ReportRange = 'Week' | 'Month' | 'Year';

type Profile = {
  id: string;
  fullName: string;
  currency: string;
  appLockEnabled: boolean;
};

type Transaction = {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  method: string;
  date: string;
};

type Budget = {
  id: string;
  name: string;
  category: string;
  limit: number;
  threshold: number;
};

type AppData = {
  profile: Profile;
  transactions: Transaction[];
  budgets: Budget[];
  alertsRead: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  clearDemoData: () => void;
  toggleAppLock: () => void;
  markAlertsRead: () => void;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const navigationRef = createNavigationContainerRef<RootTabParamList>();
const DataContext = createContext<AppData | null>(null);

const storageKeys = {
  profile: 'budget-tracker.profile',
  transactions: 'budget-tracker.transactions',
  budgets: 'budget-tracker.budgets',
  tour: 'budget-tracker.tour-complete',
};

const colors = {
  background: '#0b1326',
  surface: '#151e33',
  surfaceStrong: '#1c2840',
  border: 'rgba(218, 226, 253, 0.14)',
  text: '#eef4ff',
  muted: '#b9c5d6',
  soft: '#7f8da3',
  primary: '#4edea3',
  primaryDim: '#103f38',
  expense: '#ffb3b0',
  warning: '#f9bd22',
  blue: '#8ea7ff',
};

const expenseCategories = ['Food', 'Transport', 'School', 'Bills', 'Health', 'Shopping', 'Data', 'Savings'];
const incomeCategories = ['Salary', 'Allowance', 'Gift', 'Business'];
const methods = ['Cash', 'Transfer', 'Card', 'POS'];

const seedTransactions: Transaction[] = [
  {
    id: 'txn-1',
    type: 'expense',
    amount: 8500,
    category: 'Food',
    description: 'Groceries',
    method: 'Card',
    date: '2026-07-03T08:45:00.000Z',
  },
  {
    id: 'txn-2',
    type: 'income',
    amount: 300000,
    category: 'Salary',
    description: 'Monthly salary',
    method: 'Transfer',
    date: '2026-07-02T16:00:00.000Z',
  },
  {
    id: 'txn-3',
    type: 'expense',
    amount: 120000,
    category: 'Bills',
    description: 'Rent payment',
    method: 'Transfer',
    date: '2026-07-01T10:00:00.000Z',
  },
  {
    id: 'txn-4',
    type: 'expense',
    amount: 4500,
    category: 'Transport',
    description: 'Bus fare',
    method: 'Cash',
    date: '2026-07-01T07:35:00.000Z',
  },
];

const seedBudgets: Budget[] = [
  { id: 'budget-1', name: 'Food & Groceries', category: 'Food', limit: 50000, threshold: 80 },
  { id: 'budget-2', name: 'Transport', category: 'Transport', limit: 30000, threshold: 75 },
  { id: 'budget-3', name: 'Bills', category: 'Bills', limit: 150000, threshold: 85 },
];

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number) {
  return `NGN ${Math.round(amount).toLocaleString('en-NG')}`;
}

function getCategoryIcon(category: string) {
  switch (category) {
    case 'Food':
      return Utensils;
    case 'Transport':
      return Bus;
    case 'School':
      return GraduationCap;
    case 'Bills':
      return Home;
    case 'Health':
      return HeartPulse;
    case 'Shopping':
      return ShoppingBag;
    case 'Data':
      return Wifi;
    case 'Savings':
      return PiggyBank;
    case 'Salary':
    case 'Allowance':
    case 'Business':
      return Wallet;
    case 'Gift':
      return Gift;
    default:
      return MoreHorizontal;
  }
}

function useAppData() {
  const data = useContext(DataContext);
  if (!data) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }
  return data;
}

function AppDataProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    id: uid('user'),
    fullName: 'Alex',
    currency: 'NGN',
    appLockEnabled: true,
  });
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [budgets, setBudgets] = useState<Budget[]>(seedBudgets);
  const [alertsRead, setAlertsRead] = useState(false);

  useEffect(() => {
    async function load() {
      const [storedProfile, storedTransactions, storedBudgets] = await Promise.all([
        AsyncStorage.getItem(storageKeys.profile),
        AsyncStorage.getItem(storageKeys.transactions),
        AsyncStorage.getItem(storageKeys.budgets),
      ]);

      if (storedProfile) {
        setProfile(JSON.parse(storedProfile) as Profile);
      } else {
        const freshProfile = {
          id: uid('user'),
          fullName: 'Alex',
          currency: 'NGN',
          appLockEnabled: true,
        };
        setProfile(freshProfile);
        await AsyncStorage.setItem(storageKeys.profile, JSON.stringify(freshProfile));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions) as Transaction[]);
      }
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets) as Budget[]);
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
            ...transaction,
          },
          ...current,
        ]);
        setAlertsRead(false);
      },
      addBudget: (budget) => {
        setBudgets((current) => [{ id: uid('budget'), ...budget }, ...current]);
      },
      clearDemoData: () => {
        setTransactions(seedTransactions);
        setBudgets(seedBudgets);
        setAlertsRead(false);
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
      <GradientShell>
        <View style={styles.loadingWrap}>
          <Sparkles color={colors.primary} size={34} />
          <Text style={styles.loadingTitle}>Budget Tracker</Text>
          <Text style={styles.loadingText}>Preparing your local workspace</Text>
        </View>
      </GradientShell>
    );
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function useSummary() {
  const { transactions, budgets } = useAppData();
  const income = transactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((total, transaction) => total + transaction.amount, 0);
  const expenses = transactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((total, transaction) => total + transaction.amount, 0);
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

function hapticTap() {
  void Haptics.selectionAsync();
}

function GradientShell({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={['#07111f', '#0b1326', '#10231f']} style={styles.shell}>
      {children}
    </LinearGradient>
  );
}

function ScreenShell({
  title,
  subtitle,
  children,
  rightAction,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightAction?: ReactNode;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY]);

  return (
    <GradientShell>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>Budget Tracker</Text>
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightAction}
        </View>
        <Animated.View style={[styles.animatedBody, { opacity, transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </SafeAreaView>
    </GradientShell>
  );
}

function GlassCard({ children, tone = 'default' }: { children: ReactNode; tone?: 'default' | 'accent' | 'warning' }) {
  const style = tone === 'accent' ? styles.cardAccent : tone === 'warning' ? styles.cardWarning : styles.card;
  return (
    <BlurView intensity={26} tint="dark" style={style}>
      {children}
    </BlurView>
  );
}

function IconButton({
  icon,
  label,
  onPress,
  active = false,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, active && styles.iconButtonActive, pressed && styles.pressed]}
    >
      {icon}
    </Pressable>
  );
}

function PillButton({
  label,
  onPress,
  active = false,
  danger = false,
}: {
  label: string;
  onPress: () => void;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.pill,
        active && styles.pillActive,
        danger && styles.pillDanger,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.pillText, active && styles.pillTextActive, danger && styles.pillTextDanger]}>{label}</Text>
    </Pressable>
  );
}

function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.primaryButton,
        disabled && styles.primaryButtonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {icon}
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function MiniStat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'good' | 'bad' }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.kicker}>{label}</Text>
      <Text style={[styles.miniStatValue, tone === 'good' && styles.goodText, tone === 'bad' && styles.badText]}>
        {value}
      </Text>
    </View>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const Icon = getCategoryIcon(category);
  return (
    <View style={styles.categoryBadge}>
      <Icon color={colors.primary} size={18} />
      <Text style={styles.categoryBadgeText}>{category}</Text>
    </View>
  );
}

function ProgressBar({ progress, warning = false }: { progress: number; warning?: boolean }) {
  const width = `${Math.min(100, Math.max(4, progress * 100))}%` as DimensionValue;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, warning && styles.progressWarning, { width }]} />
    </View>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const Icon = getCategoryIcon(transaction.category);
  const isIncome = transaction.type === 'income';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={hapticTap}
      style={({ pressed }) => [styles.transactionRow, pressed && styles.pressed]}
    >
      <View style={styles.transactionIcon}>
        <Icon color={isIncome ? colors.primary : colors.muted} size={22} />
      </View>
      <View style={styles.transactionMiddle}>
        <Text style={styles.transactionTitle}>{transaction.description}</Text>
        <Text style={styles.transactionMeta}>
          {transaction.method} - {transaction.category}
        </Text>
      </View>
      <View style={styles.transactionAmountWrap}>
        <Text style={[styles.transactionAmount, isIncome ? styles.goodText : styles.badText]}>
          {isIncome ? '+' : '-'} {formatMoney(transaction.amount)}
        </Text>
        <Text style={styles.transactionTime}>
          {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </Pressable>
  );
}

function DashboardScreen({ navigation }: ScreenProps<'Dashboard'>) {
  const { profile, transactions, budgets, alertsRead, markAlertsRead } = useAppData();
  const { income, expenses, balance, spentByCategory } = useSummary();
  const [showAlerts, setShowAlerts] = useState(false);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulse]);

  const budgetWarnings = budgets.filter((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((total, transaction) => total + transaction.amount, 0);
    return spent / budget.limit >= budget.threshold / 100;
  });

  return (
    <ScreenShell
      title={`Hello, ${profile.fullName}`}
      subtitle="Your money snapshot is ready."
      rightAction={
        <View style={styles.headerActions}>
          <IconButton
            label="View notifications"
            onPress={() => {
              setShowAlerts((current) => !current);
              markAlertsRead();
            }}
            active={!alertsRead && budgetWarnings.length > 0}
            icon={<Bell color={colors.primary} size={22} />}
          />
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {showAlerts ? (
          <GlassCard tone={budgetWarnings.length > 0 ? 'warning' : 'accent'}>
            <View style={styles.rowBetween}>
              <View style={styles.rowSmall}>
                {budgetWarnings.length > 0 ? (
                  <AlertTriangle color={colors.warning} size={20} />
                ) : (
                  <CheckCircle color={colors.primary} size={20} />
                )}
                <Text style={styles.cardTitle}>{budgetWarnings.length > 0 ? 'Budget alert' : 'All clear'}</Text>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setShowAlerts(false)}>
                <X color={colors.muted} size={20} />
              </Pressable>
            </View>
            <Text style={styles.bodyText}>
              {budgetWarnings.length > 0
                ? `${budgetWarnings[0].name} is close to its alert threshold.`
                : 'No active budget warnings right now.'}
            </Text>
          </GlassCard>
        ) : null}

        <GlassCard tone="accent">
          <Text style={styles.kicker}>Total balance</Text>
          <Text style={styles.balance}>{formatMoney(balance)}</Text>
          <View style={styles.statRow}>
            <MiniStat label="Income" value={formatMoney(income)} tone="good" />
            <MiniStat label="Expense" value={formatMoney(expenses)} tone="bad" />
          </View>
        </GlassCard>

        <View style={styles.twoColumn}>
          <GlassCard>
            <Text style={styles.cardTitle}>Spending</Text>
            <View style={styles.categoryList}>
              {spentByCategory
                .filter((item) => item.amount > 0)
                .slice(0, 3)
                .map((item) => (
                  <View key={item.category} style={styles.rowBetween}>
                    <CategoryBadge category={item.category} />
                    <Text style={styles.amountSmall}>{formatMoney(item.amount)}</Text>
                  </View>
                ))}
            </View>
          </GlassCard>
          <View style={styles.sideStack}>
            <GlassCard>
              <Text style={styles.kicker}>Daily avg</Text>
              <Text style={styles.sideValue}>{formatMoney(Math.max(0, expenses / 7))}</Text>
            </GlassCard>
            <GlassCard tone="accent">
              <Text style={styles.kicker}>Savings rate</Text>
              <Text style={styles.sideValue}>+12%</Text>
            </GlassCard>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active budgets</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Budgets')}>
            <Text style={styles.linkText}>View all</Text>
          </Pressable>
        </View>
        {budgets.slice(0, 2).map((budget) => {
          const spent = transactions
            .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
            .reduce((total, transaction) => total + transaction.amount, 0);
          const progress = spent / budget.limit;
          return (
            <GlassCard key={budget.id}>
              <View style={styles.rowBetween}>
                <CategoryBadge category={budget.category} />
                <Text style={styles.amountSmall}>
                  {formatMoney(spent)} / {formatMoney(budget.limit)}
                </Text>
              </View>
              <ProgressBar progress={progress} warning={progress >= budget.threshold / 100} />
              <Text style={styles.mutedText}>{Math.round(progress * 100)}% used</Text>
            </GlassCard>
          );
        })}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.linkText}>History</Text>
          </Pressable>
        </View>
        <GlassCard>
          {transactions.slice(0, 3).map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </GlassCard>
      </ScrollView>
      <Animated.View style={[styles.floatingAdd, { transform: [{ scale: pulse }] }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add transaction"
          onPress={() => {
            hapticTap();
            navigation.navigate('Add');
          }}
          style={styles.floatingAddButton}
        >
          <Plus color="#06251a" size={30} />
        </Pressable>
      </Animated.View>
    </ScreenShell>
  );
}

function ActivityScreen({ navigation }: ScreenProps<'Activity'>) {
  const { transactions } = useAppData();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  const filtered = transactions.filter((transaction) => {
    const matchesQuery =
      transaction.description.toLowerCase().includes(query.toLowerCase()) ||
      transaction.category.toLowerCase().includes(query.toLowerCase());
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || transaction.category === categoryFilter;
    const matchesMethod = methodFilter === 'All' || transaction.method === methodFilter;
    return matchesQuery && matchesType && matchesCategory && matchesMethod;
  });

  return (
    <ScreenShell
      title="Activity"
      subtitle="Search and filter local records."
      rightAction={
        <IconButton
          label="Add transaction"
          onPress={() => navigation.navigate('Add')}
          icon={<CirclePlus color={colors.primary} size={22} />}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.searchBox}>
          <Search color={colors.soft} size={20} />
          <TextInput
            placeholder="Search transactions"
            placeholderTextColor={colors.soft}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <PillButton
            label={typeFilter === 'all' ? 'Type' : typeFilter}
            onPress={() => setTypeFilter(typeFilter === 'all' ? 'income' : typeFilter === 'income' ? 'expense' : 'all')}
            active={typeFilter !== 'all'}
          />
          <PillButton
            label={categoryFilter === 'All' ? 'Category' : categoryFilter}
            onPress={() => {
              const options = ['All', ...expenseCategories, ...incomeCategories];
              const next = (options.indexOf(categoryFilter) + 1) % options.length;
              setCategoryFilter(options[next]);
            }}
            active={categoryFilter !== 'All'}
          />
          <PillButton
            label={methodFilter === 'All' ? 'Method' : methodFilter}
            onPress={() => {
              const options = ['All', ...methods];
              const next = (options.indexOf(methodFilter) + 1) % options.length;
              setMethodFilter(options[next]);
            }}
            active={methodFilter !== 'All'}
          />
          <PillButton
            label="Reset"
            onPress={() => {
              setQuery('');
              setTypeFilter('all');
              setCategoryFilter('All');
              setMethodFilter('All');
            }}
          />
        </ScrollView>

        <GlassCard>
          <View style={styles.rowSmall}>
            <Calendar color={colors.primary} size={20} />
            <Text style={styles.cardTitle}>Transactions</Text>
          </View>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Filter color={colors.soft} size={28} />
              <Text style={styles.emptyTitle}>No matching records</Text>
              <Text style={styles.bodyText}>Try changing a filter or add a new transaction.</Text>
            </View>
          ) : (
            filtered.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)
          )}
        </GlassCard>
      </ScrollView>
    </ScreenShell>
  );
}

function AddScreen({ navigation }: ScreenProps<'Add'>) {
  const { addTransaction } = useAppData();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [method, setMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const parsedAmount = Number(amount.replace(/,/g, ''));
  const canSave = parsedAmount > 0 && description.trim().length > 0;

  useEffect(() => {
    setCategory(type === 'income' ? 'Salary' : 'Food');
  }, [type]);

  function save() {
    if (!canSave) {
      return;
    }
    addTransaction({
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      method,
    });
    setAmount('');
    setDescription('');
    navigation.navigate('Dashboard');
  }

  return (
    <ScreenShell title="Add transaction" subtitle="Keep entries short and clear.">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GlassCard tone="accent">
          <View style={styles.segment}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setType('expense')}
              style={[styles.segmentItem, type === 'expense' && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setType('income')}
              style={[styles.segmentItem, type === 'income' && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, type === 'income' && styles.segmentTextActive]}>Income</Text>
            </Pressable>
          </View>
          <Text style={styles.inputLabel}>Amount</Text>
          <TextInput
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.soft}
            value={amount}
            onChangeText={setAmount}
            style={styles.amountInput}
          />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            placeholder={type === 'income' ? 'Salary, gift, allowance' : 'Groceries, transport, rent'}
            placeholderTextColor={colors.soft}
            value={description}
            onChangeText={setDescription}
            style={styles.textInput}
          />
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Category</Text>
          <View style={styles.wrapRow}>
            {categories.map((item) => (
              <PillButton key={item} label={item} onPress={() => setCategory(item)} active={category === item} />
            ))}
          </View>
        </GlassCard>

        <GlassCard>
          <Text style={styles.cardTitle}>Payment method</Text>
          <View style={styles.wrapRow}>
            {methods.map((item) => (
              <PillButton key={item} label={item} onPress={() => setMethod(item)} active={method === item} />
            ))}
          </View>
        </GlassCard>

        <PrimaryButton
          label="Save transaction"
          onPress={save}
          disabled={!canSave}
          icon={<CheckCircle color="#06251a" size={20} />}
        />
      </ScrollView>
    </ScreenShell>
  );
}

function BudgetsScreen() {
  const { budgets, transactions, addBudget } = useAppData();
  const { budgetTotal, budgetSpent } = useSummary();
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [threshold, setThreshold] = useState(80);
  const parsedAmount = Number(amount.replace(/,/g, ''));

  function createBudget() {
    if (parsedAmount <= 0) {
      return;
    }
    addBudget({
      name: `${category} Budget`,
      category,
      limit: parsedAmount,
      threshold,
    });
    setAmount('');
    setThreshold(80);
    setCategory('Food');
    setModalVisible(false);
  }

  return (
    <ScreenShell
      title="Budgets"
      subtitle="Track spending before it surprises you."
      rightAction={
        <IconButton
          label="Create budget"
          onPress={() => setModalVisible(true)}
          icon={<CirclePlus color={colors.primary} size={22} />}
        />
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <GlassCard tone="accent">
          <Text style={styles.kicker}>Total budgeted</Text>
          <Text style={styles.balance}>{formatMoney(budgetTotal)}</Text>
          <View style={styles.statRow}>
            <MiniStat label="Spent" value={formatMoney(budgetSpent)} tone="bad" />
            <MiniStat label="Remaining" value={formatMoney(Math.max(0, budgetTotal - budgetSpent))} tone="good" />
          </View>
        </GlassCard>

        {budgets.map((budget) => {
          const spent = transactions
            .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
            .reduce((total, transaction) => total + transaction.amount, 0);
          const progress = spent / budget.limit;
          const isWarning = progress >= budget.threshold / 100;
          return (
            <GlassCard key={budget.id} tone={isWarning ? 'warning' : 'default'}>
              <View style={styles.rowBetween}>
                <CategoryBadge category={budget.category} />
                <Text style={[styles.percentText, isWarning && styles.warningText]}>{Math.round(progress * 100)}%</Text>
              </View>
              <Text style={styles.budgetName}>{budget.name}</Text>
              <Text style={styles.bodyText}>
                {formatMoney(spent)} spent from {formatMoney(budget.limit)}
              </Text>
              <ProgressBar progress={progress} warning={isWarning} />
              <Text style={styles.mutedText}>Alert at {budget.threshold}%</Text>
            </GlassCard>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={() => setModalVisible(true)}
          style={({ pressed }) => [styles.createBudgetCard, pressed && styles.pressed]}
        >
          <CirclePlus color={colors.primary} size={34} />
          <Text style={styles.createBudgetText}>Create new budget</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>New budget</Text>
              <Pressable accessibilityRole="button" onPress={() => setModalVisible(false)}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.wrapRow}>
              {expenseCategories.slice(0, 6).map((item) => (
                <PillButton key={item} label={item} onPress={() => setCategory(item)} active={category === item} />
              ))}
            </View>
            <Text style={styles.inputLabel}>Limit</Text>
            <TextInput
              keyboardType="numeric"
              placeholder="50000"
              placeholderTextColor={colors.soft}
              value={amount}
              onChangeText={setAmount}
              style={styles.textInput}
            />
            <Text style={styles.inputLabel}>Alert threshold</Text>
            <View style={styles.wrapRow}>
              {[70, 80, 90].map((item) => (
                <PillButton key={item} label={`${item}%`} onPress={() => setThreshold(item)} active={threshold === item} />
              ))}
            </View>
            <PrimaryButton label="Create budget" onPress={createBudget} disabled={parsedAmount <= 0} />
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

function ReportsScreen() {
  const { transactions, budgets } = useAppData();
  const [range, setRange] = useState<ReportRange>('Month');
  const { income, expenses, balance, topCategory, spentByCategory } = useSummary();
  const savings = Math.max(0, balance);
  const totalSpend = Math.max(1, expenses);
  const trendPoints = range === 'Week' ? '8,122 62,98 116,112 176,76 238,68 292,38' : '8,114 72,90 132,98 190,64 246,52 292,36';

  return (
    <ScreenShell title="Reports" subtitle="Simple insights from local records.">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.segment}>
          {(['Week', 'Month', 'Year'] as ReportRange[]).map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item}
              onPress={() => setRange(item)}
              style={[styles.segmentItem, range === item && styles.segmentItemActive]}
            >
              <Text style={[styles.segmentText, range === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.twoColumn}>
          <GlassCard>
            <Text style={styles.kicker}>Total savings</Text>
            <Text style={styles.sideValue}>{formatMoney(savings)}</Text>
            <Text style={styles.goodText}>+12.5%</Text>
          </GlassCard>
          <GlassCard tone="warning">
            <Text style={styles.kicker}>Top category</Text>
            <Text style={styles.sideValue}>{topCategory?.category ?? 'None'}</Text>
            <Text style={styles.mutedText}>{formatMoney(topCategory?.amount ?? 0)}</Text>
          </GlassCard>
        </View>

        <GlassCard>
          <Text style={styles.cardTitle}>Category breakdown</Text>
          <View style={styles.donutWrap}>
            <Svg height="170" width="170" viewBox="0 0 170 170">
              <Circle cx="85" cy="85" r="58" stroke="#2c364f" strokeWidth="24" fill="none" />
              <Circle
                cx="85"
                cy="85"
                r="58"
                stroke={colors.primary}
                strokeWidth="24"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(340, Math.max(40, ((topCategory?.amount ?? 0) / totalSpend) * 360))} 360`}
                transform="rotate(-90 85 85)"
              />
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={styles.donutAmount}>{formatMoney(expenses)}</Text>
              <Text style={styles.kicker}>Spent</Text>
            </View>
          </View>
          {spentByCategory
            .filter((item) => item.amount > 0)
            .slice(0, 4)
            .map((item) => (
              <View key={item.category} style={styles.rowBetween}>
                <CategoryBadge category={item.category} />
                <Text style={styles.amountSmall}>{Math.round((item.amount / totalSpend) * 100)}%</Text>
              </View>
            ))}
        </GlassCard>

        <GlassCard>
          <View style={styles.rowBetween}>
            <Text style={styles.cardTitle}>Spending trend</Text>
            <Text style={styles.goodText}>+4% vs last {range.toLowerCase()}</Text>
          </View>
          <Svg height="150" width="100%" viewBox="0 0 300 150">
            <Polyline
              points={trendPoints}
              fill="none"
              stroke={colors.primary}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </GlassCard>

        <GlassCard tone="accent">
          <View style={styles.rowSmall}>
            <Sparkles color={colors.primary} size={26} />
            <Text style={styles.cardTitle}>Financial health: steady</Text>
          </View>
          <Text style={styles.bodyText}>
            Income is {formatMoney(income)} and your active budgets cover {budgets.length} spending areas. Keep recording
            daily expenses so the dashboard stays useful.
          </Text>
        </GlassCard>
      </ScrollView>
    </ScreenShell>
  );
}

function AppTour() {
  const [visible, setVisible] = useState(false);
  const [index, setIndex] = useState(0);

  const steps = [
    {
      route: 'Dashboard' as keyof RootTabParamList,
      title: 'Start with the dashboard',
      body: 'Check balance, budget alerts, and recent activity from one calm overview.',
    },
    {
      route: 'Add' as keyof RootTabParamList,
      title: 'Add money movement',
      body: 'Use the center tab to record income or expenses in a few taps.',
    },
    {
      route: 'Budgets' as keyof RootTabParamList,
      title: 'Watch budget limits',
      body: 'Progress bars show what is safe, close, or already over the alert line.',
    },
    {
      route: 'Reports' as keyof RootTabParamList,
      title: 'Read simple insights',
      body: 'Switch between week, month, and year to understand spending patterns.',
    },
  ];

  useEffect(() => {
    async function load() {
      const complete = await AsyncStorage.getItem(storageKeys.tour);
      setVisible(complete !== 'true');
    }
    void load();
  }, []);

  useEffect(() => {
    if (visible && navigationRef.isReady()) {
      navigationRef.navigate(steps[index].route);
    }
  }, [index, steps, visible]);

  async function finish() {
    await AsyncStorage.setItem(storageKeys.tour, 'true');
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  const step = steps[index];
  const isLast = index === steps.length - 1;

  return (
    <View style={styles.tourOverlay}>
      <View style={styles.tourSpotlight}>
        <Sparkles color={colors.primary} size={26} />
        <Text style={styles.tourSpotlightText}>{step.route}</Text>
      </View>
      <View style={styles.tourCard}>
        <Text style={styles.kicker}>
          Step {index + 1} of {steps.length}
        </Text>
        <Text style={styles.tourTitle}>{step.title}</Text>
        <Text style={styles.bodyText}>{step.body}</Text>
        <View style={styles.tourActions}>
          <Pressable accessibilityRole="button" onPress={finish} style={styles.tourSecondary}>
            <Text style={styles.tourSecondaryText}>Skip</Text>
          </Pressable>
          <PrimaryButton
            label={isLast ? 'Finish' : 'Next'}
            onPress={() => {
              if (isLast) {
                void finish();
              } else {
                setIndex((current) => current + 1);
              }
            }}
            icon={<ChevronRight color="#06251a" size={18} />}
          />
        </View>
      </View>
    </View>
  );
}

function TabIcon({
  route,
  focused,
}: {
  route: RouteProp<RootTabParamList, keyof RootTabParamList>;
  focused: boolean;
}) {
  const iconColor = focused ? colors.primary : '#d7dfeb';
  const iconSize = route.name === 'Add' ? 30 : 24;
  switch (route.name) {
    case 'Dashboard':
      return <LayoutDashboard color={iconColor} size={iconSize} />;
    case 'Activity':
      return <ReceiptText color={iconColor} size={iconSize} />;
    case 'Add':
      return <Plus color={focused ? '#06251a' : colors.primary} size={iconSize} />;
    case 'Budgets':
      return <PiggyBank color={iconColor} size={iconSize} />;
    case 'Reports':
      return <BarChart3 color={iconColor} size={iconSize} />;
    default:
      return <LayoutDashboard color={iconColor} size={iconSize} />;
  }
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: route.name === 'Add' ? styles.addTabItem : styles.tabItem,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#d7dfeb',
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused }) => (
          <View style={[styles.tabIconWrap, focused && styles.tabIconWrapActive, route.name === 'Add' && styles.addIconWrap]}>
            <TabIcon route={route} focused={focused} />
          </View>
        ),
      })}
      screenListeners={{
        tabPress: () => hapticTap(),
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activity" component={ActivityScreen} />
      <Tab.Screen name="Add" component={AddScreen} />
      <Tab.Screen name="Budgets" component={BudgetsScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppDataProvider>
        <NavigationContainer ref={navigationRef}>
          <StatusBar style="light" />
          <MainTabs />
          <AppTour />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  addIconWrap: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(78, 222, 163, 0.5)',
    borderRadius: 25,
    height: 50,
    marginTop: -18,
    width: 50,
  },
  addTabItem: {
    height: 72,
  },
  amountInput: {
    color: colors.text,
    fontSize: 44,
    fontWeight: '800',
    marginBottom: 18,
    paddingVertical: 6,
  },
  amountSmall: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  animatedBody: {
    flex: 1,
  },
  appName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  badText: {
    color: colors.expense,
  },
  balance: {
    color: colors.primary,
    fontSize: 40,
    fontWeight: '900',
    marginTop: 8,
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  budgetName: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 14,
  },
  card: {
    backgroundColor: 'rgba(20, 30, 52, 0.72)',
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    padding: 18,
  },
  cardAccent: {
    backgroundColor: 'rgba(23, 65, 58, 0.58)',
    borderColor: 'rgba(78, 222, 163, 0.34)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    padding: 18,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  cardWarning: {
    backgroundColor: 'rgba(67, 55, 22, 0.66)',
    borderColor: 'rgba(249, 189, 34, 0.42)',
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 14,
    overflow: 'hidden',
    padding: 18,
  },
  categoryBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryBadgeText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  categoryList: {
    gap: 12,
    marginTop: 18,
  },
  chipRow: {
    gap: 10,
    paddingBottom: 14,
  },
  createBudgetCard: {
    alignItems: 'center',
    borderColor: 'rgba(218, 226, 253, 0.18)',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 28,
    padding: 26,
  },
  createBudgetText: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '700',
  },
  donutAmount: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  donutCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  donutWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyState: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 30,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  floatingAdd: {
    bottom: 22,
    position: 'absolute',
    right: 24,
  },
  floatingAddButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 34,
    height: 68,
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 22,
    width: 68,
  },
  goodText: {
    color: colors.primary,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: 'rgba(218, 226, 253, 0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(20, 30, 52, 0.8)',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconButtonActive: {
    borderColor: colors.primary,
  },
  inputLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  kicker: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  linkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  loadingText: {
    color: colors.muted,
    marginTop: 8,
  },
  loadingTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    marginTop: 12,
  },
  loadingWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  miniStat: {
    backgroundColor: 'rgba(9, 18, 35, 0.44)',
    borderColor: 'rgba(218, 226, 253, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    padding: 14,
  },
  miniStatValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.62)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#121c31',
    borderColor: colors.border,
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  modalTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  mutedText: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 8,
  },
  percentText: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900',
  },
  pill: {
    alignItems: 'center',
    backgroundColor: 'rgba(218, 226, 253, 0.08)',
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 16,
  },
  pillActive: {
    backgroundColor: 'rgba(78, 222, 163, 0.16)',
    borderColor: 'rgba(78, 222, 163, 0.58)',
  },
  pillDanger: {
    backgroundColor: 'rgba(255, 179, 176, 0.12)',
    borderColor: 'rgba(255, 179, 176, 0.4)',
  },
  pillText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  pillTextActive: {
    color: colors.primary,
  },
  pillTextDanger: {
    color: colors.expense,
  },
  pressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }],
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 18,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
  },
  primaryButtonDisabled: {
    backgroundColor: '#445063',
  },
  primaryButtonText: {
    color: '#06251a',
    fontSize: 16,
    fontWeight: '900',
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 8,
  },
  progressTrack: {
    backgroundColor: 'rgba(218, 226, 253, 0.13)',
    borderRadius: 999,
    height: 8,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressWarning: {
    backgroundColor: colors.warning,
  },
  rowBetween: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowSmall: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  safe: {
    flex: 1,
  },
  screenTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 116,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 24,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 18,
  },
  searchInput: {
    color: '#172033',
    flex: 1,
    fontSize: 16,
    minHeight: 58,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  segment: {
    backgroundColor: 'rgba(20, 30, 52, 0.78)',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
    padding: 5,
  },
  segmentItem: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  segmentItemActive: {
    backgroundColor: 'rgba(78, 222, 163, 0.2)',
  },
  segmentText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: colors.primary,
  },
  shell: {
    flex: 1,
  },
  sideStack: {
    flex: 1,
    gap: 14,
  },
  sideValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 4,
  },
  tabBar: {
    backgroundColor: 'rgba(13, 21, 38, 0.96)',
    borderColor: 'rgba(218, 226, 253, 0.12)',
    borderRadius: 26,
    borderTopWidth: 1,
    bottom: 12,
    height: 78,
    left: 12,
    paddingBottom: 10,
    paddingTop: 10,
    position: 'absolute',
    right: 12,
  },
  tabIconWrap: {
    alignItems: 'center',
    borderRadius: 22,
    height: 42,
    justifyContent: 'center',
    width: 54,
  },
  tabIconWrapActive: {
    backgroundColor: 'rgba(78, 222, 163, 0.16)',
  },
  tabItem: {
    height: 64,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  textInput: {
    backgroundColor: 'rgba(9, 18, 35, 0.46)',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    minHeight: 52,
    paddingHorizontal: 14,
  },
  tourActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  tourCard: {
    backgroundColor: '#121c31',
    borderColor: 'rgba(78, 222, 163, 0.36)',
    borderRadius: 26,
    borderWidth: 1,
    bottom: 28,
    left: 20,
    padding: 20,
    position: 'absolute',
    right: 20,
  },
  tourOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  tourSecondary: {
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    minHeight: 54,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  tourSecondaryText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '800',
  },
  tourSpotlight: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(18, 28, 49, 0.9)',
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 95,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  tourSpotlightText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  tourTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 8,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'right',
  },
  transactionAmountWrap: {
    alignItems: 'flex-end',
    flex: 0.9,
  },
  transactionIcon: {
    alignItems: 'center',
    backgroundColor: 'rgba(218, 226, 253, 0.08)',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  transactionMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  transactionMiddle: {
    flex: 1,
  },
  transactionRow: {
    alignItems: 'center',
    borderBottomColor: 'rgba(218, 226, 253, 0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
  },
  transactionTime: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  transactionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 14,
  },
  warningText: {
    color: colors.warning,
  },
  wrapRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

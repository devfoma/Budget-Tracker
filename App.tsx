import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  createNavigationContainerRef,
  NavigationContainer,
  RouteProp,
} from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
  Bell,
  Bus,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CirclePlus,
  Filter,
  Gift,
  GraduationCap,
  Home,
  Info,
  LayoutDashboard,
  LockKeyhole,
  MoreHorizontal,
  PiggyBank,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingBag,
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
  Alert,
  Animated,
  DimensionValue,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

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
  email?: string;
  currency: string;
  monthlyIncomeEstimate?: number;
  avatarUri?: string;
  appLockEnabled: boolean;
  hasCompletedProfile: boolean;
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
  updateProfile: (profile: Partial<Profile>) => void;
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

const defaultProfile: Profile = {
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

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatMoney(amount: number, currency = '₦') {
  return `${currency || '₦'}${Math.round(amount).toLocaleString('en-NG')}`;
}

function sumTransactions(transactions: Transaction[], type: TransactionType) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');
  return initials.toUpperCase() || 'U';
}

function normalizeProfile(profile: Partial<Profile> | null): Profile {
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

function getRangeDays(range: ReportRange) {
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

function getTransactionsInRange(transactions: Transaction[], range: ReportRange, periodOffset = 0) {
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

function getSavingsRate(income: number, expenses: number) {
  if (income <= 0) {
    return 0;
  }
  return Math.round((Math.max(0, income - expenses) / income) * 100);
}

function getExpenseChange(currentExpenses: number, previousExpenses: number) {
  if (previousExpenses <= 0) {
    return currentExpenses > 0 ? 100 : 0;
  }
  return Math.round(((currentExpenses - previousExpenses) / previousExpenses) * 100);
}

function formatChange(change: number) {
  return `${change > 0 ? '+' : ''}${change}%`;
}

function getAverageDailyExpense(transactions: Transaction[], expenses: number) {
  if (transactions.length === 0 || expenses <= 0) {
    return 0;
  }
  const times = transactions.map((transaction) => new Date(transaction.date).getTime());
  const first = Math.min(...times);
  const last = Math.max(...times);
  const days = Math.max(1, Math.ceil((last - first) / (24 * 60 * 60 * 1000)) + 1);
  return expenses / days;
}

function getFinancialHealthLabel(income: number, expenses: number, budgets: Budget[]) {
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

function buildTrendPoints(transactions: Transaction[], range: ReportRange) {
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
      return ShieldCheck;
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
            ...transaction,
          },
          ...current,
        ]);
        setAlertsRead(false);
      },
      addBudget: (budget) => {
        setBudgets((current) => [{ id: uid('budget'), ...budget }, ...current]);
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
      <GradientShell>
        <View style={styles.loadingWrap}>
          <ShieldCheck color={colors.primary} size={34} />
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
  showAppName = true,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  rightAction?: ReactNode;
  showAppName?: boolean;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  const insets = useSafeAreaInsets();

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
      <View style={styles.safe}>
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View>
            {showAppName ? <Text style={styles.appName}>Budget Tracker</Text> : null}
            <Text style={styles.screenTitle}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {rightAction}
        </View>
        <Animated.View style={[styles.animatedBody, { opacity, transform: [{ translateY }] }]}>
          {children}
        </Animated.View>
      </View>
    </GradientShell>
  );
}

function GlassCard({
  children,
  tone = 'default',
  style,
}: {
  children: ReactNode;
  tone?: 'default' | 'accent' | 'warning';
  style?: StyleProp<ViewStyle>;
}) {
  const baseStyle = tone === 'accent' ? styles.cardAccent : tone === 'warning' ? styles.cardWarning : styles.card;
  return (
    <BlurView intensity={24} tint="dark" style={[baseStyle, style]}>
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

type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

function InfoButton({ title, message }: { title: string; message: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`About ${title}`}
      onPress={() => {
        hapticTap();
        Alert.alert(title, message);
      }}
      style={({ pressed }) => [styles.infoButton, pressed && styles.pressed]}
    >
      <Info color={colors.primary} size={16} />
    </Pressable>
  );
}

function TitleWithInfo({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.titleWithInfo}>
      <Text style={styles.cardTitle}>{title}</Text>
      <InfoButton title={title} message={message} />
    </View>
  );
}

function SectionTitleWithInfo({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.titleWithInfo}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <InfoButton title={title} message={message} />
    </View>
  );
}

function DropdownSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value) ?? options[0];

  return (
    <View style={styles.dropdownWrap}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Select ${label}`}
        onPress={() => {
          hapticTap();
          setOpen(true);
        }}
        style={({ pressed }) => [styles.dropdownButton, pressed && styles.pressed]}
      >
        <Text style={styles.dropdownValue}>{selected.label}</Text>
        <ChevronDown color={colors.primary} size={18} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.dropdownMenuCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>{label}</Text>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.dropdownOptionList}
            >
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    key={option.value}
                    onPress={() => {
                      hapticTap();
                      onChange(option.value);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.dropdownOption,
                      active && styles.dropdownOptionActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text style={[styles.dropdownOptionText, active && styles.dropdownOptionTextActive]}>
                      {option.label}
                    </Text>
                    {active ? <CheckCircle color={colors.primary} size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
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

function AvatarDisplay({ profile, size = 44 }: { profile: Profile; size?: number }) {
  const radius = size / 2;
  if (profile.avatarUri) {
    return (
      <Image
        source={{ uri: profile.avatarUri }}
        style={[styles.avatarImage, { borderRadius: radius, height: size, width: size }]}
      />
    );
  }

  return (
    <View style={[styles.avatar, { borderRadius: radius, height: size, width: size }]}>
      <Text style={styles.avatarText}>{getInitials(profile.fullName)}</Text>
    </View>
  );
}

function ProgressBar({ progress, warning = false }: { progress: number; warning?: boolean }) {
  const width = `${progress <= 0 ? 0 : Math.min(100, Math.max(4, progress * 100))}%` as DimensionValue;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, warning && styles.progressWarning, { width }]} />
    </View>
  );
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { profile } = useAppData();
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
          {isIncome ? '+' : '-'} {formatMoney(transaction.amount, profile.currency)}
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
  const [profileVisible, setProfileVisible] = useState(false);
  const spendingCategories = spentByCategory.filter((item) => item.amount > 0);
  const savingsRate = getSavingsRate(income, expenses);
  const dailyAverage = getAverageDailyExpense(transactions, expenses);
  const money = (amount: number) => formatMoney(amount, profile.currency);

  const budgetWarnings = budgets.filter((budget) => {
    const spent = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((total, transaction) => total + transaction.amount, 0);
    return spent / budget.limit >= budget.threshold / 100;
  });

  return (
    <ScreenShell
      title={`Hello, ${profile.fullName || 'there'}`}
      subtitle="Your money snapshot is ready."
      showAppName={false}
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
          <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => setProfileVisible(true)}>
            <AvatarDisplay profile={profile} />
          </Pressable>
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
          <View style={styles.rowBetween}>
            <Text style={styles.kicker}>Total balance</Text>
            <InfoButton
              title="Total balance"
              message="Your balance is calculated from saved income minus saved expenses."
            />
          </View>
          <Text style={styles.balance}>{money(balance)}</Text>
          <View style={styles.statRow}>
            <MiniStat label="Income" value={money(income)} tone="good" />
            <MiniStat label="Expense" value={money(expenses)} tone="bad" />
          </View>
          <View style={styles.dashboardActionRow}>
            <PrimaryButton
              label="Add transaction"
              onPress={() => navigation.navigate('Add')}
              icon={<Plus color="#06251a" size={19} />}
            />
          </View>
        </GlassCard>

        <View style={styles.twoColumn}>
          <GlassCard style={styles.flexCard}>
            <TitleWithInfo
              title="Spending"
              message="This section groups your saved expenses by category so you can spot where money is going."
            />
            <View style={styles.categoryList}>
              {spendingCategories.length === 0 ? (
                <Text style={styles.bodyText}>Add an expense to see category totals.</Text>
              ) : (
                spendingCategories.slice(0, 3).map((item) => (
                  <View key={item.category} style={styles.rowBetween}>
                    <CategoryBadge category={item.category} />
                    <Text style={styles.amountSmall}>{money(item.amount)}</Text>
                  </View>
                ))
              )}
            </View>
          </GlassCard>
          <View style={styles.sideStack}>
            <GlassCard>
              <Text style={styles.kicker}>Daily avg</Text>
              <Text style={styles.sideValue}>{money(dailyAverage)}</Text>
            </GlassCard>
            <GlassCard tone="accent">
              <Text style={styles.kicker}>Savings rate</Text>
              <Text style={styles.sideValue}>{savingsRate}%</Text>
            </GlassCard>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <SectionTitleWithInfo
            title="Active budgets"
            message="Active budgets compare your category spending with limits you created."
          />
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Budgets')}>
            <Text style={styles.linkText}>View all</Text>
          </Pressable>
        </View>
        {budgets.length === 0 ? (
          <GlassCard>
            <View style={styles.emptyState}>
              <PiggyBank color={colors.soft} size={28} />
              <Text style={styles.emptyTitle}>No budgets yet</Text>
              <Text style={styles.bodyText}>Create a budget to start tracking planned spending.</Text>
            </View>
          </GlassCard>
        ) : (
          budgets.slice(0, 2).map((budget) => {
            const spent = transactions
              .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
              .reduce((total, transaction) => total + transaction.amount, 0);
            const progress = spent / budget.limit;
            return (
              <GlassCard key={budget.id}>
                <View style={styles.rowBetween}>
                  <CategoryBadge category={budget.category} />
                  <Text style={styles.amountSmall}>
                    {money(spent)} / {money(budget.limit)}
                  </Text>
                </View>
                <ProgressBar progress={progress} warning={progress >= budget.threshold / 100} />
                <Text style={styles.mutedText}>{Math.round(progress * 100)}% used</Text>
              </GlassCard>
            );
          })
        )}

        <View style={styles.sectionHeader}>
          <SectionTitleWithInfo
            title="Recent activity"
            message="Recent activity shows the latest transactions recorded by the user."
          />
          <Pressable accessibilityRole="button" onPress={() => navigation.navigate('Activity')}>
            <Text style={styles.linkText}>History</Text>
          </Pressable>
        </View>
        <GlassCard>
          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <ReceiptText color={colors.soft} size={28} />
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.bodyText}>Add income or expenses to build your financial snapshot.</Text>
            </View>
          ) : (
            transactions.slice(0, 3).map((transaction) => (
              <TransactionRow key={transaction.id} transaction={transaction} />
            ))
          )}
        </GlassCard>
      </ScrollView>
      <ProfileEditor visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </ScreenShell>
  );
}

function ActivityScreen({ navigation }: ScreenProps<'Activity'>) {
  const { transactions } = useAppData();
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const typeOptions: DropdownOption<'all' | TransactionType>[] = [
    { label: 'All transactions', value: 'all' },
    { label: 'Income only', value: 'income' },
    { label: 'Expenses only', value: 'expense' },
  ];
  const categoryOptions: DropdownOption<string>[] = [
    { label: 'All categories', value: 'All' },
    ...expenseCategories.map((category) => ({ label: category, value: category })),
    ...incomeCategories.map((category) => ({ label: category, value: category })),
  ];
  const methodOptions: DropdownOption<string>[] = [
    { label: 'All methods', value: 'All' },
    ...methods.map((method) => ({ label: method, value: method })),
  ];

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

        <GlassCard>
          <View style={styles.rowBetween}>
            <TitleWithInfo
              title="Filters"
              message="Use filters to narrow activity by transaction type, spending category, or payment method."
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
          </View>
          <View style={styles.dropdownGrid}>
            <DropdownSelect label="Type" value={typeFilter} options={typeOptions} onChange={setTypeFilter} />
            <DropdownSelect label="Category" value={categoryFilter} options={categoryOptions} onChange={setCategoryFilter} />
            <DropdownSelect label="Method" value={methodFilter} options={methodOptions} onChange={setMethodFilter} />
          </View>
        </GlassCard>

        <GlassCard>
          <View style={styles.rowSmall}>
            <Calendar color={colors.primary} size={20} />
            <TitleWithInfo
              title="Transactions"
              message="This list shows the income and expense records saved on this device. Search and filters change what appears here."
            />
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
            placeholder={type === 'income' ? 'Income description' : 'Expense description'}
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
  const { profile, budgets, transactions, addBudget } = useAppData();
  const { budgetTotal, budgetSpent } = useSummary();
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [threshold, setThreshold] = useState(80);
  const parsedAmount = Number(amount.replace(/,/g, ''));
  const money = (value: number) => formatMoney(value, profile.currency);

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
          <View style={styles.rowBetween}>
            <Text style={styles.kicker}>Total budgeted</Text>
            <InfoButton
              title="Total budgeted"
              message="This total adds up the budget limits you created and compares them with matching expense records."
            />
          </View>
          <Text style={styles.balance}>{money(budgetTotal)}</Text>
          <View style={styles.statRow}>
            <MiniStat label="Spent" value={money(budgetSpent)} tone="bad" />
            <MiniStat label="Remaining" value={money(Math.max(0, budgetTotal - budgetSpent))} tone="good" />
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
                {money(spent)} spent from {money(budget.limit)}
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
              <View style={styles.titleWithInfo}>
                <Text style={styles.modalTitle}>New budget</Text>
                <InfoButton
                  title="New budget"
                  message="Create a budget to track expenses for one category against a limit and alert threshold."
                />
              </View>
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
  const { profile, transactions, budgets } = useAppData();
  const [range, setRange] = useState<ReportRange>('Month');
  const rangeTransactions = useMemo(() => getTransactionsInRange(transactions, range), [range, transactions]);
  const previousRangeTransactions = useMemo(() => getTransactionsInRange(transactions, range, 1), [range, transactions]);
  const income = sumTransactions(rangeTransactions, 'income');
  const expenses = sumTransactions(rangeTransactions, 'expense');
  const previousExpenses = sumTransactions(previousRangeTransactions, 'expense');
  const balance = income - expenses;
  const savings = Math.max(0, balance);
  const savingsRate = getSavingsRate(income, expenses);
  const expenseChange = getExpenseChange(expenses, previousExpenses);
  const spentByCategory = expenseCategories.map((category) => ({
    category,
    amount: rangeTransactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === category)
      .reduce((total, transaction) => total + transaction.amount, 0),
  }));
  const topCategory = [...spentByCategory].filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount)[0];
  const totalSpend = Math.max(1, expenses);
  const trendPoints = buildTrendPoints(rangeTransactions, range);
  const healthLabel = getFinancialHealthLabel(income, expenses, budgets);
  const money = (amount: number) => formatMoney(amount, profile.currency);

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
          <GlassCard style={styles.flexCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.kicker}>Total savings</Text>
              <InfoButton
                title="Total savings"
                message="Savings is the income left after expenses for the selected report range."
              />
            </View>
            <Text style={styles.sideValue}>{money(savings)}</Text>
            <Text style={styles.goodText}>{savingsRate}% saved</Text>
          </GlassCard>
          <GlassCard tone="warning" style={styles.flexCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.kicker}>Top category</Text>
              <InfoButton
                title="Top category"
                message="Top category is the expense category with the highest spending in the selected range."
              />
            </View>
            <Text style={styles.sideValue}>{topCategory?.category ?? 'None'}</Text>
            <Text style={styles.mutedText}>{money(topCategory?.amount ?? 0)}</Text>
          </GlassCard>
        </View>

        <GlassCard>
          <TitleWithInfo
            title="Category breakdown"
            message="The chart shows how your expenses are distributed across categories for the selected range."
          />
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
                strokeDasharray={
                  topCategory
                    ? `${Math.min(340, Math.max(40, (topCategory.amount / totalSpend) * 360))} 360`
                    : '0 360'
                }
                transform="rotate(-90 85 85)"
              />
            </Svg>
            <View style={styles.donutCenter}>
              <Text style={styles.donutAmount}>{money(expenses)}</Text>
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
          {expenses === 0 ? (
            <View style={styles.emptyState}>
              <BarChart3 color={colors.soft} size={28} />
              <Text style={styles.emptyTitle}>No spending in this range</Text>
              <Text style={styles.bodyText}>Expenses added by the user will appear here.</Text>
            </View>
          ) : null}
        </GlassCard>

        <GlassCard>
          <View style={styles.rowBetween}>
            <TitleWithInfo
              title="Spending trend"
              message="The trend line plots saved expenses across the selected week, month, or year."
            />
            <Text style={expenseChange > 0 ? styles.badText : styles.goodText}>
              {formatChange(expenseChange)} vs last {range.toLowerCase()}
            </Text>
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
            <ShieldCheck color={colors.primary} size={26} />
            <TitleWithInfo
              title={healthLabel}
              message="Financial health summarizes the current report range using your recorded income, expenses, and active budgets."
            />
          </View>
          <Text style={styles.bodyText}>
            Income is {money(income)} and your active budgets cover {budgets.length} spending areas. Keep recording
            daily expenses so the dashboard stays useful.
          </Text>
        </GlassCard>
      </ScrollView>
    </ScreenShell>
  );
}

function ProfileEditor({
  visible,
  required = false,
  onClose,
}: {
  visible: boolean;
  required?: boolean;
  onClose: () => void;
}) {
  const { profile, updateProfile } = useAppData();
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email ?? '');
  const [currency, setCurrency] = useState(profile.currency || '₦');
  const [monthlyIncome, setMonthlyIncome] = useState(
    profile.monthlyIncomeEstimate ? String(profile.monthlyIncomeEstimate) : '',
  );
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri);

  useEffect(() => {
    if (visible) {
      setFullName(profile.fullName);
      setEmail(profile.email ?? '');
      setCurrency(profile.currency || '₦');
      setMonthlyIncome(profile.monthlyIncomeEstimate ? String(profile.monthlyIncomeEstimate) : '');
      setAvatarUri(profile.avatarUri);
    }
  }, [profile, visible]);

  async function chooseAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to choose a profile image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.75,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  function saveProfile() {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Name required', 'Add your name so Budget Tracker can personalize the app.');
      return;
    }

    updateProfile({
      fullName: trimmedName,
      email: email.trim(),
      currency: currency.trim().toUpperCase() || '₦',
      monthlyIncomeEstimate: Number(monthlyIncome.replace(/,/g, '')) || undefined,
      avatarUri,
    });
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={required ? undefined : onClose}>
      <View style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.profileModalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.modalTitle}>{required ? 'Set up profile' : 'Edit profile'}</Text>
                <Text style={styles.bodyText}>Your details stay on this phone.</Text>
              </View>
              {!required ? (
                <Pressable accessibilityRole="button" onPress={onClose}>
                  <X color={colors.muted} size={22} />
                </Pressable>
              ) : null}
            </View>

            <Pressable accessibilityRole="button" onPress={chooseAvatar} style={styles.avatarPicker}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarPreviewImage} />
              ) : (
                <View style={styles.avatarPreviewFallback}>
                  <Camera color={colors.primary} size={28} />
                </View>
              )}
              <Text style={styles.linkText}>{avatarUri ? 'Change photo' : 'Add photo'}</Text>
            </Pressable>

            <Text style={styles.inputLabel}>Full name</Text>
            <TextInput
              placeholder="Your name"
              placeholderTextColor={colors.soft}
              value={fullName}
              onChangeText={setFullName}
              style={styles.textInput}
            />

            <Text style={styles.inputLabel}>Email optional</Text>
            <TextInput
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@example.com"
              placeholderTextColor={colors.soft}
              value={email}
              onChangeText={setEmail}
              style={styles.textInput}
            />

            <View style={styles.profileInlineInputs}>
              <View style={styles.profileInlineField}>
                <Text style={styles.inputLabel}>Currency</Text>
                <TextInput
                  placeholder="₦"
                  placeholderTextColor={colors.soft}
                  value={currency}
                  onChangeText={setCurrency}
                  style={styles.textInput}
                  maxLength={4}
                />
              </View>
              <View style={styles.profileInlineField}>
                <Text style={styles.inputLabel}>Monthly income</Text>
                <TextInput
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.soft}
                  value={monthlyIncome}
                  onChangeText={setMonthlyIncome}
                  style={styles.textInput}
                />
              </View>
            </View>

            <PrimaryButton label={required ? 'Start tracking' : 'Save profile'} onPress={saveProfile} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ProfileSetupGate() {
  const { profile } = useAppData();
  const [visible, setVisible] = useState(!profile.hasCompletedProfile);

  useEffect(() => {
    if (!profile.hasCompletedProfile) {
      setVisible(true);
    }
  }, [profile.hasCompletedProfile]);

  return <ProfileEditor visible={visible} required onClose={() => setVisible(false)} />;
}

function AppTour() {
  const { profile } = useAppData();
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
      setVisible(profile.hasCompletedProfile && complete !== 'true');
    }
    void load();
  }, [profile.hasCompletedProfile]);

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
        <ShieldCheck color={colors.primary} size={26} />
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
      return <Plus color="#06251a" size={iconSize} />;
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
          <ProfileSetupGate />
          <AppTour />
        </NavigationContainer>
      </AppDataProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  addIconWrap: {
    backgroundColor: colors.primary,
    borderColor: 'rgba(6, 37, 26, 0.35)',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    marginTop: -12,
    shadowColor: colors.primary,
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.26,
    shadowRadius: 14,
    width: 48,
  },
  addTabItem: {
    height: 66,
  },
  amountInput: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 12,
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
  avatarImage: {
    backgroundColor: colors.surfaceStrong,
    borderColor: colors.border,
    borderWidth: 1,
  },
  avatarPicker: {
    alignItems: 'center',
    alignSelf: 'center',
    gap: 10,
    marginVertical: 18,
  },
  avatarPreviewFallback: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderColor: 'rgba(78, 222, 163, 0.28)',
    borderRadius: 42,
    borderWidth: 1,
    height: 84,
    justifyContent: 'center',
    width: 84,
  },
  avatarPreviewImage: {
    borderColor: 'rgba(78, 222, 163, 0.42)',
    borderRadius: 42,
    borderWidth: 1,
    height: 84,
    width: 84,
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
    fontSize: 34,
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
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  card: {
    backgroundColor: 'rgba(20, 30, 52, 0.72)',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 14,
  },
  cardAccent: {
    backgroundColor: 'rgba(23, 65, 58, 0.58)',
    borderColor: 'rgba(78, 222, 163, 0.34)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 14,
  },
  flexCard: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  cardWarning: {
    backgroundColor: 'rgba(67, 55, 22, 0.66)',
    borderColor: 'rgba(249, 189, 34, 0.42)',
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 14,
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
    borderRadius: 18,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    gap: 10,
    marginBottom: 120,
    padding: 22,
  },
  createBudgetText: {
    color: colors.muted,
    fontSize: 17,
    fontWeight: '700',
  },
  dashboardActionRow: {
    marginTop: 14,
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
  dropdownButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(9, 18, 35, 0.46)',
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  dropdownGrid: {
    gap: 12,
    marginTop: 14,
  },
  dropdownLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dropdownMenuCard: {
    backgroundColor: '#121c31',
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    maxHeight: '78%',
    padding: 18,
    width: '100%',
  },
  dropdownOption: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  dropdownOptionActive: {
    backgroundColor: 'rgba(78, 222, 163, 0.14)',
    borderColor: 'rgba(78, 222, 163, 0.5)',
  },
  dropdownOptionList: {
    gap: 10,
    marginTop: 18,
  },
  dropdownOptionText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '800',
  },
  dropdownOptionTextActive: {
    color: colors.primary,
  },
  dropdownValue: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
  },
  dropdownWrap: {
    width: '100%',
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
  goodText: {
    color: colors.primary,
  },
  header: {
    alignItems: 'flex-start',
    borderBottomColor: 'rgba(218, 226, 253, 0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  infoButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(78, 222, 163, 0.1)',
    borderColor: 'rgba(78, 222, 163, 0.34)',
    borderRadius: 14,
    borderWidth: 1,
    height: 28,
    justifyContent: 'center',
    width: 28,
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
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    padding: 12,
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
  profileInlineField: {
    flex: 1,
    minWidth: 0,
  },
  profileInlineInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  profileModalScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 24,
    width: '100%',
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
    fontSize: 24,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 180,
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
    fontSize: 21,
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
    gap: 12,
  },
  sideValue: {
    color: colors.text,
    fontSize: 20,
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
    borderRadius: 22,
    borderTopWidth: 1,
    bottom: 10,
    height: 72,
    left: 12,
    paddingBottom: 8,
    paddingTop: 8,
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
    height: 58,
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
    flex: 0.82,
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
  titleWithInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    gap: 8,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 12,
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

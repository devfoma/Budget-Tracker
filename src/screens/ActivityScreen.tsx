import * as Notifications from 'expo-notifications';
import {
  AlertTriangle,
  ArrowUpDown,
  Bell,
  Calendar,
  CheckCircle,
  CirclePlus,
  Download,
  Filter,
  Info,
  Pencil,
  PiggyBank,
  Plus,
  ReceiptText,
  RotateCcw,
  Search,
  ShieldCheck,
  Tags,
  TrendingUp,
  User,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import {
  AvatarDisplay,
  CategoryBadge,
  DropdownOption,
  DropdownSelect,
  GlassCard,
  IconButton,
  InfoButton,
  MiniStat,
  PillButton,
  PrimaryButton,
  ProfileEditor,
  ProgressBar,
  ScreenShell,
  SectionTitleWithInfo,
  TitleWithInfo,
  TransactionRow,
} from '../components';
import { expenseCategories, incomeCategories, methods } from '../constants';
import { useAppData, useSummary } from '../context/AppDataContext';
import { scheduleBudgetAlertNotification } from '../services/notifications';
import { styles } from '../styles';
import { colors } from '../theme';
import type { Budget, ReportRange, ScreenProps, Transaction, TransactionType } from '../types';
import {
  buildReportCsv,
  buildTrendPoints,
  formatChange,
  formatMoney,
  getAverageDailyExpense,
  getBudgetStatus,
  getExpenseChange,
  getFinancialHealthLabel,
  getSavingsRate,
  getTransactionsInRange,
  shareReportCsv,
} from '../utils/finance';

export function ActivityScreen({ navigation }: ScreenProps<'Activity'>) {
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

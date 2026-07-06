import * as Notifications from 'expo-notifications';
import {
  AlertTriangle,
  ArrowUpDown,
  BarChart3,
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
  sumTransactions,
} from '../utils/finance';

export function ReportsScreen() {
  const { profile, transactions, budgets } = useAppData();
  const [range, setRange] = useState<ReportRange>('Month');
  const [isExporting, setIsExporting] = useState(false);
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
  const reportBudgetRows = budgets.map((budget) => {
    const spent = rangeTransactions
      .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
      .reduce((total, transaction) => total + transaction.amount, 0);
    return { budget, spent, status: getBudgetStatus(budget, spent) };
  });
  const reportBudgetTotal = budgets.reduce((total, budget) => total + budget.limit, 0);
  const reportBudgetSpent = reportBudgetRows.reduce((total, item) => total + item.spent, 0);
  const reportBudgetRemaining = Math.max(0, reportBudgetTotal - reportBudgetSpent);
  const reportBudgetPassed = reportBudgetRows.filter((item) => item.status.isPassed).length;

  async function downloadCsv() {
    try {
      setIsExporting(true);
      const csv = buildReportCsv({
        profile,
        range,
        transactions: rangeTransactions,
        budgets,
        income,
        expenses,
        balance,
      });
      await shareReportCsv(csv, range);
    } catch {
      Alert.alert('Export failed', 'Budget Tracker could not prepare the CSV report. Please try again.');
    } finally {
      setIsExporting(false);
    }
  }

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

        <PrimaryButton
          label={isExporting ? 'Preparing CSV...' : 'Download CSV'}
          onPress={downloadCsv}
          disabled={isExporting}
          icon={<Download color="#06251a" size={19} />}
        />
        <View style={styles.reportExportHint}>
          <Text style={styles.bodyText}>
            Exports the selected {range.toLowerCase()} report with summary totals and transaction rows.
          </Text>
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

        <GlassCard tone={reportBudgetPassed > 0 ? 'warning' : 'default'}>
          <TitleWithInfo
            title="Budget snapshot"
            message="Budget snapshot uses your latest edited budget limits and the selected report range transactions."
          />
          <View style={styles.statRow}>
            <MiniStat label="Budgeted" value={money(reportBudgetTotal)} />
            <MiniStat label="Used" value={money(reportBudgetSpent)} tone={reportBudgetPassed > 0 ? 'bad' : 'default'} />
          </View>
          <View style={styles.statRow}>
            <MiniStat label="Remaining" value={money(reportBudgetRemaining)} tone="good" />
            <MiniStat label="Passed" value={String(reportBudgetPassed)} tone={reportBudgetPassed > 0 ? 'bad' : 'default'} />
          </View>
        </GlassCard>

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
              <Text adjustsFontSizeToFit minimumFontScale={0.72} numberOfLines={1} style={styles.donutAmount}>
                {money(expenses)}
              </Text>
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

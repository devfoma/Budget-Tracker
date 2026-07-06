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

export function DashboardScreen({ navigation }: ScreenProps<'Dashboard'>) {
  const { profile, transactions, budgets, alertsRead, markAlertsRead } = useAppData();
  const { income, expenses, balance, spentByCategory } = useSummary();
  const [showAlerts, setShowAlerts] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const spendingCategories = spentByCategory.filter((item) => item.amount > 0);
  const savingsRate = getSavingsRate(income, expenses);
  const dailyAverage = getAverageDailyExpense(transactions, expenses);
  const money = (amount: number) => formatMoney(amount, profile.currency);

  const budgetWarnings = budgets
    .map((budget) => {
      const spent = transactions
        .filter((transaction) => transaction.type === 'expense' && transaction.category === budget.category)
        .reduce((total, transaction) => total + transaction.amount, 0);
      return { budget, spent, status: getBudgetStatus(budget, spent) };
    })
    .filter(({ status }) => status.isWarning);
  const passedBudgetWarning = budgetWarnings.find(({ status }) => status.isPassed);
  const firstBudgetWarning = passedBudgetWarning ?? budgetWarnings[0];
  const unreadNotificationCount = alertsRead ? 0 : budgetWarnings.length;
  const budgetAlertMessage = firstBudgetWarning
    ? firstBudgetWarning.status.isPassed
      ? `${firstBudgetWarning.budget.name} has passed its budget by ${money(firstBudgetWarning.status.overBy)}.`
      : `${firstBudgetWarning.budget.name} is close to its ${firstBudgetWarning.budget.threshold}% alert threshold.`
    : 'No active budget warnings right now.';
  const notificationRows =
    budgetWarnings.length > 0
      ? budgetWarnings.map(({ budget, status }) => ({
          id: budget.id,
          title: status.isPassed ? `${budget.name} passed` : `${budget.name} warning`,
          body: status.isPassed
            ? `Passed by ${money(status.overBy)}`
            : `Reached ${Math.round(status.progress * 100)}% of ${money(budget.limit)}`,
          urgent: status.isPassed,
        }))
      : [
          {
            id: 'all-clear',
            title: 'All clear',
            body: 'No active budget warnings right now.',
            urgent: false,
          },
        ];
  const notificationSignature = budgetWarnings
    .map(({ budget, status }) => `${budget.id}:${status.isPassed}:${Math.round(status.progress * 100)}:${status.overBy}`)
    .join('|');
  const deviceNotificationTitle =
    unreadNotificationCount === 1 ? notificationRows[0].title : `${unreadNotificationCount} budget alerts`;
  const deviceNotificationBody =
    unreadNotificationCount === 1
      ? notificationRows[0].body
      : 'Open Budget Tracker to review your budget notifications.';
  const lastDeviceNotificationSignature = useRef('');

  useEffect(() => {
    if (unreadNotificationCount <= 0 || !notificationSignature) {
      lastDeviceNotificationSignature.current = '';
      void Notifications.setBadgeCountAsync(0);
      return;
    }

    if (lastDeviceNotificationSignature.current === notificationSignature) {
      return;
    }

    lastDeviceNotificationSignature.current = notificationSignature;
    void scheduleBudgetAlertNotification({
      title: deviceNotificationTitle,
      body: deviceNotificationBody,
      count: unreadNotificationCount,
    }).catch(() => {
      lastDeviceNotificationSignature.current = '';
    });
  }, [deviceNotificationBody, deviceNotificationTitle, notificationSignature, unreadNotificationCount]);

  function closeNotifications() {
    markAlertsRead();
    void Notifications.setBadgeCountAsync(0);
    setShowAlerts(false);
  }

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
            }}
            active={!alertsRead && budgetWarnings.length > 0}
            badge={unreadNotificationCount}
            icon={<Bell color={colors.primary} size={22} />}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Edit profile" onPress={() => setProfileVisible(true)}>
            <AvatarDisplay profile={profile} />
          </Pressable>
        </View>
      }
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
                  <View key={item.category} style={styles.dashboardSpendingRow}>
                    <CategoryBadge category={item.category} compact />
                    <Text
                      adjustsFontSizeToFit
                      minimumFontScale={0.72}
                      numberOfLines={1}
                      style={styles.dashboardSpendingAmount}
                    >
                      {money(item.amount)}
                    </Text>
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
            const status = getBudgetStatus(budget, spent);
            return (
              <GlassCard key={budget.id} tone={status.isPassed ? 'warning' : 'default'}>
                <View style={styles.rowBetween}>
                  <CategoryBadge category={budget.category} />
                  <Text style={styles.amountSmall}>
                    {money(spent)} / {money(budget.limit)}
                  </Text>
                </View>
                <ProgressBar progress={status.progress} warning={status.isWarning} />
                <Text style={status.isPassed ? styles.warningText : styles.mutedText}>
                  {status.isPassed
                    ? `Budget passed by ${money(status.overBy)}`
                    : `${Math.round(status.progress * 100)}% used`}
                </Text>
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
      <Modal transparent visible={showAlerts} animationType="fade" onRequestClose={closeNotifications}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <View style={styles.rowSmall}>
                {budgetWarnings.length > 0 ? (
                  <AlertTriangle color={colors.warning} size={22} />
                ) : (
                  <CheckCircle color={colors.primary} size={22} />
                )}
                <Text style={styles.modalTitle}>
                  {budgetWarnings.length > 0
                    ? passedBudgetWarning
                      ? 'Budget passed'
                      : 'Budget alert'
                    : 'All clear'}
                </Text>
              </View>
              <Pressable accessibilityRole="button" onPress={closeNotifications}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <Text style={[styles.bodyText, styles.notificationMessage]}>{budgetAlertMessage}</Text>
            <View style={styles.notificationList}>
              {notificationRows.map((notification) => (
                <View
                  key={notification.id}
                  style={[styles.notificationItem, notification.urgent && styles.notificationItemUrgent]}
                >
                  <View style={[styles.notificationStatusDot, notification.urgent && styles.notificationStatusDotUrgent]} />
                  <View style={styles.notificationContent}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.notificationTitle}>{notification.title}</Text>
                    </View>
                    <Text style={notification.urgent ? styles.warningText : styles.mutedText}>{notification.body}</Text>
                  </View>
                </View>
              ))}
            </View>
            <PrimaryButton label="Got it" onPress={closeNotifications} />
          </View>
        </View>
      </Modal>
      <ProfileEditor visible={profileVisible} onClose={() => setProfileVisible(false)} />
    </ScreenShell>
  );
}

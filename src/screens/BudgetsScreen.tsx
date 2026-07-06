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

export function BudgetsScreen() {
  const { profile, budgets, transactions, addBudget, updateBudget } = useAppData();
  const { budgetTotal, budgetSpent } = useSummary();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [threshold, setThreshold] = useState(80);
  const parsedAmount = Number(amount.replace(/,/g, ''));
  const money = (value: number) => formatMoney(value, profile.currency);

  function openNewBudget() {
    setEditingBudget(null);
    setAmount('');
    setThreshold(80);
    setCategory('Food');
    setModalVisible(true);
  }

  function openBudgetEditor(budget: Budget) {
    setEditingBudget(budget);
    setCategory(budget.category);
    setAmount(String(budget.limit));
    setThreshold(budget.threshold);
    setModalVisible(true);
  }

  function closeBudgetModal() {
    setModalVisible(false);
    setEditingBudget(null);
  }

  function saveBudget() {
    if (parsedAmount <= 0) {
      return;
    }
    const budgetDetails = {
      name: `${category} Budget`,
      category,
      limit: parsedAmount,
      threshold,
    };
    if (editingBudget) {
      updateBudget(editingBudget.id, budgetDetails);
    } else {
      addBudget(budgetDetails);
    }
    setAmount('');
    setThreshold(80);
    setCategory('Food');
    closeBudgetModal();
  }

  return (
    <ScreenShell
      title="Budgets"
      subtitle="Track spending before it surprises you."
      rightAction={
        <IconButton
          label="Create budget"
          onPress={openNewBudget}
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
          const status = getBudgetStatus(budget, spent);
          return (
            <GlassCard key={budget.id} tone={status.isWarning ? 'warning' : 'default'}>
              <View style={styles.rowBetween}>
                <CategoryBadge category={budget.category} />
                <View style={styles.rowSmall}>
                  <Text style={[styles.percentText, status.isWarning && styles.warningText]}>
                    {status.isPassed ? 'Passed' : `${Math.round(status.progress * 100)}%`}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${budget.name}`}
                    onPress={() => openBudgetEditor(budget)}
                    style={({ pressed }) => [styles.inlineIconButton, pressed && styles.pressed]}
                  >
                    <Pencil color={colors.primary} size={17} />
                  </Pressable>
                </View>
              </View>
              <Text style={styles.budgetName}>{budget.name}</Text>
              <Text style={styles.bodyText}>
                {money(spent)} spent from {money(budget.limit)}
              </Text>
              <ProgressBar progress={status.progress} warning={status.isWarning} />
              <Text style={status.isPassed ? styles.warningText : styles.mutedText}>
                {status.isPassed ? `Budget passed by ${money(status.overBy)}` : `Alert at ${budget.threshold}%`}
              </Text>
            </GlassCard>
          );
        })}

        <Pressable
          accessibilityRole="button"
          onPress={openNewBudget}
          style={({ pressed }) => [styles.createBudgetCard, pressed && styles.pressed]}
        >
          <CirclePlus color={colors.primary} size={34} />
          <Text style={styles.createBudgetText}>Create new budget</Text>
        </Pressable>
      </ScrollView>

      <Modal transparent visible={modalVisible} animationType="fade" onRequestClose={closeBudgetModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <View style={styles.titleWithInfo}>
                <Text style={styles.modalTitle}>{editingBudget ? 'Edit budget' : 'New budget'}</Text>
                <InfoButton
                  title={editingBudget ? 'Edit budget' : 'New budget'}
                  message={
                    editingBudget
                      ? 'Update the category, limit, or alert threshold for this budget.'
                      : 'Create a budget to track expenses for one category against a limit and alert threshold.'
                  }
                />
              </View>
              <Pressable accessibilityRole="button" onPress={closeBudgetModal}>
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
            <PrimaryButton
              label={editingBudget ? 'Save budget' : 'Create budget'}
              onPress={saveBudget}
              disabled={parsedAmount <= 0}
            />
          </View>
        </View>
      </Modal>
    </ScreenShell>
  );
}

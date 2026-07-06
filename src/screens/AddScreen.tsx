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

export function AddScreen({ navigation }: ScreenProps<'Add'>) {
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

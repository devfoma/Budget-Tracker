import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AlertTriangle,
  Camera,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Info,
  LockKeyhole,
  Pencil,
  ReceiptText,
  ShieldCheck,
  X,
} from 'lucide-react-native';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  DimensionValue,
  Easing,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { expenseCategories, incomeCategories, methods, storageKeys } from '../constants';
import { useAppData } from '../context/AppDataContext';
import { navigationRef } from '../navigation/navigationRef';
import { styles } from '../styles';
import { colors } from '../theme';
import type { Profile, RootTabParamList, Transaction, TransactionType } from '../types';
import { getCategoryIcon } from '../utils/categoryIcons';
import { formatMoney, getCompactCategoryName, getInitials } from '../utils/finance';
import { hapticTap } from '../utils/haptics';

export function GradientShell({ children }: { children: ReactNode }) {
  return (
    <LinearGradient colors={['#07111f', '#0b1326', '#10231f']} style={styles.shell}>
      {children}
    </LinearGradient>
  );
}

export function ScreenShell({
  title,
  subtitle,
  children,
  rightAction,
  showAppName = false,
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

export function GlassCard({
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

export function IconButton({
  icon,
  label,
  onPress,
  active = false,
  badge,
}: {
  icon: ReactNode;
  label: string;
  onPress: () => void;
  active?: boolean;
  badge?: number;
}) {
  const hasBadge = typeof badge === 'number' && badge > 0;

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
      {hasBadge ? (
        <View style={styles.notificationBadge}>
          <Text style={styles.notificationBadgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function PillButton({
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

export type DropdownOption<T extends string> = {
  label: string;
  value: T;
};

export function InfoButton({ title, message }: { title: string; message: string }) {
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

export function TitleWithInfo({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.titleWithInfo}>
      <Text style={styles.cardTitle}>{title}</Text>
      <InfoButton title={title} message={message} />
    </View>
  );
}

export function SectionTitleWithInfo({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.titleWithInfo}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <InfoButton title={title} message={message} />
    </View>
  );
}

export function DropdownSelect<T extends string>({
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

export function PrimaryButton({
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

export function MiniStat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'good' | 'bad' }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.kicker}>{label}</Text>
      <Text style={[styles.miniStatValue, tone === 'good' && styles.goodText, tone === 'bad' && styles.badText]}>
        {value}
      </Text>
    </View>
  );
}

export function CategoryBadge({ category, compact = false }: { category: string; compact?: boolean }) {
  const Icon = getCategoryIcon(category);
  return (
    <View style={[styles.categoryBadge, compact && styles.categoryBadgeCompact]}>
      <Icon color={colors.primary} size={compact ? 15 : 18} />
      <Text numberOfLines={1} style={[styles.categoryBadgeText, compact && styles.categoryBadgeTextCompact]}>
        {compact ? getCompactCategoryName(category) : category}
      </Text>
    </View>
  );
}

export function AvatarDisplay({ profile, size = 44 }: { profile: Profile; size?: number }) {
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

export function ProgressBar({ progress, warning = false }: { progress: number; warning?: boolean }) {
  const width = `${progress <= 0 ? 0 : Math.min(100, Math.max(4, progress * 100))}%` as DimensionValue;
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, warning && styles.progressWarning, { width }]} />
    </View>
  );
}

export function TransactionRow({ transaction }: { transaction: Transaction }) {
  const { profile, updateTransaction } = useAppData();
  const [editing, setEditing] = useState(false);
  const [type, setType] = useState<TransactionType>(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [category, setCategory] = useState(transaction.category);
  const [method, setMethod] = useState(transaction.method);
  const [description, setDescription] = useState(transaction.description);
  const Icon = getCategoryIcon(transaction.category);
  const isIncome = transaction.type === 'income';
  const canEdit = !transaction.edited;
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  const parsedAmount = Number(amount.replace(/,/g, ''));
  const canSave = parsedAmount > 0 && description.trim().length > 0;

  function openEditor() {
    if (!canEdit) {
      hapticTap();
      return;
    }
    setType(transaction.type);
    setAmount(String(transaction.amount));
    setCategory(transaction.category);
    setMethod(transaction.method);
    setDescription(transaction.description);
    hapticTap();
    setEditing(true);
  }

  function chooseType(nextType: TransactionType) {
    setType(nextType);
    setCategory(nextType === 'income' ? 'Salary' : 'Food');
  }

  function saveEdit() {
    if (!canSave) {
      return;
    }
    updateTransaction(transaction.id, {
      type,
      amount: parsedAmount,
      category,
      description: description.trim(),
      method,
    });
    setEditing(false);
  }

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={canEdit ? 'Edit transaction' : 'Transaction already edited'}
        onPress={openEditor}
        style={({ pressed }) => [styles.transactionRow, pressed && canEdit && styles.pressed]}
      >
        <View style={styles.transactionIcon}>
          <Icon color={isIncome ? colors.primary : colors.muted} size={22} />
        </View>
        <View style={styles.transactionMiddle}>
          <Text style={styles.transactionTitle}>{transaction.description}</Text>
          <Text style={styles.transactionMeta}>
            {transaction.method} - {transaction.category}
          </Text>
          <Text style={transaction.edited ? styles.editedText : styles.editHint}>
            {transaction.edited ? 'Edited' : 'Tap to edit once'}
          </Text>
        </View>
        <View style={styles.transactionAmountWrap}>
          <Text style={[styles.transactionAmount, isIncome ? styles.goodText : styles.badText]}>
            {isIncome ? '+' : '-'} {formatMoney(transaction.amount, profile.currency)}
          </Text>
          <View style={styles.rowSmall}>
            {canEdit ? <Pencil color={colors.muted} size={13} /> : null}
            <Text style={styles.transactionTime}>
              {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <Text style={styles.transactionDate}>
            {new Date(transaction.date).toLocaleDateString([], {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </View>
      </Pressable>

      <Modal transparent visible={editing} animationType="fade" onRequestClose={() => setEditing(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalTitle}>Edit transaction</Text>
              <Pressable accessibilityRole="button" onPress={() => setEditing(false)}>
                <X color={colors.muted} size={22} />
              </Pressable>
            </View>
            <Text style={styles.mutedText}>Transactions can only be edited once.</Text>
            <View style={styles.segment}>
              <Pressable
                accessibilityRole="button"
                onPress={() => chooseType('expense')}
                style={[styles.segmentItem, type === 'expense' && styles.segmentItemActive]}
              >
                <Text style={[styles.segmentText, type === 'expense' && styles.segmentTextActive]}>Expense</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => chooseType('income')}
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
              style={styles.textInput}
            />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              placeholder={type === 'income' ? 'Income description' : 'Expense description'}
              placeholderTextColor={colors.soft}
              value={description}
              onChangeText={setDescription}
              style={styles.textInput}
            />
            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.wrapRow}>
              {categories.map((item) => (
                <PillButton key={item} label={item} onPress={() => setCategory(item)} active={category === item} />
              ))}
            </View>
            <Text style={styles.inputLabel}>Payment method</Text>
            <View style={styles.wrapRow}>
              {methods.map((item) => (
                <PillButton key={item} label={item} onPress={() => setMethod(item)} active={method === item} />
              ))}
            </View>
            <PrimaryButton label="Save edit" onPress={saveEdit} disabled={!canSave} />
          </View>
        </View>
      </Modal>
    </>
  );
}

export function ProfileEditor({
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

            <View style={styles.profileSaveButtonWrap}>
              <PrimaryButton label={required ? 'Start tracking' : 'Save profile'} onPress={saveProfile} />
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export function ProfileSetupGate() {
  const { profile } = useAppData();
  const [visible, setVisible] = useState(!profile.hasCompletedProfile);

  useEffect(() => {
    if (!profile.hasCompletedProfile) {
      setVisible(true);
    }
  }, [profile.hasCompletedProfile]);

  return <ProfileEditor visible={visible} required onClose={() => setVisible(false)} />;
}

export function AppTour() {
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

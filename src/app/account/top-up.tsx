import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { fontFamily } from '@/constants/typography';

const presetAmounts = [5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 100000];
const availableBalance = 3000;

const formatNaira = (value: number) => `₦${value.toLocaleString('en-US')}`;

export default function TopUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [amountRaw, setAmountRaw] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);

  const amountNumber = useMemo(() => Number(amountRaw || 0), [amountRaw]);
  const isPresetSelected = (amount: number) => amountNumber === amount;

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    setAmountRaw(digitsOnly);
  };

  const handlePresetPress = (value: number) => {
    setAmountRaw(String(value));
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <StackHeader
        translationKey="account.top_up_title"
        align="center"
        onBack={() => router.back()}
      />

      <View style={[styles.amountCard, { backgroundColor: colors.surface }]}>
        <View style={styles.amountRow}>
          <Text variant="h1" weight="medium">
            ₦
          </Text>
          <RNTextInput
            style={[
              styles.amountInput,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily.medium,
              },
            ]}
            value={amountNumber ? amountNumber.toLocaleString('en-US') : ''}
            onChangeText={handleAmountChange}
            keyboardType="number-pad"
            selectionColor={colors.primary}
            autoFocus
            accessibilityLabel={t('account.top_up_amount_input')}
          />
        </View>
        <Text
          variant="body"
          color="muted"
          translationKey="account.available_balance_with_value"
          translationParams={{ amount: formatNaira(availableBalance) }}
        />
      </View>

      <View style={styles.presetsGrid}>
        {presetAmounts.map((preset) => (
          <Pressable
            key={preset}
            style={[
              styles.presetButton,
              {
                borderColor: isPresetSelected(preset) ? colors.primary : colors.border,
                backgroundColor: isPresetSelected(preset) ? colors.accent : colors.surface,
              },
            ]}
            onPress={() => handlePresetPress(preset)}
            accessibilityRole="button"
            accessibilityLabel={`${t('account.top_up_title')} ${formatNaira(preset)}`}
          >
            <Text variant="body"  >
              {formatNaira(preset)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.footer}>
        <Button
          translationKey="common.continue"
          fullWidth
          onPress={() => setIsSuccessModalVisible(true)}
          disabled={!amountNumber}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={isSuccessModalVisible}
        onRequestClose={() => setIsSuccessModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setIsSuccessModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <View style={[styles.iconWrap, { backgroundColor: colors.textPrimary }]}>
              <Ionicons name="checkmark" size={48} color={colors.white} />
            </View>
            <Text
              variant="h3"
              weight='medium'
              align="center"
              translationKey="account.top_up_success_title"
            />
            <Text
              variant="body"
              color="muted"
              align="center"
              translationKey="account.top_up_success_message"
              translationParams={{ amount: formatNaira(amountNumber) }}
              style={styles.modalMessage}
            />
            <Button
              translationKey="account.got_it"
              fullWidth
              onPress={() => {
                setIsSuccessModalVisible(false);
                router.back();
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  amountCard: {
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    fontSize: 32,
    lineHeight: 40,
    marginLeft: spacing.xs,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  presetButton: {
    width: '31%',
    minHeight: 50,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: spacing.lg,
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalMessage: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm,
  },
});

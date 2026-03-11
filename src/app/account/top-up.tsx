import { useMemo, useState } from 'react';
import { Linking, Modal, Pressable, StyleSheet, TextInput as RNTextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useAddPaymentMethod,
  useDeletePaymentMethod,
  usePaymentMethods,
  useSetDefaultPaymentMethod,
  useWalletBalance,
  useWalletTransactions,
  useWalletTopUp
} from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { fontFamily } from '@/constants/typography';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount, normalizeAmount } from '@/utils/currency';

const presetAmounts = [5000, 10000, 20000, 30000, 40000, 50000, 60000, 70000, 100000];

export default function TopUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [amountRaw, setAmountRaw] = useState('');
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [authCode, setAuthCode] = useState('');
  const [lastFour, setLastFour] = useState('');

  const { data: walletData } = useWalletBalance();
  const { data: walletTransactionsData } = useWalletTransactions({ limit: 10 });
  const { data: paymentMethodsData } = usePaymentMethods();
  const topUpMutation = useWalletTopUp();
  const addPaymentMethod = useAddPaymentMethod();
  const deletePaymentMethod = useDeletePaymentMethod();
  const setDefaultPaymentMethod = useSetDefaultPaymentMethod();

  const wallet = asRecord(walletData);
  const methodsPayload = asRecord(paymentMethodsData);
  const transactionsPayload = asRecord(walletTransactionsData);
  const paymentMethods = asArray<Record<string, unknown>>(methodsPayload.items).length
    ? asArray<Record<string, unknown>>(methodsPayload.items)
    : asArray<Record<string, unknown>>(paymentMethodsData);
  const walletTransactions = asArray<Record<string, unknown>>(transactionsPayload.items).length
    ? asArray<Record<string, unknown>>(transactionsPayload.items)
    : asArray<Record<string, unknown>>(walletTransactionsData);
  const availableBalance = normalizeAmount(
    wallet.available_balance_kobo ?? wallet.availableBalanceKobo ?? wallet.available_balance ?? wallet.available_balance
  );

  const amountNumber = useMemo(() => Number(amountRaw || 0), [amountRaw]);
  const isPresetSelected = (amount: number) => amountNumber === amount;

  const handleAmountChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]/g, '');
    setAmountRaw(digitsOnly);
  };

  const handlePresetPress = (value: number) => {
    setAmountRaw(String(value));
  };

  const handleContinue = async () => {
    if (!amountNumber || topUpMutation.isPending) {
      return;
    }

    const response = await topUpMutation.mutateAsync({ amount: amountNumber });
    const record = asRecord(response);
    const authorizationUrl = (record.authorization_url ?? record.authorizationUrl) as string | undefined;
    if (authorizationUrl) {
      await Linking.openURL(authorizationUrl);
    }
    setIsSuccessModalVisible(true);
  };

  const handleAddPaymentMethod = async () => {
    if (!authCode.trim() || !lastFour.trim()) {
      return;
    }
    await addPaymentMethod.mutateAsync({
      type: 'card',
      provider: 'paystack',
      token: authCode.trim(),
      last_four: lastFour.trim().slice(-4),
      metadata: {}
    });
    setAuthCode('');
    setLastFour('');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg
        }
      ]}
    >
      <StackHeader translationKey="account.top_up_title" align="center" onBack={() => router.back()} />

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
                fontFamily: fontFamily.medium
              }
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
          translationParams={{ amount: formatNairaAmount(availableBalance, { unit: 'naira' }) }}
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
                backgroundColor: isPresetSelected(preset) ? colors.accent : colors.surface
              }
            ]}
            onPress={() => handlePresetPress(preset)}
            accessibilityRole="button"
            accessibilityLabel={`${t('account.top_up_title')} ${formatNairaAmount(preset, { unit: 'naira' })}`}
          >
            <Text variant="body">{formatNairaAmount(preset, { unit: 'naira' })}</Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.methodsCard, { backgroundColor: colors.surface }]}>
        <Text variant="body" weight="medium">
          {t('account.saved_payment_methods')}
        </Text>
        {paymentMethods.length === 0 ? (
          <Text variant="bodySmall" color="muted">
            {t('account.no_saved_payment_methods')}
          </Text>
        ) : (
          paymentMethods.map((method) => {
            const id = asString(method.id);
            const provider = asString(method.provider, 'paystack');
            const last4 = asString(method.lastFour ?? method.last_four, '----');
            const isDefault = asBoolean(method.isDefault ?? method.is_default);
            return (
              <View key={id} style={[styles.methodRow, { borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodySmall" weight="medium">
                    {provider.toUpperCase()} •••• {last4}
                  </Text>
                  <Text variant="caption" color="muted">
                    {isDefault ? t('account.default') : t('account.not_default')}
                  </Text>
                </View>
                {!isDefault ? (
                  <Pressable onPress={() => setDefaultPaymentMethod.mutate({ id })}>
                    <Ionicons name="star-outline" size={20} color={colors.primary} />
                  </Pressable>
                ) : null}
                <Pressable onPress={() => deletePaymentMethod.mutate({ id })}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            );
          })
        )}
      </View>

      <View style={[styles.methodsCard, { backgroundColor: colors.surface }]}>
        <Text variant="body" weight="medium">
          {t('account.add_payment_method')}
        </Text>
        <RNTextInput
          style={[styles.paymentInput, { borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('account.authorization_code')}
          placeholderTextColor={colors.textMuted}
          value={authCode}
          onChangeText={setAuthCode}
        />
        <RNTextInput
          style={[styles.paymentInput, { borderColor: colors.border, color: colors.textPrimary }]}
          placeholder={t('account.card_last_four')}
          placeholderTextColor={colors.textMuted}
          value={lastFour}
          onChangeText={setLastFour}
          keyboardType="number-pad"
          maxLength={4}
        />
        <Button
          title={addPaymentMethod.isPending ? t('common.loading') : t('account.add_payment_method')}
          onPress={handleAddPaymentMethod}
          disabled={addPaymentMethod.isPending}
        />
      </View>

      <View style={[styles.methodsCard, { backgroundColor: colors.surface }]}>
        <Text variant="body" weight="medium">
          Recent transactions
        </Text>
        {walletTransactions.length === 0 ? (
          <Text variant="bodySmall" color="muted">
            No transactions yet.
          </Text>
        ) : (
          walletTransactions.slice(0, 5).map((transaction) => {
            const id = asString(transaction.id);
            const type = asString(transaction.type, 'transaction');
            const status = asString(transaction.status, 'pending');
            const createdAt = asString(transaction.createdAt ?? transaction.created_at);
            const amount = normalizeAmount(
              transaction.amount_kobo ?? transaction.amountKobo ?? transaction.amount
            );
            return (
              <View key={id} style={[styles.methodRow, { borderColor: colors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodySmall" weight="medium">
                    {type.replace(/_/g, ' ')}
                  </Text>
                  <Text variant="caption" color="muted">
                    {createdAt ? new Date(createdAt).toLocaleString() : '--'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="bodySmall" weight="medium">
                    {formatNairaAmount(amount, { unit: 'naira' })}
                  </Text>
                  <Text variant="caption" color="muted">
                    {status}
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      <View style={styles.footer}>
        <Button
          translationKey="common.continue"
          fullWidth
          onPress={handleContinue}
          disabled={!amountNumber || topUpMutation.isPending}
          title={topUpMutation.isPending ? t('common.loading') : undefined}
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
          <Pressable style={[styles.modalCard, { backgroundColor: colors.surface }]} onPress={() => {}}>
            <View style={[styles.iconWrap, { backgroundColor: colors.textPrimary }]}>
              <Ionicons name="checkmark" size={48} color={colors.white} />
            </View>
            <Text variant="h3" weight="medium" align="center" translationKey="account.top_up_success_title" />
            <Text
              variant="body"
              color="muted"
              align="center"
              translationKey="account.top_up_success_message"
              translationParams={{ amount: formatNairaAmount(amountNumber, { unit: 'naira' }) }}
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
    paddingHorizontal: spacing.lg
  },
  amountCard: {
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  amountInput: {
    fontSize: 32,
    lineHeight: 40,
    marginLeft: spacing.xs
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginTop: spacing.xxl
  },
  presetButton: {
    width: '31%',
    minHeight: 50,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.sm
  },
  methodRow: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  paymentInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: 44,
    paddingHorizontal: spacing.sm
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing.xl
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: spacing.lg
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.lg
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalMessage: {
    marginTop: -spacing.xs,
    marginBottom: spacing.sm
  }
});

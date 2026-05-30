import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput as RNTextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import WebView from 'react-native-webview';

import { useWalletBalance, useWalletTopUp, useWalletTransactions, useWalletVerifyTopUp } from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { fontFamily } from '@/constants/typography';
import { asArray, asRecord, asString, parseDateTimeString } from '@/utils/api-helpers';
import { formatNairaAmount, normalizeAmount } from '@/utils/currency';

const PRESET_AMOUNTS = [5000, 10000, 20000, 30000, 40000, 50000];

const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  top_up: 'Top Up',
  ride_payment: 'Ride Payment',
  refund: 'Refund',
  platform_fee: 'Platform Fee',
  settlement: 'Settlement',
  withdrawal: 'Withdrawal'
};

type Stage = 'idle' | 'checkout' | 'verifying' | 'success';

export default function TopUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [amountRaw, setAmountRaw] = useState('');
  const [stage, setStage] = useState<Stage>('idle');
  const [paystackUrl, setPaystackUrl] = useState('');
  const [paystackReference, setPaystackReference] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationTriggered, setVerificationTriggered] = useState(false);

  const { data: walletData, refetch: refetchBalance } = useWalletBalance();
  const { data: walletTransactionsData, refetch: refetchTransactions } = useWalletTransactions({ limit: 5 });
  const topUpMutation = useWalletTopUp();
  const verifyTopUpMutation = useWalletVerifyTopUp();

  const wallet = asRecord(walletData);
  const availableBalance = normalizeAmount(wallet.available_balance_kobo, 'kobo');

  const transactionsPayload = asRecord(walletTransactionsData);
  const walletTransactions = asArray<Record<string, unknown>>(transactionsPayload.items).length
    ? asArray<Record<string, unknown>>(transactionsPayload.items)
    : asArray<Record<string, unknown>>(walletTransactionsData);

  const amountNumber = Number(amountRaw || 0);
  const isPresetSelected = (amount: number) => amountNumber === amount;

  const handleAmountChange = (value: string) => {
    setAmountRaw(value.replace(/[^\d]/g, ''));
    setErrorMessage('');
  };

  const handlePresetPress = (value: number) => {
    setAmountRaw(String(value));
    setErrorMessage('');
  };

  const handleContinue = async () => {
    if (!amountNumber || topUpMutation.isPending) return;
    setErrorMessage('');
    try {
      const response = await topUpMutation.mutateAsync({ amount: amountNumber });
      const record = asRecord(response);
      const authorizationUrl = (record.authorization_url ?? record.authorizationUrl) as string | undefined;
      const reference = asString(record.reference);
      if (authorizationUrl) {
        setPaystackUrl(authorizationUrl);
        setPaystackReference(reference);
        setVerificationTriggered(false);
        setStage('checkout');
      } else {
        setStage('success');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not start payment. Try again.');
    }
  };

  const handleVerifyTopUp = async () => {
    if (!paystackReference || verificationTriggered || verifyTopUpMutation.isPending) {
      return;
    }

    setVerificationTriggered(true);
    setErrorMessage('');
    setStage('verifying');

    try {
      await verifyTopUpMutation.mutateAsync(paystackReference);
      await refetchBalance();
      await refetchTransactions();
      setPaystackUrl('');
      setPaystackReference('');
      setStage('success');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Payment was received but could not be verified.'
      );
      setStage('idle');
      setVerificationTriggered(false);
    }
  };

  const handleWebViewNavigation = (event: { url: string }) => {
    const url = event.url.toLowerCase();
    const isCheckoutPage =
      url.includes('checkout.paystack.com') || url.includes('standard.paystack.co/pay');
    const isPostCheckout =
      !isCheckoutPage &&
      (url.includes('paystack') || url.includes('close') || url.includes('callback') || url.includes('reference='));
    if (isPostCheckout) {
      void handleVerifyTopUp();
    }
  };

  const handleCloseCheckout = () => {
    setStage('idle');
    setPaystackUrl('');
    setPaystackReference('');
    setVerificationTriggered(false);
  };

  const handleSuccessDone = () => {
    setStage('idle');
    setAmountRaw('');
    setPaystackUrl('');
    setPaystackReference('');
    setVerificationTriggered(false);
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top }
      ]}
    >
      <StackHeader translationKey="account.top_up_title" align="center" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Balance card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" color="muted" align="center">
            {t('account.available_balance')}
          </Text>
          <Text variant="h2" weight="semiBold" align="center">
            {formatNairaAmount(availableBalance, { unit: 'naira' })}
          </Text>
        </View>

        {/* Amount input */}
        <View style={[styles.amountCard, { backgroundColor: colors.surface }]}>
          <Text variant="bodySmall" color="muted">
            {t('account.top_up_enter_amount')}
          </Text>
          <View style={styles.amountRow}>
            <Text variant="h2" weight="semiBold" style={{ color: colors.textPrimary }}>
              ₦
            </Text>
            <RNTextInput
              style={[
                styles.amountInput,
                { color: colors.textPrimary, fontFamily: fontFamily.semiBold }
              ]}
              value={amountNumber ? amountNumber.toLocaleString('en-US') : ''}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
              selectionColor={colors.primary}
              accessibilityLabel={t('account.top_up_amount_input')}
            />
          </View>
        </View>

        {/* Preset amounts */}
        <View style={styles.presetsGrid}>
          {PRESET_AMOUNTS.map((preset) => (
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
            >
              <Text
                variant="bodySmall"
                weight={isPresetSelected(preset) ? 'semiBold' : 'regular'}
                style={{ color: isPresetSelected(preset) ? colors.primary : colors.textPrimary }}
              >
                {formatNairaAmount(preset, { unit: 'naira' })}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Error */}
        {errorMessage ? (
          <Text variant="bodySmall" color="error" style={styles.errorText}>
            {errorMessage}
          </Text>
        ) : null}

        {/* Recent transactions */}
        {walletTransactions.length > 0 ? (
          <View style={[styles.transactionsCard, { backgroundColor: colors.surface }]}>
            <Text variant="body" weight="semiBold">
              {t('account.recent_transactions')}
            </Text>
            {walletTransactions.map((tx) => {
              const id = asString(tx.id);
              const type = asString(tx.type, 'transaction');
              const status = asString(tx.status, 'pending');
              const createdAt = asString(tx.createdAt ?? tx.created_at);
              const amount = normalizeAmount(tx.amountKobo ?? tx.amount_kobo ?? tx.amount, 'kobo');
              const isCredit = type === 'top_up' || type === 'refund';
              return (
                <View key={id} style={[styles.txRow, { borderTopColor: colors.border }]}>
                  <View style={styles.txLeft}>
                    <Text variant="bodySmall" weight="medium">
                      {TRANSACTION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ')}
                    </Text>
                    <Text variant="caption" color="muted">
                      {createdAt ? (parseDateTimeString(createdAt)?.toLocaleDateString() ?? '--') : '--'}
                    </Text>
                  </View>
                  <View style={styles.txRight}>
                    <Text
                      variant="bodySmall"
                      weight="semiBold"
                      style={{ color: isCredit ? colors.success : colors.textPrimary }}
                    >
                      {isCredit ? '+' : '-'}{formatNairaAmount(amount, { unit: 'naira' })}
                    </Text>
                    <Text variant="caption" color="muted">
                      {status}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {/* Continue button pinned above keyboard */}
      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.md }
        ]}
      >
        <Button
          title={topUpMutation.isPending ? t('account.top_up_processing') : t('account.top_up_pay_with_paystack')}
          fullWidth
          onPress={handleContinue}
          disabled={!amountNumber || topUpMutation.isPending}
        />
      </View>

      {/* Paystack WebView checkout */}
      {(stage === 'checkout' || stage === 'verifying') && paystackUrl ? (
        <Modal visible animationType="slide" onRequestClose={handleCloseCheckout}>
          <View style={[styles.webContainer, { backgroundColor: colors.background, paddingTop: insets.top }]}>
            <View style={[styles.webHeader, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={handleCloseCheckout}
                hitSlop={12}
                accessibilityRole="button"
                accessibilityLabel={t('account.top_up_close_payment')}
              >
                <MaterialCommunityIcons name="close" size={26} color={colors.textPrimary} />
              </Pressable>
              <Text variant="body" weight="semiBold">
                {t('account.top_up_pay_with_paystack')}
              </Text>
              <View style={{ width: 26 }} />
            </View>
            <WebView
              source={{ uri: paystackUrl }}
              onNavigationStateChange={handleWebViewNavigation}
              scrollEnabled={stage !== 'verifying'}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webLoading}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            />
            <View style={styles.checkoutFooter}>
              <Button
                title={verifyTopUpMutation.isPending ? 'Verifying payment...' : 'I have completed payment'}
                fullWidth
                onPress={handleVerifyTopUp}
                disabled={verifyTopUpMutation.isPending}
              />
            </View>
          </View>
        </Modal>
      ) : null}

      {/* Success modal */}
      <Modal
        transparent
        animationType="fade"
        visible={stage === 'success'}
        onRequestClose={handleSuccessDone}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={40} color={colors.white} />
            </View>
            <Text variant="h3" weight="semiBold" align="center" translationKey="account.top_up_success_title" />
            <Text
              variant="body"
              color="muted"
              align="center"
              translationKey="account.top_up_success_message"
              translationParams={{ amount: formatNairaAmount(amountNumber, { unit: 'naira' }) }}
              style={styles.modalMessage}
            />
            <Button translationKey="account.got_it" fullWidth onPress={handleSuccessDone} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md
  },
  balanceCard: {
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs
  },
  amountCard: {
    borderRadius: borderRadius.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.xs
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    lineHeight: 40
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm
  },
  presetButton: {
    width: '31%',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorText: {
    textAlign: 'center'
  },
  transactionsCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.xs
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  txLeft: {
    flex: 1,
    gap: 2
  },
  txRight: {
    alignItems: 'flex-end',
    gap: 2
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md
  },
  webContainer: {
    flex: 1
  },
  webHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  webLoading: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkoutFooter: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md
  },
  modalBackdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
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
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalMessage: {
    marginBottom: spacing.xs
  }
});

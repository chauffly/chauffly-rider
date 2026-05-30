import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import WebView from 'react-native-webview';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBookingById, useBookingPay, useCurrentUser, useWalletBalance } from '@/api-client';
import { asRecord, asString } from '@/utils/api-helpers';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { formatNairaAmount } from '@/utils/currency';

interface PaymentModalProps {
  visible: boolean;
  bookingId: string;
  fare: { tripFare: number; surgeFee: number; tax: number; total: number; currency: string } | null;
  onClose: () => void;
  onPaid: (method: 'wallet' | 'paystack' | 'company') => void;
}

type Stage = 'choose' | 'wallet' | 'paystack-init' | 'paystack-checkout' | 'verifying' | 'payment-pending';

const koboToNaira = (kobo: number) => Math.round(kobo / 100);

export function PaymentModal({ visible, bookingId, fare, onClose, onPaid }: PaymentModalProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: walletData, refetch: refetchBalance } = useWalletBalance({ enabled: visible });
  const { data: currentUserData, refetch: refetchCurrentUser } = useCurrentUser();
  const { data: bookingData } = useBookingById(bookingId, { enabled: visible && Boolean(bookingId) });
  const payMutation = useBookingPay();

  const [stage, setStage] = useState<Stage>('choose');
  const [errorMessage, setErrorMessage] = useState('');
  const [paystackAuthUrl, setPaystackAuthUrl] = useState('');
  const [paystackReference, setPaystackReference] = useState('');

  useEffect(() => {
    if (visible) {
      setStage('choose');
      setErrorMessage('');
      setPaystackAuthUrl('');
      setPaystackReference('');
      setVerificationTriggered(false);
      setPendingAmountKobo(0);
      void refetchBalance();
      void refetchCurrentUser();
    }
  }, [visible, refetchBalance, refetchCurrentUser]);

  const totalNaira = Math.round(fare?.total ?? 0);
  const walletAvailableKobo = walletData?.available_balance_kobo ?? 0;
  const walletAvailableNaira = koboToNaira(walletAvailableKobo);
  const hasEnoughWallet = walletAvailableNaira >= totalNaira && totalNaira > 0;
  const companyMembership = asRecord(asRecord(currentUserData).companyMembership);
  const membership = asRecord(companyMembership.membership);
  const organization = asRecord(companyMembership.organization);
  const booking = asRecord(asRecord(bookingData).booking);
  const totalFareKobo = Math.round((fare?.total ?? 0) * 100);
  const orgWalletBalanceKobo = Number(organization.walletBalanceKobo ?? 0);
  const orgWalletBalanceNaira = koboToNaira(orgWalletBalanceKobo);
  const membershipActive = asString(membership.status) === 'active' && Boolean(organization.id);
  const companyHasFunds = orgWalletBalanceKobo >= totalFareKobo && totalFareKobo > 0;
  const companyEligible = membershipActive && companyHasFunds;
  const companySubtitle = membershipActive
    ? `${asString(organization.name, 'Company account')} · Balance: ₦${orgWalletBalanceNaira.toLocaleString()}`
    : 'Use company travel policy for this trip.';
  const companyReason = membershipActive
    ? `Insufficient company wallet balance (₦${orgWalletBalanceNaira.toLocaleString()} available).`
    : asString(membership.status)
      ? 'Company membership is not active.'
      : 'Join a company to use company payment.';

  const handleWallet = async () => {
    if (!bookingId) {
      return;
    }
    setErrorMessage('');
    setStage('wallet');
    try {
      const result = await payMutation.mutateAsync({ bookingId, method: 'wallet' });
      if (result.status === 'completed') {
        onPaid('wallet');
        return;
      }
      if (result.status === 'insufficient_funds') {
        setErrorMessage('Wallet balance is not enough. Switch to card payment.');
        setStage('choose');
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Wallet payment failed.');
      setStage('choose');
    }
  };

  const handleCompany = async () => {
    if (!bookingId) {
      return;
    }
    setErrorMessage('');
    try {
      const result = await payMutation.mutateAsync({ bookingId, method: 'company' });
      if (result.status === 'completed') {
        void refetchCurrentUser();
        onPaid('company');
        return;
      }
      setErrorMessage('Company payment is unavailable for this trip.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Company payment failed.');
    }
  };

  const handlePaystackInit = async () => {
    if (!bookingId) {
      return;
    }
    setErrorMessage('');
    setStage('paystack-init');
    try {
      const result = await payMutation.mutateAsync({ bookingId, method: 'paystack' });
      if (result.status === 'pending' && result.method === 'paystack') {
        setPaystackAuthUrl(result.authorizationUrl);
        setPaystackReference(result.reference);
        setStage('paystack-checkout');
        return;
      }
      if (result.status === 'completed') {
        onPaid('paystack');
        return;
      }
      setErrorMessage('Unexpected response from payment service.');
      setStage('choose');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not start Paystack payment.');
      setStage('choose');
    }
  };

  const [verificationTriggered, setVerificationTriggered] = useState(false);
  const [pendingAmountKobo, setPendingAmountKobo] = useState(0);

  const runPaystackVerification = async (reference: string, isRecheck = false) => {
    if (!bookingId) return;
    setVerificationTriggered(true);
    setStage('verifying');
    setErrorMessage('');
    try {
      const result = await payMutation.mutateAsync({ bookingId, method: 'paystack', reference });
      if (result.status === 'completed') {
        onPaid('paystack');
        return;
      }
      if (result.status === 'payment_pending') {
        setPendingAmountKobo(result.amountKobo ?? 0);
        setStage('payment-pending');
        setVerificationTriggered(false);
        return;
      }
      if (isRecheck) {
        setErrorMessage('Payment not confirmed yet. Please wait a moment and try again.');
        setStage('payment-pending');
      } else {
        setErrorMessage('Payment could not be verified. Please try again.');
        setStage('choose');
      }
      setVerificationTriggered(false);
    } catch (error) {
      if (isRecheck) {
        setErrorMessage(error instanceof Error ? error.message : 'Verification failed. Please try again.');
        setStage('payment-pending');
      } else {
        setErrorMessage(error instanceof Error ? error.message : 'Payment verification failed.');
        setStage('choose');
      }
      setVerificationTriggered(false);
    }
  };

  const handlePaystackComplete = async () => {
    if (!bookingId || !paystackReference) return;
    if (verificationTriggered) return;
    await runPaystackVerification(paystackReference, false);
  };

  const handleWebViewNavigation = (event: { url: string }) => {
    const url = event.url.toLowerCase();
    const isCheckoutPage =
      url.includes('checkout.paystack.com') || url.includes('standard.paystack.co/pay');
    // After payment, Paystack redirects to a close/callback page or returns to a thank-you screen.
    const isPostCheckout =
      !isCheckoutPage &&
      (url.includes('paystack') ||
        url.includes('close') ||
        url.includes('callback') ||
        url.includes('reference='));
    if (isPostCheckout) {
      void handlePaystackComplete();
    }
  };

  if (!visible) {
    return null;
  }

  if (stage === 'payment-pending') {
    const pendingNaira = koboToNaira(pendingAmountKobo || Math.round((fare?.total ?? 0) * 100));
    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.pendingIconWrap}>
              <MaterialCommunityIcons name="clock-outline" size={40} color={colors.primary} />
            </View>
            <Text variant="h3" weight="medium" align="center">
              Payment Pending
            </Text>
            <Text variant="body" align="center" color="muted">
              Your payment of {formatNairaAmount(pendingNaira)} is being verified by Paystack.
              This usually takes a few seconds.
            </Text>
            <Pressable
              style={[styles.confirmButton, { backgroundColor: colors.primary }]}
              disabled={verificationTriggered}
              onPress={() => void runPaystackVerification(paystackReference, true)}
            >
              {verificationTriggered ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text variant="body" weight="medium" color="inverse">
                  Check Payment Status
                </Text>
              )}
            </Pressable>
            <Pressable onPress={onClose} style={styles.pendingClose}>
              <Text variant="caption" color="muted">
                Close and check later
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }

  if (stage === 'paystack-checkout' && paystackAuthUrl) {
    return (
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={[styles.webContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.webHeader, { borderBottomColor: colors.border, paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close payment"
            >
              <MaterialCommunityIcons name="close" size={26} color={colors.textPrimary} />
            </Pressable>
            <Text variant="body" weight="medium">
              Pay with Paystack
            </Text>
            <View style={{ width: 26 }} />
          </View>
          <WebView
            source={{ uri: paystackAuthUrl }}
            onNavigationStateChange={handleWebViewNavigation}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webLoading}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          />
          <Pressable
            style={[styles.confirmButton, { backgroundColor: colors.primary, margin: spacing.lg }]}
            onPress={handlePaystackComplete}
          >
            <Text variant="body" weight="medium" color="inverse">
              I have completed payment
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text variant="h3" weight="medium" align="center">
            Complete your payment
          </Text>
          <Text variant="bodySmall" color="muted" align="center">
            Your trip total is {formatNairaAmount(totalNaira)}.
          </Text>

          {fare ? (
            <View style={[styles.fareBox, { borderColor: colors.border }]}>
              <View style={styles.row}>
                <Text variant="bodySmall" color="muted">
                  Trip Fare
                </Text>
                <Text variant="bodySmall">{formatNairaAmount(Math.round(fare.tripFare))}</Text>
              </View>
              {fare.surgeFee > 0 ? (
                <View style={styles.row}>
                  <Text variant="bodySmall" color="muted">
                    Surge Fee
                  </Text>
                  <Text variant="bodySmall">{formatNairaAmount(Math.round(fare.surgeFee))}</Text>
                </View>
              ) : null}
              <View style={styles.row}>
                <Text variant="bodySmall" color="muted">
                  Tax (7.5%)
                </Text>
                <Text variant="bodySmall">{formatNairaAmount(Math.round(fare.tax))}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.row}>
                <Text variant="body" weight="medium">
                  Total
                </Text>
                <Text variant="body" weight="semiBold">
                  {formatNairaAmount(totalNaira)}
                </Text>
              </View>
            </View>
          ) : null}

          <Pressable
            style={[
              styles.option,
              {
                borderColor: hasEnoughWallet ? colors.primary : colors.border,
                opacity: payMutation.isPending ? 0.6 : 1
              }
            ]}
            disabled={payMutation.isPending}
            onPress={handleWallet}
          >
            <MaterialCommunityIcons name="wallet-outline" size={22} color={colors.textPrimary} />
            <View style={styles.optionTextWrap}>
              <Text variant="body" weight="medium">
                Pay with Wallet
              </Text>
              <Text variant="caption" color="muted">
                Balance: {formatNairaAmount(walletAvailableNaira)}{' '}
                {hasEnoughWallet ? '' : '(insufficient)'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>

          {(Boolean(organization.id) || asString(membership.status).length > 0 || Boolean(booking.organizationId)) ? (
            <Pressable
              style={[
                styles.option,
                {
                  borderColor: companyEligible ? colors.primary : colors.border,
                  opacity: payMutation.isPending || !companyEligible ? 0.6 : 1
                }
              ]}
              disabled={payMutation.isPending || !companyEligible}
              onPress={handleCompany}
            >
              <MaterialCommunityIcons
                name="office-building-outline"
                size={22}
                color={colors.textPrimary}
              />
              <View style={styles.optionTextWrap}>
                <Text variant="body" weight="medium">
                  Pay with Company
                </Text>
                <Text variant="caption" color={companyEligible ? 'muted' : 'error'}>
                  {companyEligible ? companySubtitle : companyReason}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          ) : null}

          <Pressable
            style={[styles.option, { borderColor: colors.border, opacity: payMutation.isPending ? 0.6 : 1 }]}
            disabled={payMutation.isPending}
            onPress={handlePaystackInit}
          >
            <MaterialCommunityIcons name="credit-card-outline" size={22} color={colors.textPrimary} />
            <View style={styles.optionTextWrap}>
              <Text variant="body" weight="medium">
                Pay with Card (Paystack)
              </Text>
              <Text variant="caption" color="muted">
                Debit/credit card via Paystack
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </Pressable>

          {payMutation.isPending || stage === 'wallet' || stage === 'paystack-init' || stage === 'verifying' ? (
            <View style={styles.pendingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text variant="caption" color="muted">
                {stage === 'verifying' ? 'Verifying payment…' : 'Processing…'}
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
            <Text variant="caption" color="error" align="center">
              {errorMessage}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end'
  },
  card: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    gap: spacing.md
  },
  fareBox: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  divider: {
    height: 1,
    marginVertical: spacing.xs
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md
  },
  optionTextWrap: {
    flex: 1,
    gap: 2
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
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
    borderBottomWidth: 1
  },
  webLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmButton: {
    borderRadius: borderRadius.full,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center'
  },
  pendingIconWrap: {
    alignItems: 'center',
    paddingVertical: spacing.sm
  },
  pendingClose: {
    alignItems: 'center',
    paddingTop: spacing.xs
  }
});

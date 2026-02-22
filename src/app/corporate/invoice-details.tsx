import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';
import { useTranslation } from '@/context/language-context';

export default function InvoiceDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();

  const invoice = localJsonApi.getCorporateInvoiceById(id ?? '');

  if (!invoice) return null;

  const handleCopyTransactionId = async () => {
    await Clipboard.setStringAsync(invoice.transaction_id);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <StackHeader
        translationKey="corporate.billing.details_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.amountCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.plusIconWrap, { borderColor: colors.primary }]}>
            <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
          </View>
          <Text variant="h1" weight="semiBold" size="h1">{invoice.amount}</Text>
          <Text variant="body" weight="medium">{invoice.payment_method}</Text>
          <Text variant="bodySmall" color="muted">
            {t('corporate.billing.from_payment', { method: invoice.payment_card })}
          </Text>
        </View>

        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text variant="body" weight="semiBold">{t('corporate.billing.status')}</Text>
            <View style={[styles.statusBadge, { borderColor: colors.success }]}>
              <Text variant="caption" color="success">{t('corporate.billing.completed')}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Text variant="body" color="muted">{t('corporate.billing.payment')}</Text>
            <Text variant="body">{invoice.payment_card}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="body" color="muted">{t('corporate.billing.date')}</Text>
            <Text variant="body">{invoice.full_date}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="body" color="muted">{t('corporate.billing.time')}</Text>
            <Text variant="body">{invoice.time}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text variant="body" color="muted">{t('corporate.billing.transaction_id')}</Text>
            <View style={styles.transactionIdRow}>
              <Text variant="body">{invoice.transaction_id}</Text>
              <Pressable onPress={handleCopyTransactionId} hitSlop={8}>
                <MaterialCommunityIcons name="content-copy" size={18} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Button
        translationKey="corporate.billing.share_receipt"
        variant="ghost"
        style={[styles.shareButton, { borderColor: colors.primary}]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  amountCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  plusIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  detailsSection: {
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  transactionIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  shareButton: {
    marginBottom: spacing.md,
    borderWidth: 1,
  },
});

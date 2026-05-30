import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';

import { useCorporateInvoices } from '@/api-client';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount } from '@/utils/currency';

type BillingFilter = 'paid' | 'cancelled';

export default function BillingInvoiceTabScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<BillingFilter>('paid');
  const [search, setSearch] = useState('');

  const { data: invoicesData } = useCorporateInvoices();
  const invoices = asArray<Record<string, unknown>>(asRecord(invoicesData).items);

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const status = asString(invoice.status).toLowerCase();
        const matchesFilter = filter === 'paid' ? status === 'paid' : status !== 'paid';
        if (!matchesFilter) {
          return false;
        }

        const query = search.trim().toLowerCase();
        if (!query) {
          return true;
        }

        const invoiceId = asString(invoice.id).toLowerCase();
        const amount = asString(invoice.totalAmount ?? invoice.total_amount).toLowerCase();
        return invoiceId.includes(query) || amount.includes(query) || status.includes(query);
      }),
    [filter, invoices, search]
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text variant="h2" weight="medium">
            {t('corporate.billing.title')}
          </Text>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('paid')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === 'paid' ? colors.textPrimary : 'transparent',
                borderColor: filter === 'paid' ? colors.textPrimary : colors.border
              }
            ]}
          >
            <Text variant="bodySmall" color={filter === 'paid' ? 'inverse' : 'primary'}>
              {t('corporate.billing.paid')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setFilter('cancelled')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === 'cancelled' ? colors.textPrimary : 'transparent',
                borderColor: filter === 'cancelled' ? colors.textPrimary : colors.border
              }
            ]}
          >
            <Text variant="bodySmall" color={filter === 'cancelled' ? 'inverse' : 'primary'}>
              {t('corporate.billing.cancelled')}
            </Text>
          </Pressable>
        </View>

        <TextInput
          label="Search"
          placeholder="Search invoices"
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.invoiceList}>
          {filteredInvoices.map((invoice) => {
            const invoiceId = asString(invoice.id);
            const amount = formatNairaAmount(invoice.totalAmount);
            const periodStart = asString(invoice.periodStart);
            const periodEnd = asString(invoice.periodEnd);
            const createdAt = asString(invoice.createdAt);
            const dateLabel = createdAt ? format(new Date(createdAt), 'MMM d, yyyy') : '--';
            const periodLabel =
              periodStart && periodEnd
                ? `${format(new Date(periodStart), 'MMM d')} - ${format(new Date(periodEnd), 'MMM d')}`
                : dateLabel;

            return (
              <Pressable
                key={invoiceId}
                style={[styles.invoiceRow, { borderBottomColor: colors.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/corporate/invoice-details',
                    params: { id: invoiceId }
                  })
                }
              >
                <View style={[styles.invoiceIcon, { backgroundColor: colors.accent }]}>
                  <MaterialCommunityIcons name="file-document-outline" size={20} color={colors.primary} />
                </View>
                <View style={styles.invoiceInfo}>
                  <Text variant="body" weight="medium" numberOfLines={1}>
                    {t('corporate.billing.invoice_label')} #{invoiceId.slice(0, 8)}
                  </Text>
                  <Text variant="caption" color="muted">
                    {periodLabel}
                  </Text>
                </View>
                <View style={styles.invoiceRight}>
                  <Text variant="body" weight="medium">
                    {amount}
                  </Text>
                  {filter === 'paid' ? (
                  <Text variant="caption" color="muted">
                      {t('corporate.billing.completed')}
                    </Text>
                  ) : (
                    <Text variant="caption" color={asString(invoice.status).toLowerCase() === 'overdue' ? 'error' : 'muted'}>
                      {asString(invoice.status, 'pending').replace(/_/g, ' ')}
                    </Text>
                  )}
                </View>
              </Pressable>
            );
          })}
          {filteredInvoices.length === 0 ? (
            <View style={[styles.emptyState, { borderColor: colors.border }]}>
              <Text variant="body" color="muted">
                No invoices found for this filter.
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterRow: { flexDirection: 'row', gap: spacing.sm },
  filterChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1
  },
  invoiceList: { gap: 0 },
  emptyState: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.lg
  },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md
  },
  invoiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  invoiceInfo: {
    flex: 1,
    gap: 8
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 8
  }
});

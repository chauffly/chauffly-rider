import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi, type CorporateInvoice } from '@/api/local-json-api';
import { useTranslation } from '@/context/language-context';

const invoiceImages: Record<CorporateInvoice['image'], number> = {
  'go.png': require('@assets/images/ride-options/go.png'),
  'plus.png': require('@assets/images/ride-options/plus.png'),
  'luxe.png': require('@assets/images/ride-options/luxe.png'),
  'black.png': require('@assets/images/ride-options/black.png'),
};

type BillingFilter = 'paid' | 'cancelled';

export default function BillingInvoiceTabScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [filter, setFilter] = useState<BillingFilter>('paid');
  const invoices = localJsonApi.getCorporateInvoices();

  const filteredInvoices = invoices.filter((inv) => inv.status === filter);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24}]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text variant="h2" weight="medium" >{t('corporate.billing.title')}</Text>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
        </View>

        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('paid')}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === 'paid' ? colors.textPrimary : 'transparent',
                borderColor: filter === 'paid' ? colors.textPrimary : colors.border,
              },
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
                borderColor: filter === 'cancelled' ? colors.textPrimary : colors.border,
              },
            ]}
          >
            <Text variant="bodySmall" color={filter === 'cancelled' ? 'inverse' : 'primary'}>
              {t('corporate.billing.cancelled')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.invoiceList}>
          {filteredInvoices.map((invoice) => (
            <Pressable
              key={invoice.id}
              style={[styles.invoiceRow, { borderBottomColor: colors.border }]}
              onPress={() => router.push({ pathname: '/corporate/invoice-details' as never, params: { id: invoice.id } })}
            >
              <Image source={invoiceImages[invoice.image]} style={styles.invoiceImage} resizeMode="contain" />
              <View style={styles.invoiceInfo}>
                <Text variant="body" weight="medium" numberOfLines={1}>{invoice.destination}</Text>
                <Text variant="caption" color="muted">{invoice.date}</Text>
              </View>
              <View style={styles.invoiceRight}>
                <Text variant="body" weight="medium">{invoice.amount}</Text>
                {filter === 'paid' ? (
                  <Text variant="caption" color="muted">{invoice.payment_method}</Text>
                ) : (
                  <Text variant="caption" color="error">{t('corporate.billing.cancelled')}</Text>
                )}
              </View>
            </Pressable>
          ))}
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
    borderWidth: 1,
  },
  invoiceList: { gap: 0 },
  invoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  invoiceImage: {
    width: 56,
    height: 36,
  },
  invoiceInfo: {
    flex: 1,
    gap:8
  },
  invoiceRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
});

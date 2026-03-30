import { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useCorporateSummary, useCorporateUsage } from '@/api-client';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';
import { formatNairaAmount, normalizeAmount } from '@/utils/currency';

type CorporatePeriodKey = 'today' | 'last_7_days' | 'last_30_days';

const periodButtons: { key: CorporatePeriodKey; translationKey: string }[] = [
  { key: 'today', translationKey: 'corporate.dashboard.period_today' },
  { key: 'last_7_days', translationKey: 'corporate.dashboard.period_last_7_days' },
  { key: 'last_30_days', translationKey: 'corporate.dashboard.period_last_30_days' }
];

const getUsageTicks = (values: number[]): number[] => {
  const max = Math.max(...values, 1);
  const step = Math.max(1, Math.ceil(max / 4));
  return [0, step, step * 2, step * 3, step * 4];
};

export function CorporateDashboardContent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const [period, setPeriod] = useState<CorporatePeriodKey>('today');

  const { data: summaryData, refetch: refetchSummary } = useCorporateSummary(period);
  const { data: usageData, refetch: refetchUsage } = useCorporateUsage({ limit: 7 });
  const [refreshing, setRefreshing] = useState(false);

  const summary = asRecord(summaryData);
  const usageItems = asArray<Record<string, unknown>>(asRecord(usageData).items);

  const usagePoints = useMemo(
    () =>
      usageItems.slice(0, 7).map((item, index) => ({
        label: `#${index + 1}`,
        value: Number(normalizeAmount(item.totalSpend, 'naira'))
      })),
    [usageItems]
  );
  const yTicks = getUsageTicks(usagePoints.map((point) => point.value));
  const maxTick = Math.max(...yTicks, 1);

  const totalEmployees = Number(summary.totalEmployees ?? 0);
  const totalRides = Number(summary.totalRides ?? 0);
  const newEmployees = Number(summary.newEmployees ?? 0);
  const monthlyUsage = formatNairaAmount(summary.monthlyUsage, { unit: 'naira' });

  const growth = asRecord(summary.growth);
  const ridesGrowth = `${Number(growth.ridesPercent ?? 0).toFixed(1)}%`;
  const usageGrowth = `${Number(growth.usagePercent ?? 0).toFixed(1)}%`;
  const employeesGrowth = `${Number(growth.employeesPercent ?? 0).toFixed(1)}%`;

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.allSettled([refetchSummary(), refetchUsage()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchSummary, refetchUsage]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: colors.border }]}>
                <MaterialCommunityIcons name="account" size={30} color={colors.textSecondary} />
              </View>
              <View>
                <Text variant="body" color="muted">
                  {t('corporate.dashboard.greeting')}
                </Text>
                <Text variant="body" weight="semiBold">
                  {t('corporate.dashboard.admin')}
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.periodRow}>
            {periodButtons.map((item) => {
              const active = item.key === period;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setPeriod(item.key)}
                  style={[
                    styles.periodButton,
                    {
                      backgroundColor: active ? colors.textPrimary : colors.surface,
                      borderColor: active ? colors.textPrimary : colors.border
                    }
                  ]}
                >
                  <Text variant="bodySmall" color={active ? 'inverse' : 'secondary'}>
                    {t(item.translationKey)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title={t('corporate.dashboard.total_employee')}
            value={`${totalEmployees}`}
            growth={employeesGrowth}
            icon="account-group-outline"
          />
          <MetricCard
            title={t('corporate.dashboard.total_rides')}
            value={`${totalRides}`}
            growth={ridesGrowth}
            icon="car-outline"
          />
          <MetricCard
            title={t('corporate.dashboard.new_employee')}
            value={`${newEmployees}`}
            growth={employeesGrowth}
            icon="account-plus-outline"
          />
          <MetricCard
            title={t('corporate.dashboard.monthly_usage')}
            value={monthlyUsage}
            growth={usageGrowth}
            icon="pulse"
          />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionChip, { backgroundColor: colors.textPrimary }]}
            onPress={() => router.push('/corporate/travel-policies')}
          >
            <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.textInverse} />
            <Text variant="bodySmall" color="inverse" weight="medium">
              {t('corporate.dashboard.set_travel_limit')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.actionChip, { backgroundColor: colors.textPrimary }]}
            onPress={() => router.push('/corporate/add-employee')}
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.textInverse} />
            <Text variant="bodySmall" color="inverse" weight="medium">
              {t('corporate.dashboard.add_employee')}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.usageCard, { backgroundColor: colors.surface }]}>
          <Text variant="h3" weight="medium">
            {t('corporate.dashboard.usage_overview')}
          </Text>

          <View style={styles.chartRow}>
            <View style={styles.yAxisWrap}>
              {[...yTicks].reverse().map((tick) => (
                <Text key={tick} variant="caption" color="muted">
                  {tick}
                </Text>
              ))}
            </View>

            <View style={styles.chartAndXAxis}>
              <View style={styles.chartWrap}>
                {usagePoints.map((point, index) => (
                  <View key={`${point.label}-${index}`} style={styles.barSlot}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(point.value / maxTick) * 100}%`,
                          backgroundColor: index % 2 === 0 ? colors.border : colors.primary
                        }
                      ]}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.xAxisWrap}>
                {usagePoints.map((point, index) => (
                  <Text
                    key={`${point.label}-${index}-x`}
                    variant="caption"
                    color="muted"
                    align="center"
                    style={styles.xAxisLabel}
                  >
                    {point.label}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function MetricCard({
  title,
  value,
  growth,
  icon
}: {
  title: string;
  value: string;
  growth: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
      <Text variant="bodySmall" color="muted">
        {title}
      </Text>
      <View style={styles.metricValueRow}>
        <Text variant="h3" weight="semiBold">
          {value}
        </Text>
        <MaterialCommunityIcons name={icon} size={24} color={colors.textPrimary} />
      </View>
      <Text variant="caption" color="success">
        {growth}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  stickyHeader: { paddingBottom: spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  avatarWrap: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  periodRow: { gap: spacing.sm, marginTop: spacing.md },
  periodButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full, borderWidth: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  metricCard: { width: '48%', borderRadius: borderRadius.xl, padding: spacing.md, gap: spacing.xs },
  metricValueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  actionChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm
  },
  usageCard: { borderRadius: borderRadius.xxl, padding: spacing.md, gap: spacing.md },
  chartRow: { flexDirection: 'row', gap: spacing.sm },
  yAxisWrap: {
    width: 34,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  chartAndXAxis: { flex: 1, gap: spacing.xs },
  chartWrap: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: borderRadius.md },
  xAxisWrap: { flexDirection: 'row', gap: spacing.sm },
  xAxisLabel: { flex: 1 }
});

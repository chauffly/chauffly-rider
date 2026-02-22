import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi, type CorporatePeriodKey } from '@/api/local-json-api';
import { useTranslation } from '@/context/language-context';

const periodButtons: { key: CorporatePeriodKey; translationKey: string }[] = [
  { key: 'today', translationKey: 'corporate.dashboard.period_today' },
  { key: 'yesterday', translationKey: 'corporate.dashboard.period_yesterday' },
  { key: 'last_7_days', translationKey: 'corporate.dashboard.period_last_7_days' },
  { key: 'last_30_days', translationKey: 'corporate.dashboard.period_last_30_days' },
];

export function CorporateDashboardContent() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const router = useRouter();
  const [period, setPeriod] = useState<CorporatePeriodKey>('today');

  const summary = localJsonApi.getCorporateSummary(period);
  const usageOverview = localJsonApi.getCorporateUsageOverview(period);
  const maxTick = Math.max(...usageOverview.yTicks, 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}> 
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={[styles.stickyHeader, { backgroundColor: colors.background }]}> 
          <View style={styles.header}>
            <View style={styles.avatarWrap}>
              <View style={[styles.avatar, { backgroundColor: colors.border }]}> 
                <MaterialCommunityIcons name="account" size={30} color={colors.textSecondary} />
              </View>
              <View>
                <Text variant="body" color="muted">{t('corporate.dashboard.greeting')}</Text>
                <Text variant="body" weight="semiBold">{t('corporate.dashboard.admin')}</Text>
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
                      borderColor: active ? colors.textPrimary : colors.border,
                    },
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
          <MetricCard title={t('corporate.dashboard.total_employee')} value={`${summary.total_employees}`} growth={summary.growth.total_employees} icon="account-group-outline" />
          <MetricCard title={t('corporate.dashboard.total_rides')} value={`${summary.total_rides}`} growth={summary.growth.total_rides} icon="car-outline" />
          <MetricCard title={t('corporate.dashboard.new_employee')} value={`${summary.new_employees}`} growth={summary.growth.new_employees} icon="account-plus-outline" />
          <MetricCard title={t('corporate.dashboard.monthly_usage')} value={summary.monthly_usage} growth={summary.growth.monthly_usage} icon="pulse" />
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={[styles.actionChip, { backgroundColor: colors.textPrimary }]}
            onPress={() => router.push('/corporate/travel-policies' as never)}
          >
            <MaterialCommunityIcons name="arrow-top-right" size={18} color={colors.textInverse} />
            <Text variant="bodySmall" color="inverse" weight="medium">{t('corporate.dashboard.set_travel_limit')}</Text>
          </Pressable>
          <Pressable
            style={[styles.actionChip, { backgroundColor: colors.textPrimary }]}
            onPress={() => router.push('/corporate/add-employee' as never)}
          >
            <MaterialCommunityIcons name="plus" size={18} color={colors.textInverse} />
            <Text variant="bodySmall" color="inverse" weight="medium">{t('corporate.dashboard.add_employee')}</Text>
          </Pressable>
        </View>

        <View style={[styles.usageCard, { backgroundColor: colors.surface }]}> 
          <Text variant="h3" weight="medium">{t('corporate.dashboard.usage_overview')}</Text>

          <View style={styles.chartRow}>
            <View style={styles.yAxisWrap}>
              {[...usageOverview.yTicks].reverse().map((tick) => (
                <Text key={tick} variant="caption" color="muted">{tick}</Text>
              ))}
            </View>

            <View style={styles.chartAndXAxis}>
              <View style={styles.chartWrap}>
                {usageOverview.points.map((point, index) => (
                  <View key={`${point.label}-${index}`} style={styles.barSlot}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: `${(point.value / maxTick) * 100}%`,
                          backgroundColor: index % 2 === 0 ? colors.border : colors.primary,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>

              <View style={styles.xAxisWrap}>
                {usageOverview.points.map((point, index) => (
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

function MetricCard({ title, value, growth, icon }: { title: string; value: string; growth: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.surface }]}> 
      <Text variant="bodySmall" color="muted">{title}</Text>
      <View style={styles.metricValueRow}>
        <Text variant="h3" weight="semiBold">{value}</Text>
        <MaterialCommunityIcons name={icon} size={24} color={colors.textPrimary} />
      </View>
      <Text variant="caption" color="success">{growth}</Text>
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
    gap: spacing.sm,
  },
  usageCard: { borderRadius: borderRadius.xxl, padding: spacing.md, gap: spacing.md },
  chartRow: { flexDirection: 'row', gap: spacing.sm },
  yAxisWrap: {
    width: 34,
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  chartAndXAxis: { flex: 1, gap: spacing.xs },
  chartWrap: { height: 150, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: borderRadius.md },
  xAxisWrap: { flexDirection: 'row', gap: spacing.sm },
  xAxisLabel: { flex: 1 },
});

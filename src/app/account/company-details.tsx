import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useMyCompanyBudget } from '@/api-client';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

const formatCurrency = (amount: number) =>
  `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatPeriod = (period: string | null) => {
  if (!period) return 'monthly';
  return period.charAt(0).toUpperCase() + period.slice(1);
};

const formatAllowedHours = (hours: Record<string, unknown> | null): string => {
  if (!hours) return 'Anytime';
  const weekdays = hours.weekdays as { start?: string; end?: string } | undefined;
  if (!weekdays?.start || !weekdays?.end) return 'Anytime';
  if (weekdays.start === '06:00' && weekdays.end === '22:00') return '6 AM – 10 PM';
  if (weekdays.start === '07:00' && weekdays.end === '19:00') return '7 AM – 7 PM';
  if (weekdays.start === '00:00' && weekdays.end === '23:59') return '24 Hours';
  return `${weekdays.start} – ${weekdays.end}`;
};

export default function CompanyDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { data, isLoading } = useMyCompanyBudget();

  const company = data?.company ?? null;
  const memberStatus = data?.memberStatus ?? null;
  const policy = data?.policy ?? null;
  const usage = data?.usage ?? null;

  const budgetLimit = policy?.budgetLimit ?? null;
  const periodSpend = usage?.periodSpend ?? 0;
  const periodRides = usage?.periodRides ?? 0;
  const budgetProgress = budgetLimit && budgetLimit > 0 ? Math.min(periodSpend / budgetLimit, 1) : 0;
  const budgetRemaining = budgetLimit != null ? Math.max(budgetLimit - periodSpend, 0) : null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md
        }
      ]}
    >
      <StackHeader title="Company Details" align="center" onBack={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Text variant="body" color="muted" align="center">
            Loading...
          </Text>
        ) : !company ? (
          <Text variant="body" color="muted" align="center">
            No company membership found.
          </Text>
        ) : (
          <>
            {/* Company header */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
                  <MaterialCommunityIcons name="office-building" size={22} color={colors.primary} />
                </View>
                <View style={styles.cardHeaderText}>
                  <Text variant="body" weight="semiBold">
                    {company.name}
                  </Text>
                  {memberStatus ? (
                    <View style={styles.statusRow}>
                      <View
                        style={[
                          styles.statusDot,
                          { backgroundColor: memberStatus === 'active' ? colors.success : colors.error }
                        ]}
                      />
                      <Text variant="caption" color="muted">
                        {memberStatus.charAt(0).toUpperCase() + memberStatus.slice(1)}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Budget usage */}
            {budgetLimit != null ? (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="body" weight="semiBold" style={styles.sectionTitle}>
                  {formatPeriod(policy?.budgetPeriod ?? null)} Budget
                </Text>

                <View style={styles.budgetRow}>
                  <View style={styles.budgetAmount}>
                    <Text variant="h3" weight="semiBold" style={{ color: colors.primary }}>
                      {formatCurrency(periodSpend)}
                    </Text>
                    <Text variant="caption" color="muted">
                      used of {formatCurrency(budgetLimit)}
                    </Text>
                  </View>
                  {budgetRemaining != null ? (
                    <View style={styles.budgetAmount}>
                      <Text variant="h3" weight="semiBold">
                        {formatCurrency(budgetRemaining)}
                      </Text>
                      <Text variant="caption" color="muted">
                        remaining
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round(budgetProgress * 100)}%` as `${number}%`,
                        backgroundColor: budgetProgress >= 0.9 ? colors.error : colors.primary
                      }
                    ]}
                  />
                </View>
                <Text variant="caption" color="muted" style={styles.progressLabel}>
                  {Math.round(budgetProgress * 100)}% used · {periodRides} ride{periodRides !== 1 ? 's' : ''} this period
                </Text>
              </View>
            ) : (
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text variant="body" weight="semiBold" style={styles.sectionTitle}>
                  {formatPeriod(policy?.budgetPeriod ?? null)} Budget
                </Text>
                <Text variant="body" color="muted">
                  No budget cap — rides are unlimited
                </Text>
                <Text variant="caption" color="muted" style={{ marginTop: spacing.xs }}>
                  {periodRides} ride{periodRides !== 1 ? 's' : ''} this period · {formatCurrency(periodSpend)} spent
                </Text>
              </View>
            )}

            {/* Policy limits */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text variant="body" weight="semiBold" style={styles.sectionTitle}>
                Travel Policy
              </Text>

              <View style={styles.policyRow}>
                <MaterialCommunityIcons name="cash" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" color="muted" style={styles.policyLabel}>
                  Max fare per ride
                </Text>
                <Text variant="bodySmall" weight="medium">
                  {policy?.maxFarePerTrip != null ? formatCurrency(policy.maxFarePerTrip) : 'No limit'}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.policyRow}>
                <MaterialCommunityIcons name="car-multiple" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" color="muted" style={styles.policyLabel}>
                  Allowed ride tiers
                </Text>
                <Text variant="bodySmall" weight="medium">
                  {policy?.allowedTiers && policy.allowedTiers.length > 0
                    ? policy.allowedTiers.map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')
                    : 'All tiers'}
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.policyRow}>
                <MaterialCommunityIcons name="clock-outline" size={16} color={colors.textSecondary} />
                <Text variant="bodySmall" color="muted" style={styles.policyLabel}>
                  Allowed hours
                </Text>
                <Text variant="bodySmall" weight="medium">
                  {formatAllowedHours(policy?.allowedHours ?? null)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxxl
  },
  card: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.sm
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cardHeaderText: {
    flex: 1,
    gap: spacing.xs
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  sectionTitle: {
    marginBottom: spacing.xs
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  budgetAmount: {
    gap: 2
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 4
  },
  progressLabel: {
    marginTop: spacing.xs
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  policyLabel: {
    flex: 1
  },
  divider: {
    height: 1
  }
});

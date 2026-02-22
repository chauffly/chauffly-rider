import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';
import { useTranslation } from '@/context/language-context';

type UsersView = 'employees' | 'join_requests';

export default function UsersTabScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [view, setView] = useState<UsersView>('employees');
  const usersData = localJsonApi.getCorporateUsersData();

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + 24}]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text variant="h1" weight="medium" size={"h2"}>{t('corporate.users.title')}</Text>
          <MaterialCommunityIcons name="bell-outline" size={22} color={colors.textPrimary} />
        </View>

        <View style={[styles.segmentWrap, { backgroundColor: colors.surface }]}>
          <Pressable
            onPress={() => setView('employees')}
            style={[styles.segmentButton, view === 'employees' && { backgroundColor: colors.textPrimary }]}
          >
            <Text variant="bodySmall" color={view === 'employees' ? 'inverse' : 'muted'}>{t('corporate.users.employees')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setView('join_requests')}
            style={[styles.segmentButton, view === 'join_requests' && { backgroundColor: colors.textPrimary }]}
          >
            <Text variant="bodySmall" color={view === 'join_requests' ? 'inverse' : 'muted'}>{t('corporate.users.join_request')}</Text>
          </Pressable>
        </View>

        {view === 'employees' ? (
          usersData.employees.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-group-outline" size={86} color={colors.border} />
              <Text variant="body" color="muted">{t('corporate.users.no_employees')}</Text>
              <Button title={t('corporate.users.add_employee')} style={styles.addEmployeeButton} />
            </View>
          ) : (
            <View style={styles.employeeList}>
              {usersData.employees.map((employee) => (
                <Pressable key={employee.id} style={[styles.employeeRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.employeeLeft}>
                    <MaterialCommunityIcons name="account-outline" size={28} color={colors.textSecondary} />
                    <View style={styles.employeeInfo}>
                      <Text variant="body" weight="semiBold">{employee.name}</Text>
                      <Text variant="caption" color="muted">{employee.email}</Text>
                      <Text variant="caption" color="muted">{employee.last_active}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusDot, { backgroundColor: employee.is_online ? colors.success : colors.textMuted }]} />
                </Pressable>
              ))}
            </View>
          )
        ) : (
          <View style={styles.requestsList}>
            {usersData.join_requests.map((request) => (
              <View key={request.id} style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.requestContent}>
                  <View style={styles.requestIdentity}>
                    <MaterialCommunityIcons name="account-outline" size={20} color={colors.primary} />
                    <View style={{ gap: 4 }}>
                      <Text variant="body" weight="semiBold">{request.name}</Text>
                      <Text variant="caption" color="muted">{request.email}</Text>
                      <Text variant="caption" color="muted">{t('corporate.users.requested_on', { date: request.requested_date })}</Text>
                    </View>
                  </View>
                </View>

                <View style={[styles.actionFooter, { borderTopColor: colors.border }]}>
                  <Pressable style={styles.footerAction}>
                    <MaterialCommunityIcons name="check" size={18} color={colors.success} />
                    <Text variant="body" weight="semiBold" color="success">
                      {t('corporate.users.approve')}
                    </Text>
                  </Pressable>

                  <View style={[styles.actionDivider, { backgroundColor: colors.border }]} />

                  <Pressable style={styles.footerAction}>
                    <MaterialCommunityIcons name="close" size={18} color={colors.error} />
                    <Text variant="body" weight="semiBold" color="error">
                      {t('corporate.users.decline')}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {view === 'employees' && (
        <Pressable
          style={[styles.fab, { backgroundColor: colors.buttonPrimary, bottom: insets.bottom + spacing.lg }]}
          onPress={() => router.push('/corporate/add-employee' as never)}
        >
          <MaterialCommunityIcons name="plus" size={28} color={colors.buttonPrimaryText} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  segmentWrap: { borderRadius: borderRadius.full, padding: 4, flexDirection: 'row' },
  segmentButton: { flex: 1, borderRadius: borderRadius.full, alignItems: 'center', paddingVertical: spacing.sm },
  emptyState: { flex: 1, minHeight: 420, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  addEmployeeButton: { width: '100%' },
  employeeList: { gap: 0 },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  employeeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  employeeInfo: {
    gap: 2,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  requestsList: { gap: spacing.md },
  requestCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xxl,
    overflow: 'hidden',
  },
  requestContent: {
    padding: spacing.md,
  },
  requestIdentity: { flexDirection: 'row', gap: spacing.sm, flex: 1 },
  actionFooter: {
    borderTopWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
  },
  footerAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  actionDivider: {
    width: 1,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

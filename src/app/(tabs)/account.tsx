import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { type Href, useRouter } from 'expo-router';
import { useIsFocused } from '@react-navigation/native';

import { useApiClient, useCurrentUser, useWalletBalance } from '@/api-client';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { clearRiderSession } from '@/runtime/rider-runtime';
import { accountRoleService, type AccountRole } from '@/services/account-role';
import { asNumber, asRecord, asString, fullName } from '@/utils/api-helpers';

interface AccountMenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  showChevron: boolean;
  route?: Href;
}

const resolveAvailableBalance = (
  userRecord: Record<string, unknown>,
  walletRecord: Record<string, unknown>
): number => {
  const walletSnapshot = asRecord(userRecord.wallet);
  const rawKobo =
    asNumber(walletRecord.available_balance_kobo, Number.NaN) ||
    asNumber(walletRecord.availableBalanceKobo, Number.NaN);

  if (Number.isFinite(rawKobo)) {
    return rawKobo / 100;
  }

  const fallbackRaw =
    walletSnapshot.availableBalance ??
    walletSnapshot.available_balance ??
    walletRecord.available_balance ??
    walletRecord.availableBalance;

  if (typeof fallbackRaw === 'number' && Number.isFinite(fallbackRaw)) {
    return fallbackRaw;
  }

  if (typeof fallbackRaw === 'string') {
    const parsed = Number.parseFloat(fallbackRaw);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const api = useApiClient();
  const isFocused = useIsFocused();

  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [accountRole, setAccountRole] = useState<AccountRole>('rider');
  const [loggingOut, setLoggingOut] = useState(false);

  const { data: currentUserData } = useCurrentUser();
  const { data: walletData, refetch: refetchWalletBalance } = useWalletBalance();

  const userRecord = asRecord(currentUserData);
  const walletRecord = asRecord(walletData);

  const isCorporate = accountRole === 'corporate';
  const userDisplayName = fullName(userRecord) || 'Rider';
  const userPhone = asString(userRecord.phoneNumber ?? userRecord.phone_number, '--');
  const avatarUrl = asString(userRecord.avatarUrl ?? userRecord.avatar_url);
  const companyMembership = asRecord(userRecord.companyMembership);
  const companyOrganization = asRecord(companyMembership.organization);
  const companyMember = asRecord(companyMembership.membership);
  const companyPolicy = asRecord(companyMembership.policy);

  const availableBalance = useMemo(
    () => resolveAvailableBalance(userRecord, walletRecord),
    [userRecord, walletRecord]
  );

  useEffect(() => {
    const loadRole = async () => {
      const storedRole = await accountRoleService.getRole();
      setAccountRole(storedRole);
    };

    void loadRole();
  }, []);

  useEffect(() => {
    let active = true;
    const syncRole = async () => {
      const storedRole = await accountRoleService.getRole();
      const nextRole = accountRoleService.resolveRole(asString(userRecord.role, ''), storedRole);
      if (!active) {
        return;
      }
      setAccountRole(nextRole);
      await accountRoleService.setRole(nextRole);
    };

    void syncRole();
    return () => {
      active = false;
    };
  }, [userRecord]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void refetchWalletBalance();
  }, [isFocused, refetchWalletBalance]);

  const handleConfirmLogout = async () => {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    try {
      await api.authApi.logout();
    } catch {
      // Intentionally ignore server logout failures; local session is still cleared.
    } finally {
      await clearRiderSession();
      setIsLogoutModalVisible(false);
      setLoggingOut(false);
      router.replace('/(auth)/login');
    }
  };

  const menuItems: AccountMenuItem[] = [
    {
      key: 'saved_addresses',
      icon: 'location-outline',
      labelKey: 'account.saved_addresses',
      showChevron: true,
      route: '/account/saved-addresses'
    },
    {
      key: 'notifications',
      icon: 'notifications-outline',
      labelKey: 'account.notifications',
      showChevron: true,
      route: '/account/notifications'
    },
    ...(!isCorporate
      ? [
          {
            key: 'ride_preference',
            icon: 'car-sport-outline' as keyof typeof Ionicons.glyphMap,
            labelKey: 'account.ride_preference',
            showChevron: true,
            route: '/booking/ride-preference' as Href
          },
          {
            key: 'join_company',
            icon: 'business-outline' as keyof typeof Ionicons.glyphMap,
            labelKey: 'account.join_company',
            showChevron: true,
            route: '/account/join-company' as Href
          }
        ]
      : []),
    ...(isCorporate
      ? [
          {
            key: 'document_verification',
            icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
            labelKey: 'account.document_verification',
            showChevron: true,
            route: '/account/document-verification' as Href
          },
          {
            key: 'travel_limit',
            icon: 'speedometer-outline' as keyof typeof Ionicons.glyphMap,
            labelKey: 'account.travel_limit',
            showChevron: true,
            route: '/account/travel-limit' as Href
          }
        ]
      : []),
    {
      key: 'app_appearance',
      icon: 'color-palette-outline',
      labelKey: 'account.app_appearance',
      showChevron: false,
      route: '/account/appearance'
    },
    {
      key: 'help_support',
      icon: 'help-circle-outline',
      labelKey: 'account.help_support',
      showChevron: true,
      route: '/account/help-support'
    },
    {
      key: 'account_security',
      icon: 'shield-checkmark-outline',
      labelKey: 'account.account_security',
      showChevron: true,
      route: '/account/security'
    },
    {
      key: 'rate_us',
      icon: 'star-outline',
      labelKey: 'account.rate_us',
      showChevron: false
    },
    {
      key: 'log_out',
      icon: 'log-out-outline',
      labelKey: 'account.log_out',
      showChevron: false
    }
  ];

  const avatarSize = spacing.xxxxl + spacing.lg;
  const walletSize = spacing.xxxxl + spacing.xs;
  const menuIconSize = spacing.xxxl + spacing.xs;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg
        }
      ]}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t('account.profile')}
          accessibilityHint={t('account.open_personal_info_hint')}
          onPress={() => router.push('/account/personal-info')}
        >
          <View style={styles.profileHeader}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={[
                  styles.avatar,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2
                  }
                ]}
              />
            ) : (
              <View
                style={[
                  styles.avatarFallback,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                    backgroundColor: colors.border
                  }
                ]}
              >
                <Ionicons name="person-outline" size={avatarSize * 0.48} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text variant="h3" size="xxl" weight="medium">
                {userDisplayName}
              </Text>
              <Text variant="bodySmall" color="muted">
                {userPhone}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.balanceRow}>
            <View
              style={[
                styles.walletIcon,
                {
                  backgroundColor: colors.accent,
                  width: walletSize,
                  height: walletSize,
                  borderRadius: walletSize / 2
                }
              ]}
            >
              <Ionicons name="wallet-outline" size={22} color={colors.primary} />
            </View>
            <View style={styles.balanceInfo}>
              <Text variant="body" weight="semiBold">
                ₦{Math.round(availableBalance).toLocaleString()}
              </Text>
              <Text variant="caption" color="muted" translationKey="account.available_balance" />
            </View>
            <Pressable
              style={[
                styles.topUpButton,
                {
                  backgroundColor: colors.buttonPrimary
                }
              ]}
              onPress={(event) => {
                event.stopPropagation();
                router.push('/account/top-up');
              }}
              accessibilityRole="button"
              accessibilityLabel={t('account.top_up')}
            >
              <Ionicons name="add" size={20} color={colors.buttonPrimaryText} />
              <Text
                variant="bodySmall"
                weight="medium"
                color="inverse"
                translationKey="account.top_up"
              />
            </Pressable>
          </View>
        </Pressable>

        {!isCorporate && asString(companyMember.status) ? (
          <Pressable
            style={[
              styles.companyStatusCard,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
            onPress={() => router.push('/account/company-details')}
          >
            <View style={styles.companyStatusHeader}>
              <Ionicons name="business-outline" size={20} color={colors.primary} />
              <Text variant="body" weight="semiBold">
                {asString(companyOrganization.name, 'Company membership')}
              </Text>
            </View>
            <Text variant="caption" color="muted">
              Status: {asString(companyMember.status, '--')}
            </Text>
            {typeof companyPolicy.budgetLimit === 'number' ? (
              <Text variant="caption" color="muted">
                Travel limit: ₦{companyPolicy.budgetLimit}
              </Text>
            ) : null}
          </Pressable>
        ) : null}

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              onPress={() => {
                if (item.key === 'log_out') {
                  setIsLogoutModalVisible(true);
                  return;
                }
                if (item.route) {
                  router.push(item.route);
                }
              }}
            >
              <View style={styles.menuLeft}>
                <View
                  style={[
                    styles.menuIcon,
                    {
                      backgroundColor: colors.accent,
                      width: menuIconSize,
                      height: menuIconSize,
                      borderRadius: menuIconSize / 2
                    }
                  ]}
                >
                  <Ionicons name={item.icon} size={20} color={colors.textMuted} />
                </View>
                <Text variant="body" translationKey={item.labelKey} />
              </View>
              {item.showChevron ? (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              ) : null}
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isLogoutModalVisible}
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsLogoutModalVisible(false)}
          accessibilityRole="button"
          accessibilityLabel={t('common.cancel')}
        >
          <Pressable
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
            onPress={() => {}}
          >
            <Text
              variant="h3"
              size="xxl"
              weight="medium"
              align="center"
              translationKey="account.logout_confirm_title"
            />
            <Text
              variant="body"
              color="muted"
              align="center"
              translationKey="account.logout_confirm_message"
            />
            <View style={styles.modalActions}>
              <Button
                translationKey="account.logout_cancel_action"
                onPress={() => setIsLogoutModalVisible(false)}
                style={[styles.modalButton, { backgroundColor: colors.border }]}
                textStyle={{ color: colors.textPrimary }}
              />
              <Button
                translationKey="account.logout_yes_action"
                onPress={handleConfirmLogout}
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                textStyle={{ color: colors.textInverse }}
                disabled={loggingOut}
              />
            </View>
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
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg
  },
  companyStatusCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xxl,
    padding: spacing.md,
    gap: spacing.xs
  },
  companyStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  profileCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  avatar: {},
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileInfo: {
    flex: 1
  },
  divider: {
    height: 0.5,
    marginVertical: spacing.lg
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  walletIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  balanceInfo: {
    flex: 1
  },
  topUpButton: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs
  },
  menuList: {
    gap: spacing.md
  },
  menuItem: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md
  },
  menuIcon: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl
  },
  modalCard: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  modalButton: {
    flex: 1
  }
});

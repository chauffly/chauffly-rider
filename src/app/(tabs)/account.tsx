import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Text } from "@/components/common/text";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";
import { type Href, useRouter } from "expo-router";
import { borderRadius, spacing } from "@/constants/spacing";
import { Button } from "@/components/common/button";

interface AccountMenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  labelKey: string;
  showChevron: boolean;
  route?: Href;
}

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  const menuItems: AccountMenuItem[] = [
    {
      key: "saved_addresses",
      icon: "location-outline",
      labelKey: "account.saved_addresses",
      showChevron: true,
      route: "/account/saved-addresses",
    },
    {
      key: "notifications",
      icon: "notifications-outline",
      labelKey: "account.notifications",
      showChevron: true,
      route: "/account/notifications",
    },
    {
      key: "ride_preference",
      icon: "car-sport-outline",
      labelKey: "account.ride_preference",
      showChevron: true,
      route: "/booking/ride-preference",
    },
    {
      key: "app_appearance",
      icon: "color-palette-outline",
      labelKey: "account.app_appearance",
      showChevron: false,
      route: "/account/appearance",
    },
    {
      key: "help_support",
      icon: "help-circle-outline",
      labelKey: "account.help_support",
      showChevron: true,
      route: "/account/help-support",
    },
    {
      key: "account_security",
      icon: "shield-checkmark-outline",
      labelKey: "account.account_security",
      showChevron: true,
      route: "/account/security",
    },
    {
      key: "rate_us",
      icon: "star-outline",
      labelKey: "account.rate_us",
      showChevron: false,
    },
    {
      key: "log_out",
      icon: "log-out-outline",
      labelKey: "account.log_out",
      showChevron: false,
    },
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
          paddingTop: insets.top + spacing.lg,
        },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={[styles.profileCard, { backgroundColor: colors.surface }]}
          accessibilityRole="button"
          accessibilityLabel={t("account.profile")}
          accessibilityHint={t("account.open_personal_info_hint")}
          onPress={() => router.push("/account/personal-info")}
        >
          <View style={styles.profileHeader}>
            <Image
              source={require("@assets/images/avatar.png")}
              style={[
                styles.avatar,
                {
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: avatarSize / 2,
                },
              ]}
            />
            <View style={styles.profileInfo}>
              <Text
                variant="h3"
                size={"xxl"}
                weight="medium"
                translationKey="account.sample_name"
              />
              <Text
                variant="bodySmall"
                color="muted"
                translationKey="account.sample_phone"
              />
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textMuted}
            />
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
                  borderRadius: walletSize / 2,
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={22}
                color={colors.primary}
              />
            </View>
            <View style={styles.balanceInfo}>
              <Text
                variant="body"
                weight="semiBold"
                translationKey="account.sample_balance"
              />
              <Text
                variant="caption"
                color="muted"
                translationKey="account.available_balance"
              />
            </View>
            <Pressable
              style={[
                styles.topUpButton,
                {
                  backgroundColor: colors.buttonPrimary,
                },
              ]}
              onPress={(event) => {
                event.stopPropagation();
                router.push("/account/top-up");
              }}
              accessibilityRole="button"
              accessibilityLabel={t("account.top_up")}
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

        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <Pressable
              key={item.key}
              style={[styles.menuItem, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={t(item.labelKey)}
              onPress={() => {
                if (item.key === "log_out") {
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
                      borderRadius: menuIconSize / 2,
                    },
                  ]}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={colors.textMuted}
                  />
                </View>
                <Text variant="body" translationKey={item.labelKey} />
              </View>
              {item.showChevron && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
              )}
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
          accessibilityLabel={t("common.cancel")}
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
                onPress={() => {
                  setIsLogoutModalVisible(false);
                  router.replace("/(auth)/login");
                }}
                style={[styles.modalButton, { backgroundColor: colors.error }]}
                textStyle={{ color: colors.textInverse }}
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
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {},
  profileInfo: {
    flex: 1,
  },
  divider: {
    height: 0.5,
    marginVertical: spacing.lg,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  walletIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  balanceInfo: {
    flex: 1,
  },
  topUpButton: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  menuList: {
    gap: spacing.md,
  },
  menuItem: {
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  menuIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxxl,
  },
  modalCard: {
    width: "100%",
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.lg,
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

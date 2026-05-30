import { useEffect, useState } from "react";
import { Redirect, Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/context/theme-context";
import { accountRoleService, type AccountRole } from "@/services/account-role";
import { useCurrentUser } from "@/api-client";
import { useTranslation } from "@/context/language-context";
import {
  RiderOnboardingRoute,
  riderOnboardingProgressStorage
} from "@/services/rider-onboarding-progress";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [accountRole, setAccountRole] = useState<AccountRole>("rider");
  const [pendingRoute, setPendingRoute] = useState<RiderOnboardingRoute | null | undefined>(undefined);
  const { data: currentUser } = useCurrentUser();
  const isCorporate = accountRole === "corporate";

  useEffect(() => {
    const loadRole = async () => {
      const role = await accountRoleService.getRole();
      setAccountRole(role);
    };

    void loadRole();
  }, []);

  useEffect(() => {
    let active = true;
    const loadPendingOnboardingRoute = async () => {
      const route = await riderOnboardingProgressStorage.getPendingRoute();
      if (active) {
        setPendingRoute(route);
      }
    };

    void loadPendingOnboardingRoute();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const syncRole = async () => {
      const storedRole = await accountRoleService.getRole();
      const apiRole = String((currentUser as Record<string, unknown> | undefined)?.role ?? '');
      const nextRole = accountRoleService.resolveRole(apiRole, storedRole);
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
  }, [currentUser]);

  if (pendingRoute === undefined) {
    return null;
  }

  if (pendingRoute) {
    return <Redirect href={pendingRoute} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("tabs.home"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={
                isCorporate
                  ? focused
                    ? "chart-box"
                    : "chart-box-outline"
                  : "map-marker-path"
              }
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="rides"
        options={{
          title: t("tabs.rides"),
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name={"format-list-bulleted"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="billing-invoice"
        options={{
          href: isCorporate ? undefined : null,
          title: t("tabs.billing_invoice"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "credit-card" : "credit-card-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          href: isCorporate ? undefined : null,
          title: t("tabs.users"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-group" : "account-group-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t("tabs.account"),
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "account-cog" : "account-cog-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}

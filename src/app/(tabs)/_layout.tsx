import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { HapticTab } from "@/components/haptic-tab";
import { useTheme } from "@/context/theme-context";
import { accountRoleService, type AccountRole } from "@/services/account-role";
import { localJsonApi } from "@/api/local-json-api";
import { useTranslation } from "@/context/language-context";

export default function TabLayout() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [accountRole, setAccountRole] = useState<AccountRole>(
    localJsonApi.getCurrentUserRole() === "corporate" ? "corporate" : "rider",
  );
  const isCorporate = accountRole === "corporate";

  useEffect(() => {
    const loadRole = async () => {
      const role = await accountRoleService.getRole();
      setAccountRole(role);
    };

    loadRole();
  }, []);

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

import { router, Stack } from "expo-router";

import { useTheme } from "@/context/theme-context";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AuthLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}

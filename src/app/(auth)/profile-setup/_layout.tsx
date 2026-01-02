import { Stack } from 'expo-router';

import { useTheme } from '@/context/theme-context';

export default function ProfileSetupLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}

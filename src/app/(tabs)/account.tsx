import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { useTheme } from '@/context/theme-context';
import { spacing } from '@/constants/spacing';

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

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
      <Text variant="h2" color="primary">
        Account
      </Text>
      <Text variant="body" color="secondary" style={styles.subtitle}>
        Coming soon...
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.md,
  },
});

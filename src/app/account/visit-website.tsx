import { Linking, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { StackHeader } from '@/components/common/stack-header';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

const CHAUFFLY_WEBSITE = 'https://chauffly.com';

export default function VisitWebsiteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleOpenWebsite = async () => {
    try {
      await Linking.openURL(CHAUFFLY_WEBSITE);
    } catch {
      // Ignore if the url cannot be opened on this device.
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.lg,
        },
      ]}
    >
      <StackHeader
        translationKey="account.visit_website"
        align="center"
        onBack={() => router.back()}
      />

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.accent }]}>
          <Ionicons name="globe-outline" size={30} color={colors.primary} />
        </View>
        <Text
          variant="h3"
          size="xl"
          weight="semiBold"
          align="center"
          translationKey="account.website_card_title"
        />
        <Text
          variant="body"
          color="muted"
          align="center"
          translationKey="account.website_card_description"
        />
        <Button
          translationKey="account.open_website"
          fullWidth
          onPress={handleOpenWebsite}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: borderRadius.xxl,
    marginTop: spacing.xxxxl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

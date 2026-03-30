import { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ImageSourcePropType,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/common/text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import { accountRoleService } from '@/services/account-role';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

type RoleType = 'passenger' | 'driver' | 'corporate';

interface RoleOption {
  id: RoleType;
  titleKey: string;
  descriptionKey: string;
  image: ImageSourcePropType;
}

const roleOptions: RoleOption[] = [
  {
    id: "passenger",
    titleKey: "profile_setup.passenger_title",
    descriptionKey: "profile_setup.passenger_description",
    image: require("@assets/images/passenger.png"),
  },
  {
    id: "corporate",
    titleKey: "profile_setup.corporate_title",
    descriptionKey: "profile_setup.corporate_description",
    image: require("@assets/images/corporate.png"),
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/role-selection');
  }, []);

  const handleRoleSelect = async (role: RoleType) => {
    setSelectedRole(role);
    await accountRoleService.setRole(role === 'corporate' ? 'corporate' : 'rider');
    const nextPath =
      role === 'corporate'
        ? '/(auth)/profile-setup/corporate-organization'
        : '/(auth)/profile-setup/personal-info';

    router.push({
      pathname: nextPath,
      params: { role },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xxxl, paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="h1" font="medium" style={styles.title}>
          {t('profile_setup.role_selection_title')}
        </Text>

        <View style={styles.optionsContainer}>
          {roleOptions.map((option) => {
            const isSelected = selectedRole === option.id;

            return (
              <Pressable
                key={option.id}
                onPress={() => handleRoleSelect(option.id)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : colors.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <View style={styles.iconContainer}>
                  <Image
                    source={option.image}
                    style={styles.roleImage}
                    contentFit="contain"
                  />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text variant="body" weight="medium" style={styles.optionTitle}>
                    {t(option.titleKey)}
                  </Text>
                  <Text variant="bodySmall" color="muted">
                    {t(option.descriptionKey)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    marginBottom: spacing.xxxl,
  },
  optionsContainer: {
    gap: spacing.lg,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  iconContainer: {
    marginRight: spacing.lg,
  },
  roleImage: {
    width: 48,
    height: 48,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    marginBottom: spacing.xs,
  },
});

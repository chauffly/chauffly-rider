import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { TextInput } from '@/components/common/text-input';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [fullName, setFullName] = useState(t('account.sample_name'));
  const [email, setEmail] = useState(t('account.sample_email'));
  const [phone, setPhone] = useState(t('account.sample_phone_local'));

  const avatarSize = spacing.xxxxl * 3;
  const editButtonSize = spacing.xl + spacing.md;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md,
        },
      ]}
    >
      <StackHeader
        translationKey="account.personal_info_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.avatarWrap,
            {
              width: avatarSize,
              height: avatarSize,
            },
          ]}
        >
          <Image
            source={require('@assets/images/avatar.png')}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2,
              },
            ]}
          />
          <Pressable
            style={[
              styles.avatarEditButton,
              {
                backgroundColor: colors.textPrimary,
                width: editButtonSize,
                height: editButtonSize,
                borderRadius: borderRadius.md,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('account.edit_profile_photo')}
            accessibilityHint={t('account.edit_profile_photo_hint')}
          >
            <Ionicons name="pencil" size={16} color={colors.textInverse} />
          </Pressable>
        </View>
        <TextInput
          labelTranslationKey="account.full_name_label"
          placeholderTranslationKey="account.name_placeholder"
          value={fullName}
          onChangeText={setFullName}
          leftIcon={<Ionicons name="person-outline" size={20} color={colors.primary} />}
          autoCapitalize="words"
        />

        <TextInput
          labelTranslationKey="account.email_label"
          placeholderTranslationKey="account.email_placeholder"
          value={email}
          onChangeText={setEmail}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          labelTranslationKey="account.phone_number_label"
          placeholderTranslationKey="account.phone_placeholder"
          value={phone}
          onChangeText={setPhone}
          leftIcon={<Ionicons name="call-outline" size={20} color={colors.primary} />}
          keyboardType="phone-pad"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  avatar: {},
  avatarEditButton: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

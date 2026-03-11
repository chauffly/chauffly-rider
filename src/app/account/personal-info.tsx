import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import { useCurrentUser, useUpdateCurrentUser, useUploadAvatar } from '@/api-client';
import { Button } from '@/components/common/button';
import { TextInput } from '@/components/common/text-input';
import { StackHeader } from '@/components/common/stack-header';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { asRecord, asString } from '@/utils/api-helpers';

export default function PersonalInfoScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: currentUserData } = useCurrentUser();
  const updateCurrentUser = useUpdateCurrentUser();
  const uploadAvatar = useUploadAvatar();

  const currentUser = asRecord(currentUserData);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setFirstName(asString(currentUser.firstName ?? currentUser.first_name));
    setLastName(asString(currentUser.lastName ?? currentUser.last_name));
    setEmail(asString(currentUser.email));
    setPhone(asString(currentUser.phoneNumber ?? currentUser.phone_number));
  }, [currentUser]);

  const avatarUrl = asString(currentUser.avatarUrl ?? currentUser.avatar_url);
  const avatarSize = spacing.xxxxl * 3;
  const editButtonSize = spacing.xl + spacing.md;
  const fullName = useMemo(() => `${firstName} ${lastName}`.trim(), [firstName, lastName]);

  const handleSave = async () => {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    try {
      await updateCurrentUser.mutateAsync({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        email: email.trim() || null
      });
      router.back();
    } finally {
      setSubmitting(false);
    }
  };

  const handlePickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.9,
      aspect: [1, 1]
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append(
      'avatar',
      {
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg'
      } as any
    );
    await uploadAvatar.mutateAsync(formData);
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
          paddingBottom: insets.bottom + spacing.md
        }
      ]}
    >
      <StackHeader translationKey="account.personal_info_title" align="center" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.avatarWrap,
            {
              width: avatarSize,
              height: avatarSize
            }
          ]}
        >
          <Image
            source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/avatar.png')}
            style={[
              styles.avatar,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius: avatarSize / 2
              }
            ]}
          />
          <Pressable
            style={[
              styles.avatarEditButton,
              {
                backgroundColor: colors.textPrimary,
                width: editButtonSize,
                height: editButtonSize,
                borderRadius: borderRadius.md
              }
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('account.edit_profile_photo')}
            accessibilityHint={t('account.edit_profile_photo_hint')}
            onPress={handlePickAvatar}
          >
            <Ionicons name="pencil" size={16} color={colors.textInverse} />
          </Pressable>
        </View>
        <TextInput
          labelTranslationKey="account.full_name_label"
          placeholderTranslationKey="account.name_placeholder"
          value={fullName}
          onChangeText={(value) => {
            const [first = '', ...rest] = value.split(' ');
            setFirstName(first);
            setLastName(rest.join(' '));
          }}
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
          editable={false}
        />
      </ScrollView>

      <Button
        translationKey="common.save"
        fullWidth
        onPress={handleSave}
        disabled={submitting}
        title={submitting ? t('common.loading') : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.xl,
    paddingBottom: spacing.xxxxl
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.sm
  },
  avatar: {},
  avatarEditButton: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

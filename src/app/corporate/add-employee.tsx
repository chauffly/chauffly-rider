import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useInviteCorporateEmployee } from '@/api-client';
import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function AddEmployeeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const inviteEmployee = useInviteCorporateEmployee();

  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleInvite = async () => {
    if (!email.trim()) {
      setErrorMessage(t('corporate.add_employee.email_required'));
      return;
    }

    setErrorMessage('');
    await inviteEmployee.mutateAsync({
      email: email.trim().toLowerCase()
    });
    router.back();
  };

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
        translationKey="corporate.add_employee.title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          labelTranslationKey="corporate.add_employee.email"
          placeholderTranslationKey="corporate.add_employee.email_placeholder"
          value={email}
          onChangeText={setEmail}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text variant="bodySmall" color="muted" style={styles.invitationNote}>
          Invitations are sent by email. If the employee already has a rider account with that email, the company invite will appear there. If not, they can sign up later with the same email to claim it automatically.
        </Text>
        {errorMessage ? (
          <Text variant="bodySmall" color="error">
            {errorMessage}
          </Text>
        ) : null}
      </ScrollView>

      <Button
        title={
          inviteEmployee.isPending
            ? t('common.loading')
            : t('corporate.add_employee.send_invitation')
        }
        style={styles.submitButton}
        onPress={handleInvite}
        disabled={inviteEmployee.isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    gap: spacing.sm,
    paddingBottom: spacing.xxxxl,
  },
  invitationNote: {
    marginTop: spacing.md,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});

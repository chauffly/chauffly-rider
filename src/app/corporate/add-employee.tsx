import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useInviteCorporateEmployee } from '@/api-client';
import { TextInput } from '@/components/common/text-input';
import { SelectInput } from '@/components/common/select-input';
import { Button } from '@/components/common/button';
import { Text } from '@/components/common/text';
import { StackHeader } from '@/components/common/stack-header';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

const departmentOptions = [
  { label: 'Engineering', value: 'engineering' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Finance', value: 'finance' },
  { label: 'Operations', value: 'operations' },
  { label: 'Human Resources', value: 'hr' },
];

const roleOptions = [
  { label: 'Employee', value: 'employee' },
  { label: 'Manager', value: 'manager' },
  { label: 'Admin', value: 'admin' },
];

export default function AddEmployeeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const inviteEmployee = useInviteCorporateEmployee();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [defaultRole, setDefaultRole] = useState('');
  const [travelLimit, setTravelLimit] = useState('');
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
          labelTranslationKey="corporate.add_employee.full_name"
          placeholderTranslationKey="corporate.add_employee.full_name_placeholder"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <TextInput
          labelTranslationKey="corporate.add_employee.email"
          placeholderTranslationKey="corporate.add_employee.email_placeholder"
          value={email}
          onChangeText={setEmail}
          leftIcon={<Ionicons name="mail-outline" size={20} color={colors.primary} />}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <SelectInput
          labelTranslationKey="corporate.add_employee.department"
          placeholderTranslationKey="corporate.add_employee.department_placeholder"
          options={departmentOptions}
          value={department}
          onValueChange={setDepartment}
        />

        <SelectInput
          labelTranslationKey="corporate.add_employee.default_role"
          placeholderTranslationKey="corporate.add_employee.default_role_placeholder"
          options={roleOptions}
          value={defaultRole}
          onValueChange={setDefaultRole}
        />

        <View>
          <TextInput
            labelTranslationKey="corporate.add_employee.initial_travel_limit"
            placeholderTranslationKey="corporate.add_employee.initial_travel_limit_placeholder"
            value={travelLimit}
            onChangeText={setTravelLimit}
            keyboardType="numeric"
          />
          <Text variant="caption" color="muted" style={styles.helperText}>
            {t('corporate.add_employee.initial_travel_limit_note')}
          </Text>
        </View>

        <Text variant="bodySmall" color="muted" style={styles.invitationNote}>
          {t('corporate.add_employee.invitation_note')}
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
  helperText: {
    marginTop: -spacing.xs,
  },
  invitationNote: {
    marginTop: spacing.md,
    lineHeight: 20,
  },
  submitButton: {
    marginBottom: spacing.md,
  },
});

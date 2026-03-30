import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';

type UploadField = {
  titleKey: string;
  descriptionKey: string;
  required?: boolean;
};

const uploadFields: UploadField[] = [
  {
    titleKey: 'profile_setup.corporate_doc_registration_certificate',
    descriptionKey: 'profile_setup.corporate_doc_registration_certificate_note',
    required: true,
  },
  {
    titleKey: 'profile_setup.corporate_doc_address_proof',
    descriptionKey: 'profile_setup.corporate_doc_address_proof_note',
    required: true,
  },
  {
    titleKey: 'profile_setup.corporate_doc_tax_id',
    descriptionKey: 'profile_setup.corporate_doc_tax_id_note',
  },
  {
    titleKey: 'profile_setup.corporate_doc_letterhead_authorization',
    descriptionKey: 'profile_setup.corporate_doc_letterhead_authorization_note',
  },
];

export default function CorporateDocumentUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/corporate-document-upload');
  }, []);

  const handleContinue = () => {
    router.push({
      pathname: '/(auth)/profile-setup/corporate-kyc-verification',
      params: { role: params.role ?? 'corporate' },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <StackHeader
        translationKey="profile_setup.corporate_document_upload_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            3 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {uploadFields.map((field) => (
          <View key={field.titleKey} style={styles.section}>
            <Text variant="body">
              {t(field.titleKey)}
              {field.required ? <Text color="error">*</Text> : null}
            </Text>
            <Text variant="bodySmall" color="muted" style={styles.note}>
              {t(field.descriptionKey)}
            </Text>

            <Pressable
              style={[styles.uploadButton, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={t('profile_setup.corporate_upload_file')}
            >
              <MaterialCommunityIcons name="plus" size={18} color={colors.textPrimary} />
              <Text variant="bodySmall" color="muted">
                {t('profile_setup.corporate_upload_file')}
              </Text>
            </Pressable>
          </View>
        ))}

        <Button translationKey="common.continue" fullWidth onPress={handleContinue} style={styles.button} />
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
  section: {
    marginBottom: spacing.lg,
  },
  note: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  uploadButton: {
    minHeight: 48,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
  },
  button: {
    marginTop: spacing.md,
  },
});

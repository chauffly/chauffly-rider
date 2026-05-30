import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useMemo, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import { ApiClientError, useCorporateDocuments, useUploadCorporateDocument } from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { asRecord, asString } from '@/utils/api-helpers';

type UploadField = {
  key: 'registration_certificate' | 'address_proof' | 'tax_id' | 'letterhead';
  titleKey: string;
  descriptionKey: string;
  required?: boolean;
};

const uploadFields: UploadField[] = [
  {
    key: 'registration_certificate',
    titleKey: 'profile_setup.corporate_doc_registration_certificate',
    descriptionKey: 'profile_setup.corporate_doc_registration_certificate_note',
    required: true,
  },
  {
    key: 'address_proof',
    titleKey: 'profile_setup.corporate_doc_address_proof',
    descriptionKey: 'profile_setup.corporate_doc_address_proof_note',
    required: true,
  },
  {
    key: 'tax_id',
    titleKey: 'profile_setup.corporate_doc_tax_id',
    descriptionKey: 'profile_setup.corporate_doc_tax_id_note',
  },
  {
    key: 'letterhead',
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
  const { data: documentsData, refetch } = useCorporateDocuments();
  const uploadDocument = useUploadCorporateDocument({
    onSuccess: async () => {
      await refetch();
    }
  });
  const [generalError, setGeneralError] = useState('');
  const [uploadingKey, setUploadingKey] = useState<UploadField['key'] | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const documentsPayload = asRecord(documentsData);
  const documents = useMemo(() => {
    return Object.fromEntries(
      uploadFields
        .map((field) => {
          const matched = (Array.isArray(documentsPayload.documents) ? documentsPayload.documents : []).find(
            (item) => asString(asRecord(item).documentType) === field.key
          );
          return matched ? [field.key, asRecord(matched)] : [];
        })
        .filter((entry) => entry.length > 0)
    ) as Partial<Record<UploadField['key'], Record<string, unknown>>>;
  }, [documentsPayload.documents]);
  const requiredDocumentsUploaded = useMemo(
    () => uploadFields.filter((field) => field.required).every((field) => Boolean(documents[field.key])),
    [documents]
  );

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/corporate-document-upload');
  }, []);

  const handleUpload = async (documentKey: UploadField['key']) => {
    setGeneralError('');
    try {
      setUploadingKey(documentKey);
      const imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1
      });

      if (imageResult.canceled || !imageResult.assets?.length) {
        return;
      }

      const asset = imageResult.assets[0];
      const file: { uri: string; type: string; name: string } = {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? `${documentKey}-${Date.now()}.jpg`
      };

      const formData = new FormData();
      formData.append('document_type', documentKey);
      formData.append('file', file as any);
      await uploadDocument.mutateAsync(formData);
    } catch (error) {
      const fallback = 'Upload failed.';
      setGeneralError(error instanceof ApiClientError ? error.message || fallback : error instanceof Error ? error.message || fallback : fallback);
    } finally {
      setUploadingKey(null);
    }
  };

  const handleContinue = async () => {
    if (!requiredDocumentsUploaded) {
      Alert.alert(
        'Required documents missing',
        'Upload the required corporate registration certificate and proof of address before continuing.'
      );
      return;
    }

    setSubmitting(true);
    router.push({
      pathname: '/(auth)/profile-setup/corporate-kyc-verification',
      params: { role: params.role ?? 'corporate' },
    });
    setSubmitting(false);
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
        {uploadFields.map((field) => {
          const uploadedDocument = documents[field.key];
          const isUploaded = Boolean(uploadedDocument);
          return (
          <View key={field.titleKey} style={styles.section}>
            <Text variant="body">
              {t(field.titleKey)}
              {field.required ? <Text color="error">*</Text> : null}
            </Text>
            <Text variant="bodySmall" color="muted" style={styles.note}>
              {t(field.descriptionKey)}
            </Text>

            {uploadedDocument ? (
              <Text variant="caption" color="success" style={styles.fileName}>
                {asString(uploadedDocument.originalFileName)}
              </Text>
            ) : null}

            <Pressable
              style={[styles.uploadButton, { backgroundColor: colors.surface }]}
              accessibilityRole="button"
              accessibilityLabel={t(isUploaded ? 'account.doc_update' : 'profile_setup.corporate_upload_file')}
              onPress={() => void handleUpload(field.key)}
              disabled={uploadingKey === field.key}
            >
              {uploadingKey === field.key ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <MaterialCommunityIcons
                  name={isUploaded ? 'file-check-outline' : 'plus'}
                  size={18}
                  color={isUploaded ? colors.success : colors.textPrimary}
                />
              )}
              <Text variant="bodySmall" color="muted">
                {uploadingKey === field.key
                  ? 'Uploading...'
                  : isUploaded
                    ? t('account.doc_update')
                    : t('profile_setup.corporate_upload_file')}
              </Text>
            </Pressable>
          </View>
        )})}

        {generalError ? (
          <Text variant="bodySmall" color="error" style={styles.note}>
            {generalError}
          </Text>
        ) : null}

        <Button
          translationKey="common.continue"
          fullWidth
          onPress={() => void handleContinue()}
          style={styles.button}
          disabled={submitting || !requiredDocumentsUploaded}
          loading={submitting}
        />
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
  fileName: {
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

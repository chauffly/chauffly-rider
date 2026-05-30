import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import {
  ApiClientError,
  useCorporateDocuments,
  useCorporateOrganization,
  useUploadCorporateDocument
} from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { asArray, asRecord, asString } from '@/utils/api-helpers';

type TabView = 'documents' | 'verification';

type DocumentKey =
  | 'registration_certificate'
  | 'address_proof'
  | 'tax_id'
  | 'letterhead'
  | 'admin_identity';

type DocumentDefinition = {
  key: DocumentKey;
  titleKey: string;
  descriptionKey: string;
  required?: boolean;
};

const documentDefinitions: DocumentDefinition[] = [
  {
    key: 'registration_certificate',
    titleKey: 'profile_setup.corporate_doc_registration_certificate',
    descriptionKey: 'profile_setup.corporate_doc_registration_certificate_note',
    required: true
  },
  {
    key: 'address_proof',
    titleKey: 'profile_setup.corporate_doc_address_proof',
    descriptionKey: 'profile_setup.corporate_doc_address_proof_note',
    required: true
  },
  {
    key: 'tax_id',
    titleKey: 'profile_setup.corporate_doc_tax_id',
    descriptionKey: 'profile_setup.corporate_doc_tax_id_note'
  },
  {
    key: 'letterhead',
    titleKey: 'profile_setup.corporate_doc_letterhead_authorization',
    descriptionKey: 'profile_setup.corporate_doc_letterhead_authorization_note'
  },
  {
    key: 'admin_identity',
    titleKey: 'profile_setup.corporate_identity_validation',
    descriptionKey: 'profile_setup.corporate_identity_validation_note',
    required: true
  }
];

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof ApiClientError) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
};

const statusLabelKey = (status: string) => {
  if (status === 'active') {
    return 'account.verification_status_verified';
  }

  return 'account.verification_status_pending';
};

export default function DocumentVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabView>('documents');
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingType, setUploadingType] = useState<DocumentKey | null>(null);

  const { data: organizationData } = useCorporateOrganization();
  const { data: documentsData, refetch } = useCorporateDocuments();
  const uploadDocument = useUploadCorporateDocument({
    onSuccess: async () => {
      await refetch();
    }
  });

  const organization = asRecord(asRecord(organizationData).organization);
  const documents = useMemo(() => {
    const items = asArray<Record<string, unknown>>(asRecord(documentsData).documents);
    return Object.fromEntries(
      items
        .map((item) => {
          const documentType = asString(item.documentType) as DocumentKey;
          return documentType ? [documentType, item] : [];
        })
        .filter((entry) => entry.length > 0)
    ) as Partial<Record<DocumentKey, Record<string, unknown>>>;
  }, [documentsData]);

  const handleUpload = async (documentType: DocumentKey) => {
    setErrorMessage('');
    try {
      setUploadingType(documentType);
      const imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1
      });

      if (imageResult.canceled || !imageResult.assets?.length) {
        return;
      }

      const asset = imageResult.assets[0];
      const file = {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? `${documentType}-${Date.now()}.jpg`
      };

      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('document_type', documentType);
      formData.append('file', file as any);
      await uploadDocument.mutateAsync(formData);
    } catch (error) {
      setErrorMessage(extractErrorMessage(error, 'Upload failed.'));
    } finally {
      setUploadingType(null);
    }
  };

  const organizationStatus = asString(organization.status, 'pending');
  const verificationNote =
    organizationStatus === 'active'
      ? 'Your corporate account has been approved and is now active.'
      : organizationStatus === 'inactive'
        ? 'Your application was not approved. Upload updated documents to resume admin review.'
        : 'Your application is pending admin review. Corporate bookings, top-ups, employees, and billing remain disabled until approval.';

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
      <StackHeader
        translationKey="account.document_verification_title"
        align="center"
        onBack={() => router.back()}
      />

      <View style={[styles.segmentWrap, { backgroundColor: colors.surface }]}>
        <Pressable
          onPress={() => setTab('documents')}
          style={[styles.segmentButton, tab === 'documents' && { backgroundColor: colors.textPrimary }]}
        >
          <Text variant="bodySmall" color={tab === 'documents' ? 'inverse' : 'muted'}>
            {t('account.doc_tab_documents')}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('verification')}
          style={[styles.segmentButton, tab === 'verification' && { backgroundColor: colors.textPrimary }]}
        >
          <Text variant="bodySmall" color={tab === 'verification' ? 'inverse' : 'muted'}>
            {t('account.doc_tab_verification')}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'documents' ? (
          <>
            {documentDefinitions.map((doc) => {
              const uploadedDocument = documents[doc.key];
              const uploaded = Boolean(uploadedDocument);
              const isBusy = uploadingType === doc.key;

              return (
                <View key={doc.key} style={[styles.docCard, { backgroundColor: colors.surface }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docTitleRow}>
                      <MaterialCommunityIcons
                        name={uploaded ? 'file-check-outline' : 'file-outline'}
                        size={22}
                        color={uploaded ? colors.success : colors.textSecondary}
                      />
                      <View style={styles.docTitleWrap}>
                        <Text variant="body" weight="medium" numberOfLines={1}>
                          {t(doc.titleKey)}
                          {doc.required ? <Text color="error"> *</Text> : null}
                        </Text>
                        <Text variant="caption" color={uploaded ? 'success' : 'muted'}>
                          {uploaded ? t('account.doc_uploaded') : t('account.doc_not_uploaded')}
                        </Text>
                        {uploaded ? (
                          <Text variant="caption" color="muted">
                            {asString(asRecord(uploadedDocument).originalFileName)}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <Button
                      title={isBusy ? 'Uploading...' : uploaded ? t('account.doc_update') : t('account.doc_upload')}
                      size="sm"
                      variant="outline"
                      onPress={() => void handleUpload(doc.key)}
                      loading={isBusy}
                      disabled={isBusy}
                    />
                  </View>

                  <Text variant="bodySmall" color="muted">
                    {t(doc.descriptionKey)}
                  </Text>
                </View>
              );
            })}

            {errorMessage ? (
              <Text variant="bodySmall" color="error" style={styles.errorText}>
                {errorMessage}
              </Text>
            ) : null}
          </>
        ) : (
          <View style={[styles.verificationCard, { backgroundColor: colors.surface }]}>
            <View style={styles.verificationIconWrap}>
              <MaterialCommunityIcons
                name={organizationStatus === 'active' ? 'shield-check-outline' : 'progress-clock'}
                size={68}
                color={organizationStatus === 'active' ? colors.success : colors.primary}
              />
            </View>
            <Text variant="body" weight="medium" style={styles.verificationTitle}>
              {t('account.verification_section')}
            </Text>
            <Text variant="bodySmall" color="muted" style={styles.verificationDesc}>
              {verificationNote}
            </Text>
            <View style={styles.statusRow}>
              <Text variant="bodySmall" color="muted">
                {t('account.verification_status_label')}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    borderColor: organizationStatus === 'active' ? colors.success : colors.primary
                  }
                ]}
              >
                <Text
                  variant="bodySmall"
                  color={organizationStatus === 'active' ? 'success' : 'primary'}
                  weight="medium"
                >
                  {t(statusLabelKey(organizationStatus))}
                </Text>
              </View>
            </View>
            <Button
              translationKey="account.update_documents"
              variant="outline"
              fullWidth
              onPress={() => setTab('documents')}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  segmentWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    flexDirection: 'row',
    padding: spacing.xs,
    marginBottom: spacing.lg
  },
  segmentButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center'
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  docCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.sm
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    flex: 1
  },
  docTitleWrap: {
    flex: 1,
    gap: 2
  },
  verificationCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.lg
  },
  verificationIconWrap: {
    alignItems: 'center'
  },
  verificationTitle: {
    textAlign: 'center'
  },
  verificationDesc: {
    textAlign: 'center'
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  errorText: {
    marginTop: spacing.sm
  }
});

import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

import {
  ApiClientError,
  useCorporateDocuments,
  useUploadCorporateDocument
} from '@/api-client';
import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { borderRadius } from '@/constants/spacing';
import { spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';
import { accountRoleService } from '@/services/account-role';
import { riderOnboardingProgressStorage } from '@/services/rider-onboarding-progress';
import { asArray, asRecord, asString } from '@/utils/api-helpers';

export default function CorporateKycVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { data: documentsData, refetch } = useCorporateDocuments();
  const uploadDocument = useUploadCorporateDocument({
    onSuccess: async () => {
      await refetch();
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadingIdentity, setUploadingIdentity] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    void riderOnboardingProgressStorage.setCurrentRoute('/(auth)/profile-setup/corporate-kyc-verification');
  }, []);

  const documents = asArray<Record<string, unknown>>(asRecord(documentsData).documents);
  const identityDocument = documents.find(
    (document) => asString(asRecord(document).documentType) === 'admin_identity'
  );

  const handleUploadIdentity = async () => {
    setGeneralError('');
    try {
      setUploadingIdentity(true);
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
        name: asset.fileName ?? `admin-identity-${Date.now()}.jpg`
      };

      if (!file) {
        return;
      }

      const formData = new FormData();
      formData.append('document_type', 'admin_identity');
      formData.append('file', file as any);
      await uploadDocument.mutateAsync(formData);
    } catch (error) {
      const fallback = 'Identity upload failed.';
      setGeneralError(error instanceof ApiClientError ? error.message || fallback : error instanceof Error ? error.message || fallback : fallback);
    } finally {
      setUploadingIdentity(false);
    }
  };

  const handleSetUpNow = async () => {
    if (!identityDocument) {
      Alert.alert(
        'Identity document required',
        'Upload the admin identity document before submitting your verification.'
      );
      return;
    }

    setSubmitting(true);
    await accountRoleService.setRole('corporate');
    await riderOnboardingProgressStorage.markComplete();
    router.replace('/(tabs)');
    setSubmitting(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.statusBar as 'light' | 'dark'} />

      <StackHeader
        translationKey="profile_setup.corporate_kyc_title"
        onBack={() => router.back()}
        style={{ paddingTop: insets.top + spacing.md, paddingHorizontal: spacing.lg }}
        titleVariant="body"
        titleWeight="semiBold"
        right={
          <Text variant="bodySmall" color="muted">
            4 {t('common.of')} 4
          </Text>
        }
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="shield-check-outline" size={116} color={colors.textPrimary} />
        </View>

        <Text variant="h3" weight="medium" size={"xl"} style={styles.title}>
          {t('profile_setup.corporate_identity_validation')}
        </Text>

        <Text variant="bodySmall" color="muted" style={styles.description}>
          {t('profile_setup.corporate_identity_validation_note')}
        </Text>

        <View style={styles.bullets}>
          <Text variant="bodySmall" color="muted">
            {`• ${t('profile_setup.corporate_identity_bullet_1')}`}
          </Text>
          <Text variant="bodySmall" color="muted">
            {`• ${t('profile_setup.corporate_identity_bullet_2')}`}
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <Text variant="body" weight="medium">
            Upload Admin ID
          </Text>
          <Text variant="bodySmall" color="muted" style={styles.uploadNote}>
            National ID, passport, or driver license in PDF or image format.
          </Text>
          {identityDocument ? (
            <Text variant="caption" color="success" style={styles.fileName}>
              {asString(asRecord(identityDocument).originalFileName)}
            </Text>
          ) : null}
          <Pressable
            style={[styles.uploadButton, { backgroundColor: colors.surface }]}
            accessibilityRole="button"
            onPress={() => void handleUploadIdentity()}
            disabled={uploadingIdentity}
          >
            {uploadingIdentity ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <MaterialCommunityIcons
                name={identityDocument ? 'file-check-outline' : 'plus'}
                size={18}
                color={identityDocument ? colors.success : colors.textPrimary}
              />
            )}
            <Text variant="bodySmall" color="muted">
              {uploadingIdentity ? 'Uploading...' : identityDocument ? 'Update file' : 'Upload file'}
            </Text>
          </Pressable>
        </View>

        {generalError ? (
          <Text variant="bodySmall" color="error" style={styles.errorText}>
            {generalError}
          </Text>
        ) : null}

        <Button
          translationKey="common.continue"
          fullWidth
          onPress={() => void handleSetUpNow()}
          style={styles.button}
          disabled={submitting || !identityDocument}
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
  iconWrap: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.lg,
  },
  bullets: {
    gap: spacing.sm,
  },
  uploadSection: {
    marginTop: spacing.xl,
  },
  uploadNote: {
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
  errorText: {
    marginTop: spacing.md,
  },
  button: {
    marginTop: 'auto',
  },
});

import { useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Button } from '@/components/common/button';
import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import FaceOutline from '@/components/svg/FaceOutline';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTranslation } from '@/context/language-context';
import { useTheme } from '@/context/theme-context';

type TabView = 'documents' | 'verification';

type DocumentItem = {
  key: string;
  titleKey: string;
  descriptionKey: string;
  required?: boolean;
  uploaded: boolean;
  previewUri?: string;
};

const initialDocuments: DocumentItem[] = [
  {
    key: 'registration_certificate',
    titleKey: 'profile_setup.corporate_doc_registration_certificate',
    descriptionKey: 'profile_setup.corporate_doc_registration_certificate_note',
    required: true,
    uploaded: true,
    previewUri: 'https://placehold.co/600x400/e8e8e8/999?text=Registration+Certificate',
  },
  {
    key: 'address_proof',
    titleKey: 'profile_setup.corporate_doc_address_proof',
    descriptionKey: 'profile_setup.corporate_doc_address_proof_note',
    required: true,
    uploaded: true,
    previewUri: 'https://placehold.co/600x400/e8e8e8/999?text=Proof+of+Address',
  },
  {
    key: 'tax_id',
    titleKey: 'profile_setup.corporate_doc_tax_id',
    descriptionKey: 'profile_setup.corporate_doc_tax_id_note',
    uploaded: false,
  },
  {
    key: 'letterhead',
    titleKey: 'profile_setup.corporate_doc_letterhead_authorization',
    descriptionKey: 'profile_setup.corporate_doc_letterhead_authorization_note',
    uploaded: false,
  },
];

export default function DocumentVerificationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabView>('documents');
  const [documents] = useState<DocumentItem[]>(initialDocuments);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

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
        translationKey="account.document_verification_title"
        align="center"
        onBack={() => router.back()}
      />

      {/* Segment Control */}
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {tab === 'documents' ? (
          <>
            {documents.map((doc) => (
              <View key={doc.key} style={[styles.docCard, { backgroundColor: colors.surface }]}>
                <View style={styles.docHeader}>
                  <View style={styles.docTitleRow}>
                    <MaterialCommunityIcons
                      name={doc.uploaded ? 'file-check-outline' : 'file-outline'}
                      size={22}
                      color={doc.uploaded ? colors.success : colors.textSecondary}
                    />
                    <View style={styles.docTitleWrap}>
                      <Text variant="body" weight="medium" numberOfLines={1}>
                        {t(doc.titleKey)}
                        {doc.required ? <Text color="error"> *</Text> : null}
                      </Text>
                      <Text variant="caption" color={doc.uploaded ? 'success' : 'muted'}>
                        {doc.uploaded ? t('account.doc_uploaded') : t('account.doc_not_uploaded')}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text variant="caption" color="muted" style={styles.docDescription}>
                  {t(doc.descriptionKey)}
                </Text>

                {doc.uploaded && doc.previewUri && (
                  <Pressable onPress={() => setPreviewDoc(doc)}>
                    <Image
                      source={{ uri: doc.previewUri }}
                      style={[styles.docPreview, { backgroundColor: colors.border }]}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}

                <View style={styles.docActions}>
                  {doc.uploaded ? (
                    <>
                      <Pressable
                        style={[styles.docActionButton, { backgroundColor: colors.accent }]}
                        onPress={() => setPreviewDoc(doc)}
                      >
                        <MaterialCommunityIcons name="eye-outline" size={16} color={colors.primary} />
                        <Text variant="caption" weight="medium" color="primary">{t('account.doc_view')}</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.docActionButton, { backgroundColor: colors.accent }]}
                      >
                        <MaterialCommunityIcons name="pencil-outline" size={16} color={colors.primary} />
                        <Text variant="caption" weight="medium" color="primary">{t('account.doc_update')}</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      style={[styles.docActionButton, { backgroundColor: colors.accent }]}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color={colors.primary} />
                      <Text variant="caption" weight="medium" color="primary">{t('account.doc_upload')}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <>
            <View style={[styles.verificationCard, { backgroundColor: colors.surface }]}>
              <View style={styles.verificationIconWrap}>
                <FaceOutline size={64} color={colors.textPrimary} />
              </View>

              <Text variant="h3" weight="medium" size="xl">
                {t('profile_setup.corporate_identity_validation')}
              </Text>

              <Text variant="bodySmall" color="muted" style={styles.verificationDesc}>
                {t('profile_setup.corporate_identity_validation_note')}
              </Text>

              <View style={styles.bullets}>
                <Text variant="bodySmall" color="muted">
                  {`\u2022 ${t('profile_setup.corporate_identity_bullet_1')}`}
                </Text>
                <Text variant="bodySmall" color="muted">
                  {`\u2022 ${t('profile_setup.corporate_identity_bullet_2')}`}
                </Text>
              </View>

              <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statusRow}>
                <Text variant="body" weight="medium">{t('account.verification_status_label')}</Text>
                <View style={[styles.statusBadge, { borderColor: colors.success }]}>
                  <Text variant="caption" color="success">{t('account.verification_status_verified')}</Text>
                </View>
              </View>
            </View>

            <Button
              translationKey="account.reverify_identity"
              variant="outline"
              style={styles.reverifyButton}
            />
          </>
        )}
      </ScrollView>

      {/* Document Preview Modal */}
      <Modal
        transparent
        animationType="fade"
        visible={!!previewDoc}
        onRequestClose={() => setPreviewDoc(null)}
      >
        <View style={styles.previewOverlay}>
          <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
            <View style={styles.previewHeader}>
              <Text variant="body" weight="semiBold" numberOfLines={1} style={styles.previewTitle}>
                {previewDoc ? t(previewDoc.titleKey) : ''}
              </Text>
              <Pressable onPress={() => setPreviewDoc(null)} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            {previewDoc?.previewUri && (
              <Image
                source={{ uri: previewDoc.previewUri }}
                style={[styles.previewImage, { backgroundColor: colors.border }]}
                resizeMode="contain"
              />
            )}

            <View style={styles.previewActions}>
              <Button
                translationKey="account.doc_update"
                variant="outline"
                style={styles.previewActionButton}
                onPress={() => setPreviewDoc(null)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  segmentWrap: {
    borderRadius: borderRadius.full,
    padding: 4,
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  content: {
    paddingBottom: spacing.xxxxl,
    gap: spacing.md,
  },
  docCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  docTitleWrap: {
    flex: 1,
    gap: 2,
  },
  docDescription: {
    lineHeight: 18,
  },
  docPreview: {
    width: '100%',
    height: 140,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
  },
  docActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  docActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  verificationCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  verificationIconWrap: {
    alignItems: 'center',
    marginVertical: spacing.sm,
  },
  verificationDesc: {
    lineHeight: 20,
  },
  bullets: {
    gap: spacing.sm,
  },
  statusDivider: {
    height: 1,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  reverifyButton: {
    marginTop: spacing.sm,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  previewCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    gap: spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    flex: 1,
    marginRight: spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: borderRadius.lg,
  },
  previewActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  previewActionButton: {
    flex: 1,
  },
});

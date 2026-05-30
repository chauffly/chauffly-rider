import AsyncStorage from '@react-native-async-storage/async-storage';

export type CorporateDocumentKey =
  | 'registration_certificate'
  | 'address_proof'
  | 'tax_id'
  | 'letterhead';

export type CorporateVerificationStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected';

export type CorporateDocumentRecord = {
  key: CorporateDocumentKey;
  fileName: string;
  uri: string;
  mimeType: string;
  uploadedAt: string;
};

type CorporateDocumentState = {
  documents: Partial<Record<CorporateDocumentKey, CorporateDocumentRecord>>;
  verificationStatus: CorporateVerificationStatus;
  verificationSubmittedAt?: string;
  verificationNote?: string;
};

const STORAGE_PREFIX = 'chauffly:corporate:documents';

const requiredDocumentKeys: CorporateDocumentKey[] = ['registration_certificate', 'address_proof'];

const getStorageKey = (userKey: string) => `${STORAGE_PREFIX}:${userKey.trim().toLowerCase()}`;

const defaultState = (): CorporateDocumentState => ({
  documents: {},
  verificationStatus: 'not_submitted'
});

const normalizeState = (value: unknown): CorporateDocumentState => {
  if (!value || typeof value !== 'object') {
    return defaultState();
  }

  const input = value as Record<string, unknown>;
  const documentsInput =
    input.documents && typeof input.documents === 'object'
      ? (input.documents as Record<string, unknown>)
      : {};

  const documents = Object.entries(documentsInput).reduce<CorporateDocumentState['documents']>(
    (acc, [key, raw]) => {
      if (!raw || typeof raw !== 'object') {
        return acc;
      }

      const item = raw as Record<string, unknown>;
      if (
        typeof item.fileName !== 'string' ||
        typeof item.uri !== 'string' ||
        typeof item.mimeType !== 'string' ||
        typeof item.uploadedAt !== 'string'
      ) {
        return acc;
      }

      acc[key as CorporateDocumentKey] = {
        key: key as CorporateDocumentKey,
        fileName: item.fileName,
        uri: item.uri,
        mimeType: item.mimeType,
        uploadedAt: item.uploadedAt
      };
      return acc;
    },
    {}
  );

  const verificationStatus =
    input.verificationStatus === 'pending' ||
    input.verificationStatus === 'verified' ||
    input.verificationStatus === 'rejected' ||
    input.verificationStatus === 'not_submitted'
      ? input.verificationStatus
      : 'not_submitted';

  return {
    documents,
    verificationStatus,
    verificationSubmittedAt:
      typeof input.verificationSubmittedAt === 'string' ? input.verificationSubmittedAt : undefined,
    verificationNote: typeof input.verificationNote === 'string' ? input.verificationNote : undefined
  };
};

const requireUserKey = (userKey?: string | null): string | null => {
  const normalized = userKey?.trim();
  return normalized ? normalized : null;
};

export const corporateDocumentVerificationService = {
  requiredDocumentKeys,

  async getState(userKey?: string | null): Promise<CorporateDocumentState> {
    const resolvedUserKey = requireUserKey(userKey);
    if (!resolvedUserKey) {
      return defaultState();
    }

    try {
      const raw = await AsyncStorage.getItem(getStorageKey(resolvedUserKey));
      if (!raw) {
        return defaultState();
      }

      return normalizeState(JSON.parse(raw));
    } catch {
      return defaultState();
    }
  },

  async saveState(userKey: string, state: CorporateDocumentState): Promise<void> {
    await AsyncStorage.setItem(getStorageKey(userKey), JSON.stringify(state));
  },

  async upsertDocument(
    userKey: string | null | undefined,
    document: CorporateDocumentRecord
  ): Promise<CorporateDocumentState> {
    const resolvedUserKey = requireUserKey(userKey);
    if (!resolvedUserKey) {
      return defaultState();
    }

    const current = await this.getState(resolvedUserKey);
    const next: CorporateDocumentState = {
      ...current,
      documents: {
        ...current.documents,
        [document.key]: document
      },
      verificationStatus:
        current.verificationStatus === 'verified' ? 'pending' : current.verificationStatus === 'rejected' ? 'pending' : current.verificationStatus,
      verificationNote: undefined
    };

    await this.saveState(resolvedUserKey, next);
    return next;
  },

  async submitForReview(userKey?: string | null): Promise<CorporateDocumentState> {
    const resolvedUserKey = requireUserKey(userKey);
    if (!resolvedUserKey) {
      return defaultState();
    }

    const current = await this.getState(resolvedUserKey);
    const next: CorporateDocumentState = {
      ...current,
      verificationStatus: 'pending',
      verificationSubmittedAt: new Date().toISOString(),
      verificationNote: 'Your corporate verification documents are awaiting manual review.'
    };
    await this.saveState(resolvedUserKey, next);
    return next;
  },

  hasRequiredDocuments(state: CorporateDocumentState): boolean {
    return requiredDocumentKeys.every((key) => Boolean(state.documents[key]));
  }
};


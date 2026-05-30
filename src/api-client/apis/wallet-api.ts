import type { HttpClient } from '../http';
import type { PaginatedResponse, WalletTopUpInput } from '../types';
import { withQuery } from './common';

export interface PaymentMethodInput {
  type: 'card' | 'bank_account';
  provider: string;
  token?: string;
  last_four?: string;
  is_default?: boolean;
  metadata?: Record<string, unknown>;
}

export interface WalletTransactionsQuery {
  cursor?: string;
  limit?: number;
  type?: string;
}

export interface WalletApi {
  topUp(input: WalletTopUpInput): Promise<{ authorization_url?: string; reference?: string }>;
  verifyTopUp(reference: string): Promise<{ credited: boolean; amount_kobo: number }>;
  getBalance(): Promise<{
    available_balance_kobo: number;
    ledger_balance_kobo: number;
    currency: string;
    updated_at?: string;
  }>;
  getTransactions(params?: WalletTransactionsQuery): Promise<PaginatedResponse<Record<string, unknown>>>;

  addPaymentMethod(input: PaymentMethodInput): Promise<Record<string, unknown>>;
  listPaymentMethods(): Promise<Array<Record<string, unknown>>>;
  deletePaymentMethod(id: string): Promise<{ message: string }>;
  setDefaultPaymentMethod(id: string): Promise<Record<string, unknown>>;
}

export const createWalletApi = (http: HttpClient): WalletApi => {
  return {
    topUp(input) {
      return http.post('/wallet/top-up', input);
    },

    verifyTopUp(reference) {
      return http.post('/wallet/verify-top-up', { reference });
    },

    getBalance() {
      return http.get('/wallet/balance');
    },

    getTransactions(params) {
      return http.get(
        '/wallet/transactions',
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit,
          type: params?.type
        })
      );
    },

    addPaymentMethod(input) {
      return http.post('/wallet/payment-methods', {
        type: input.type,
        provider: input.provider,
        authorization_code: input.token ?? input.metadata?.authorization_code,
        last_four: input.last_four ?? input.metadata?.last_four,
        is_default: input.is_default,
        metadata: input.metadata
      });
    },

    listPaymentMethods() {
      return http.get('/wallet/payment-methods');
    },

    deletePaymentMethod(id) {
      return http.delete(`/wallet/payment-methods/${id}`);
    },

    setDefaultPaymentMethod(id) {
      return http.patch(`/wallet/payment-methods/${id}/default`);
    }
  };
};

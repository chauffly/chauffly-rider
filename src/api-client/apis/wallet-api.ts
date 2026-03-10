import { HttpClient } from '../http';
import { PaginatedResponse, WalletTopUpInput } from '../types';
import { withQuery } from './common';

export interface PaymentMethodInput {
  type: 'card' | 'bank_account';
  provider: string;
  token?: string;
  metadata?: Record<string, unknown>;
}

export interface WalletTransactionsQuery {
  cursor?: string;
  limit?: number;
  type?: string;
}

export interface WalletApi {
  topUp(input: WalletTopUpInput): Promise<{ authorization_url?: string; reference?: string }>;
  getBalance(): Promise<{ available_balance: number; ledger_balance: number; currency: string }>;
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
      return http.post('/wallet/payment-methods', input);
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

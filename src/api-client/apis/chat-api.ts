import { HttpClient } from '../http';
import { ChatSendMessageInput, PaginatedResponse } from '../types';
import { withQuery } from './common';

export interface ChatApi {
  getQuickReplies(locale?: string): Promise<Array<Record<string, unknown>>>;
  getMessages(
    bookingId: string,
    params?: { cursor?: string; limit?: number }
  ): Promise<PaginatedResponse<Record<string, unknown>>>;
  sendMessage(bookingId: string, input: ChatSendMessageInput): Promise<Record<string, unknown>>;
}

export const createChatApi = (http: HttpClient): ChatApi => {
  return {
    getQuickReplies(locale) {
      return http.get(
        '/chat/quick-replies',
        withQuery(undefined, {
          locale
        })
      );
    },

    getMessages(bookingId, params) {
      return http.get(
        `/chat/${bookingId}/messages`,
        withQuery(undefined, {
          cursor: params?.cursor,
          limit: params?.limit
        })
      );
    },

    sendMessage(bookingId, input) {
      return http.post(`/chat/${bookingId}/messages`, input);
    }
  };
};

import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

import { useChatMessages, useChatMessagesSocket, useChatQuickReplies, useSendChatMessage } from '@/api-client';
import { Text } from '@/components/common/text';
import { spacing, borderRadius } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { socketClient } from '@/runtime/rider-runtime';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';

type ChatMessageVm = {
  id: string;
  text: string;
  time: string;
  fromDriver: boolean;
};

// Server input-sanitization escapes free-text fields. Reverse the encoding
// for display so a message like `I'm on the way.` doesn't render as `I&#39;m`.
const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#39;/g, "'")
    .replace(/&#96;/g, '`')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const safeFormatTime = (value: unknown): string => {
  if (typeof value !== 'string' || !value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return format(date, 'h:mm a');
};

export default function MessageDriverScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ bookingId?: string; driverName?: string }>();
  const bookingId = params.bookingId ?? '';
  const [message, setMessage] = useState('');

  const { data: messagesData } = useChatMessages(bookingId, undefined, {
    enabled: Boolean(bookingId)
  });
  const { data: quickRepliesData } = useChatQuickReplies(undefined, {
    enabled: Boolean(bookingId)
  });
  const sendMessageFallback = useSendChatMessage(bookingId);
  const socketChat = useChatMessagesSocket(socketClient, bookingId);

  const restMessages = asArray<Record<string, unknown>>(asRecord(messagesData).items).map((record) => ({
    id: asString(record.id),
    text: decodeHtmlEntities(asString(record.text ?? record.message)),
    time: safeFormatTime(record.createdAt ?? record.created_at),
    fromDriver: asString(record.senderType ?? record.sender_type) === 'driver',
    isRead: asBoolean(record.isRead ?? record.is_read)
  }));

  const liveMessages = socketChat.messages.map((record) => ({
    id: asString(record.id),
    text: decodeHtmlEntities(asString(record.text)),
    time: safeFormatTime(record.createdAt),
    fromDriver: record.senderType === 'driver',
    isRead: record.isRead
  }));

  const chatMessages: ChatMessageVm[] = useMemo(() => {
    const merged = [...restMessages];
    for (const messageEntry of liveMessages) {
      if (!merged.some((item) => item.id === messageEntry.id)) {
        merged.push(messageEntry);
      }
    }
    return merged.sort((a, b) => a.id.localeCompare(b.id));
  }, [liveMessages, restMessages]);

  const quickReplies = asArray<Record<string, unknown>>(quickRepliesData).map((item) =>
    asString(item.text ?? item.label)
  );

  const handleSend = async () => {
    const text = message.trim();
    if (!bookingId || !text) {
      return;
    }

    setMessage('');
    try {
      socketChat.sendMessage(text);
    } catch {
      await sendMessageFallback.mutateAsync({ text });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" weight="medium">
          {params.driverName || 'Driver'}
        </Text>
        <View style={styles.headerIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.messagesContainer}>
        {chatMessages.map((chat) => (
          <View
            key={chat.id}
            style={[
              styles.messageBubble,
              {
                alignSelf: chat.fromDriver ? 'flex-start' : 'flex-end',
                backgroundColor: chat.fromDriver ? colors.surface : colors.primary,
                borderBottomRightRadius: chat.fromDriver ? borderRadius.lg : 6,
                borderBottomLeftRadius: chat.fromDriver ? 6 : borderRadius.lg
              }
            ]}
          >
            <Text variant="body" color={chat.fromDriver ? undefined : 'inverse'} style={styles.messageText}>
              {chat.text}
            </Text>
            <Text variant="caption" color={chat.fromDriver ? 'muted' : 'inverse'} align="right">
              {chat.time}
            </Text>
          </View>
        ))}
      </ScrollView>

      {quickReplies.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickRepliesRow}
        >
          {quickReplies.slice(0, 6).map((reply) => (
            <Pressable
              key={reply}
              style={[styles.quickReplyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setMessage(reply)}
            >
              <Text variant="caption">{reply}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      <View style={[styles.inputBar, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.sm }]}>
        <MaterialCommunityIcons name="emoticon-outline" size={28} color={colors.textMuted} />

        <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('booking.chat_message_placeholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
            onFocus={() => socketChat.emitTyping(true)}
            onBlur={() => socketChat.emitTyping(false)}
          />
          <MaterialCommunityIcons name="paperclip" size={24} color={colors.textMuted} />
        </View>

        <Pressable style={[styles.sendButton, { backgroundColor: colors.primary }]} onPress={handleSend}>
          <MaterialCommunityIcons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  messagesContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md
  },
  messageBubble: {
    maxWidth: '76%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs
  },
  messageText: {
    lineHeight: 26
  },
  quickRepliesRow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm
  },
  quickReplyChip: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 18
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center'
  }
});

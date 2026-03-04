import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { spacing, borderRadius } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { localJsonApi } from '@/api/local-json-api';

type ChatMessage = {
  id: string;
  text: string;
  time: string;
  fromDriver: boolean;
};

export default function MessageDriverScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ driverName?: string }>();
  const [message, setMessage] = useState('');
  const apiDriver = localJsonApi.getPrimaryDriver();
  const chatMessages: ChatMessage[] = localJsonApi.getChatMessages().map((record) => ({
    id: record.id,
    text: record.text,
    time: record.time,
    fromDriver: record.sender_type === 'driver',
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md }]}> 
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" weight="medium">{params.driverName || apiDriver.display_name}</Text>
        <View style={styles.headerIcon} />
      </View>

      <View style={styles.messagesContainer}>
        {chatMessages.map((chat) => (
          <View
            key={chat.id}
            style={[
              styles.messageBubble,
              {
                alignSelf: chat.fromDriver ? 'flex-start' : 'flex-end',
                backgroundColor: chat.fromDriver ? colors.surface : colors.primary,
                borderBottomRightRadius: chat.fromDriver ? borderRadius.lg : 6,
                borderBottomLeftRadius: chat.fromDriver ? 6 : borderRadius.lg,
              },
            ]}
          >
            <Text
              variant="body"
              color={chat.fromDriver ? undefined : 'inverse'}
              style={styles.messageText}
            >
              {chat.text}
            </Text>
            <Text
              variant="caption"
              color={chat.fromDriver ? 'muted' : 'inverse'}
              align="right"
            >
              {chat.time}
            </Text>
          </View>
        ))}
      </View>

      <View style={[styles.inputBar, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.sm }]}> 
        <MaterialCommunityIcons name="emoticon-outline" size={28} color={colors.textMuted} />

        <View style={[styles.inputWrap, { backgroundColor: colors.background, borderColor: colors.border }]}> 
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('booking.chat_message_placeholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.textPrimary }]}
          />
          <MaterialCommunityIcons name="paperclip" size={24} color={colors.textMuted} />
        </View>

        <Pressable style={[styles.sendButton, { backgroundColor: colors.primary }]}> 
          <MaterialCommunityIcons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  messageBubble: {
    maxWidth: '76%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
  },
  messageText: {
    lineHeight: 26,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 48,
    fontSize: 18,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

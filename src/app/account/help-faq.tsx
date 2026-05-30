import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { StackHeader } from '@/components/common/stack-header';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

type FaqCategory = 'general' | 'account' | 'services' | 'ride';

type CategoryItem = {
  key: FaqCategory;
  labelKey: string;
};

type FaqItem = {
  id: string;
  category: FaqCategory;
  questionKey: string;
  answerKey: string;
};

const categories: CategoryItem[] = [
  { key: 'general', labelKey: 'account.faq_category_general' },
  { key: 'account', labelKey: 'account.faq_category_account' },
  { key: 'services', labelKey: 'account.faq_category_services' },
  { key: 'ride', labelKey: 'account.faq_category_ride' },
];

const faqItems: FaqItem[] = [
  {
    id: 'faq_1',
    category: 'general',
    questionKey: 'account.faq_question_1',
    answerKey: 'account.faq_answer_1',
  },
  {
    id: 'faq_2',
    category: 'general',
    questionKey: 'account.faq_question_2',
    answerKey: 'account.faq_answer_2',
  },
  {
    id: 'faq_3',
    category: 'services',
    questionKey: 'account.faq_question_3',
    answerKey: 'account.faq_answer_3',
  },
  {
    id: 'faq_4',
    category: 'ride',
    questionKey: 'account.faq_question_4',
    answerKey: 'account.faq_answer_4',
  },
  {
    id: 'faq_5',
    category: 'account',
    questionKey: 'account.faq_question_5',
    answerKey: 'account.faq_answer_5',
  },
  {
    id: 'faq_6',
    category: 'account',
    questionKey: 'account.faq_question_6',
    answerKey: 'account.faq_answer_6',
  },
  {
    id: 'faq_7',
    category: 'general',
    questionKey: 'account.faq_question_7',
    answerKey: 'account.faq_answer_7',
  },
];

export default function FaqScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('general');
  const [expandedId, setExpandedId] = useState('faq_1');

  const visibleFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();
    return faqItems.filter((item) => {
      const inCategory = item.category === selectedCategory;
      if (!inCategory) {
        return false;
      }
      if (!query) {
        return true;
      }
      const question = t(item.questionKey).toLowerCase();
      const answer = t(item.answerKey).toLowerCase();
      return question.includes(query) || answer.includes(query);
    });
  }, [search, selectedCategory, t]);

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
        translationKey="account.faq_title"
        align="center"
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholderTranslationKey="account.faq_search_placeholder"
          leftIcon={<Ionicons name="search-outline" size={22} color={colors.textMuted} />}
          accessibilityLabel={t('account.faq_search_placeholder')}
        />

        <ScrollView style={styles.categoryRow} horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((category) => {
            const active = selectedCategory === category.key;
            return (
              <Pressable
                key={category.key}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: active ? colors.textPrimary : colors.background,
                    borderColor: active ? colors.textPrimary : colors.border,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(category.key);
                  setExpandedId('');
                }}
                accessibilityRole="button"
                accessibilityLabel={t(category.labelKey)}
              >
                <Text
                  variant="bodySmall"
                  color={active ? 'inverse' : 'secondary'}
                  translationKey={category.labelKey}
                />
              </Pressable>
            );
          })}
        </ScrollView>

        {visibleFaqs.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.surface }]}>
            <Text variant="body" color="muted" translationKey="account.faq_empty" />
          </View>
        ) : (
          <View style={styles.faqList}>
            {visibleFaqs.map((item) => {
              const expanded = expandedId === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.faqCard, { backgroundColor: colors.surface }]}
                  onPress={() => setExpandedId(expanded ? '' : item.id)}
                  accessibilityRole="button"
                  accessibilityLabel={t(item.questionKey)}
                >
                  <View style={styles.faqHeader}>
                    <Text variant="h3" size="lg" weight="medium" translationKey={item.questionKey} />
                    <Ionicons
                      name={expanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color={colors.textPrimary}
                    />
                  </View>
                  {expanded && (
                    <>
                      <View style={[styles.faqDivider, { backgroundColor: colors.border }]} />
                      <Text variant="body" color="muted" translationKey={item.answerKey} />
                    </>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap', 
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  categoryChip: {
    minWidth: 84,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    marginRight: 8
  },
  emptyCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
  },
  faqList: {
    gap: spacing.md,
  },
  faqCard: {
    borderRadius: borderRadius.xxl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  faqDivider: {
    height: 0.5,
    marginVertical: spacing.xs,
  },
});

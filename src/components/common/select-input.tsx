import { ReactNode, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { Text } from './text';
import { BottomSheet } from './bottom-sheet';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontFamily, fontSize } from '@/constants/typography';
import ChevronDown from '../svg/ChevronDown';

export interface SelectOption {
  label: string;
  value: string;
  translationKey?: string;
}

export interface SelectInputProps {
  label?: string;
  labelTranslationKey?: string;
  placeholder?: string;
  placeholderTranslationKey?: string;
  leftIcon?: ReactNode;
  options: SelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  errorTranslationKey?: string;
}

export function SelectInput({
  label,
  labelTranslationKey,
  placeholder,
  placeholderTranslationKey,
  leftIcon,
  options,
  value,
  onValueChange,
  error,
  errorTranslationKey,
}: SelectInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const labelText = labelTranslationKey ? t(labelTranslationKey) : label;
  const placeholderText = placeholderTranslationKey ? t(placeholderTranslationKey) : placeholder;
  const errorText = errorTranslationKey ? t(errorTranslationKey) : error;
  const hasError = !!errorText;

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption
    ? (selectedOption.translationKey ? t(selectedOption.translationKey) : selectedOption.label)
    : placeholderText;

  const hasValue = !!value;

  const getBorderStyle = () => {
    if (hasError) {
      return { borderWidth: 1, borderColor: colors.error };
    }
    return { borderWidth: 0, borderColor: 'transparent' };
  };

  const getOutlineStyle = () => {
    if (hasError) {
      return { borderWidth: 4, borderColor: colors.error50 };
    }
    return { borderWidth: 0, borderColor: 'transparent', padding: 0 };
  };

  const handleSelect = (optionValue: string) => {
    onValueChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {labelText && (
        <Text variant="label" style={styles.label}>
          {labelText}
        </Text>
      )}
      <View
        style={[
          styles.outlineWrapper,
          hasError && getOutlineStyle(),
        ]}
      >
        <Pressable
          onPress={() => setIsOpen(true)}
          style={[
            styles.inputContainer,
            getBorderStyle(),
            { backgroundColor: colors.surface },
          ]}
        >
          {leftIcon && (
            <View style={styles.leftIcon}>
              {leftIcon}
            </View>
          )}
          <Text
            style={[
              styles.input,
              {
                color: hasValue ? colors.textPrimary : colors.textMuted,
                fontFamily: fontFamily.regular,
              },
            ]}
          >
            {displayText}
          </Text>
          <View style={styles.rightIcon}>
            <ChevronDown color={colors.textMuted} />
          </View>
        </Pressable>
      </View>
      {hasError && (
        <Text variant="caption" style={[styles.errorText, { color: colors.error }]}>
          {errorText}
        </Text>
      )}

      <BottomSheet
        visible={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.optionItem,
                value === item.value && { backgroundColor: colors.accent },
              ]}
              onPress={() => handleSelect(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.textPrimary },
                  value === item.value && { color: colors.primary },
                ]}
              >
                {item.translationKey ? t(item.translationKey) : item.label}
              </Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.xs,
  },
  outlineWrapper: {
    borderRadius: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 50,
    paddingHorizontal: spacing.lg,
    minHeight: 50,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  optionItem: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  optionText: {
    fontSize: fontSize.md,
  },
  separator: {
    height: 1,
  },
});

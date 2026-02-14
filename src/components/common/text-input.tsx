import { ReactNode, useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import { fontFamily, fontSize } from '@/constants/typography';
import Check from '../svg/Check';

export interface TextInputProps extends Omit<RNTextInputProps, "placeholder"> {
  label?: string;
  labelTranslationKey?: string;
  placeholder?: string;
  placeholderTranslationKey?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  error?: string;
  errorTranslationKey?: string;
  secureTextEntry?: boolean;
}

 


export function TextInput({
  label,
  labelTranslationKey,
  placeholder,
  placeholderTranslationKey,
  leftIcon,
  rightIcon,
  error,
  errorTranslationKey,
  secureTextEntry,
  style,
  value,
  onChangeText,
  ...rest
}: TextInputProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState("");

  const currentValue = value !== undefined ? value : internalValue;
  const hasText = currentValue.length > 0;

  const labelText = labelTranslationKey ? t(labelTranslationKey) : label;
  const placeholderText = placeholderTranslationKey
    ? t(placeholderTranslationKey)
    : placeholder;
  const errorText = errorTranslationKey ? t(errorTranslationKey) : error;
  const hasError = !!errorText;

  const handleChangeText = (text: string) => {
    if (value === undefined) {
      setInternalValue(text);
    }
    onChangeText?.(text);
  };

  const getInputState = () => {
    if (hasError && hasText) return "error";
    if (hasText && !hasError) return "valid";
    if (isFocused) return "focused";
    return "default";
  };

  const inputState = getInputState();

  const getBorderStyle = () => {
    switch (inputState) {
      case "error":
        return { borderWidth: 1, borderColor: colors.error };
      case "valid":
        return { borderWidth: 1, borderColor: colors.success };
      case "focused":
        return { borderWidth: 0.5, borderColor: colors.border };
      default:
        return { borderWidth: 0, borderColor: "transparent" };
    }
  };

  const getOutlineStyle = () => {
    if (inputState === "error") {
      return { borderWidth: 4, borderColor: colors.error50 };
    }
    if (inputState === "valid") {
      return { borderWidth: 4, borderColor: colors.success50 };
    }
    return { borderWidth: 0, borderColor: "transparent", padding: 0 };
  };

  const showOutline = inputState === "error" || inputState === "valid";

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
          showOutline && {
            ...getOutlineStyle(),
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            getBorderStyle(),
            { backgroundColor: colors.surface },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <RNTextInput
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily.regular,
                height: rest.multiline ? 80 : undefined,
                textAlignVertical: rest.multiline ? 'top' : 'center',
              },
              style,
            ]}
            placeholder={placeholderText}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            value={currentValue}
            onChangeText={handleChangeText}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...rest}
          />
          {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
          {secureTextEntry && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIcon}
              hitSlop={8}
            >
              <Ionicons
                name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.textMuted}
              />
            </Pressable>
          )}
          {hasError && !secureTextEntry ? (
            <View style={styles.rightIcon}>
              <Ionicons name="alert-circle" size={20} color={colors.error} />
            </View>
          ) : inputState === "valid" && !secureTextEntry ? (
            <View style={styles.rightIcon}>
              <Check />
            </View>
          ) : null}
        </View>
      </View>
      {hasError && (
        <Text
          variant="caption"
          style={[styles.errorText, { color: colors.error }]}
        >
          {errorText}
        </Text>
      )}
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
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 30,
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
});

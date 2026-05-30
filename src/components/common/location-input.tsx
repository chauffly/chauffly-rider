import { View, StyleSheet, TextInput, Pressable, TextInputProps, StyleProp, ViewStyle } from 'react-native';
import { ReactNode, forwardRef, Ref } from 'react';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { spacing, } from '@/constants/spacing';
import { fontFamily, fontSize } from '@/constants/typography';

export type LocationInputType = 'origin' | 'destination' | 'stop';

interface LocationInputProps extends Omit<TextInputProps, 'placeholder' | 'style'> {
  type: LocationInputType;
  placeholderKey?: string;
  placeholder?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  isEditable?: boolean;
  displayValue?: string;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const LocationInput = forwardRef(function LocationInput({
  type,
  placeholderKey,
  placeholder,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isEditable = true,
  displayValue,
  onPress,
  value,
  style,
  onChangeText,
  ...rest
}: LocationInputProps, ref: Ref<TextInput>) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const getIndicatorColor = () => {
    switch (type) {
      case 'origin':
        return '#43A047';
      case 'destination':
      case 'stop':
        return '#E53935';
      default:
        return colors.primary;
    }
  };

  const placeholderText = placeholderKey ? t(placeholderKey) : placeholder;

  const renderContent = () => {
    if (!isEditable || onPress) {
      return (
        <Pressable
          style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.border, }, style
          ]}
          onPress={onPress}
        >
          <View style={styles.leftSection}>
            {leftIcon || (
              <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
            )}
          </View>
          <View style={styles.inputContainer}>
            <Text
              variant="body"
              numberOfLines={1}
            >
              {displayValue || value || placeholderText}
            </Text>
          </View>
          {rightIcon && (
            <Pressable style={styles.rightSection} onPress={onRightIconPress}>
              {rightIcon}
            </Pressable>
          )}
        </Pressable>
      );
    }

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.surface, borderColor: colors.border }, style
        ]}
      >
        <View style={styles.leftSection}>
          {leftIcon || (
            <View style={[styles.indicator, { backgroundColor: getIndicatorColor() }]} />
          )}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            ref={ref}
            style={[
              styles.input,
              {
                color: colors.textPrimary,
                fontFamily: fontFamily.regular,
              },
            ]}
            placeholder={placeholderText}
            placeholderTextColor={colors.textMuted}
            value={value}
            onChangeText={onChangeText}
            {...rest}
          />
        </View>
        {rightIcon && (
          <Pressable style={styles.rightSection} onPress={onRightIconPress}>
            {rightIcon}
          </Pressable>
        )}
      </View>
    );
  };

  return renderContent();
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 52,
    minHeight: 52,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  leftSection: {
    marginRight: spacing.md,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    fontSize: fontSize.lg,
    paddingVertical: spacing.md,
  },
  rightSection: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
});

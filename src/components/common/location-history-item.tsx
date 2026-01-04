import { View, StyleSheet, Pressable } from 'react-native';

import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { borderRadius, spacing } from '@/constants/spacing';
import LocationPinOutline from '@/components/svg/LocationPinOutline';
import PinIcon from '@/components/svg/PinIcon';
import { format } from 'date-fns';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface LocationHistoryItemProps {
  name: string;
  address?: string;
  distance?: string;
  timestamp?: number;
  isPinned?: boolean;
  onPress: () => void;
  onPinPress?: () => void;
}

export function LocationHistoryItem({
  name,
  address,
  distance,
  timestamp,
  isPinned = false,
  onPress,
  onPinPress,
}: LocationHistoryItemProps) {
  const { colors } = useTheme();

  const formattedDate = timestamp
    ? format(new Date(timestamp), 'MMM dd, yyyy - HH:mm')
    : undefined;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: pressed ? colors.accent : 'transparent' },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { borderColor: colors.border }]}>
        <LocationPinOutline size={20} color={colors.textSecondary} />
      </View>

      <View style={styles.contentContainer}>
        <Text
          variant="body"
          font='medium'
          numberOfLines={1}
          style={styles.name}
        >
          {name}
        </Text>
        {(formattedDate || address) && (
          <Text
            variant="caption"
            color="muted"
            numberOfLines={1}
          >
            {formattedDate || address}
          </Text>
        )}
      </View>

      {distance && (
        <View style={styles.distanceContainer}>
          <Text variant="bodySmall" color="secondary">
            {distance}
          </Text>
        </View>
      )}

      {onPinPress && (
        <Pressable
          style={styles.pinButton}
          onPress={onPinPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons size={22} color={isPinned ? colors.primary : colors.textSecondary} name={isPinned ? "pin" : "pin-outline"} />

        </Pressable>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,

  },
  iconContainer: {
    marginRight: spacing.md,
    borderWidth: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.full
  },
  contentContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  name: {
    marginBottom: 2,
  },
  distanceContainer: {
    marginRight: spacing.md,
  },
  pinButton: {
    padding: spacing.xs,
  },
});

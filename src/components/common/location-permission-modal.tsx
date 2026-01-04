import { View, StyleSheet } from 'react-native';

import { BottomSheet } from './bottom-sheet';
import { Button } from './button';
import { Text } from './text';
import { useTheme } from '@/context/theme-context';
import { spacing, borderRadius } from '@/constants/spacing';
import LocationPinFilled from '@/components/svg/LocationPinFilled';

interface LocationPermissionModalProps {
  visible: boolean;
  onClose: () => void;
  onGrantPermission: () => void;
  onMaybeLater: () => void;
}

export function LocationPermissionModal({
  visible,
  onClose,
  onGrantPermission,
  onMaybeLater,
}: LocationPermissionModalProps) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={[styles.iconContainer, { backgroundColor: colors.accent }]}>
          <LocationPinFilled size={32} color={colors.primary} />
        </View>

        <Text
          variant="h3"
          color="primary"
          align="center"
          translationKey="location.enable_location"
          style={styles.title}
        />

        <Text
          variant="body"
          color="secondary"
          align="center"
          translationKey="location.enable_location_description"
          style={styles.description}
        />

        <View style={styles.buttonsContainer}>
          <Button
            translationKey="location.grant_permission"
            variant="primary"
            size="lg"
            fullWidth
            onPress={onGrantPermission}
            style={styles.primaryButton}
          />

          <Button
            translationKey="location.maybe_later"
            variant="outline"
            size="lg"
            fullWidth
            onPress={onMaybeLater}
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    marginBottom: spacing.md,
  },
  description: {
    marginBottom: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  buttonsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    marginBottom: spacing.sm,
  },
});

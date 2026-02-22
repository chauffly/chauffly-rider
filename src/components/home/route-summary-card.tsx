import { StyleSheet, View, Pressable } from 'react-native';

import { Text } from '@/components/common/text';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';
import PlusCircle from '@/components/svg/PlusCircle';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { Origin, RouteStop } from './types';
import { localJsonApi } from '@/api/local-json-api';

interface RouteSummaryCardProps {
  origin: Origin | null;
  destinations: RouteStop[];
  showAllDestinations: boolean;
  onToggleDestinations: () => void;
  topOffset: number;
  onAddStop?: () => void;
}

export function RouteSummaryCard({
  origin,
  destinations,
  showAllDestinations,
  onToggleDestinations,
  topOffset,
  onAddStop,
}: RouteSummaryCardProps) {
  const { colors } = useTheme();
  const uiDefaults = localJsonApi.getUiDefaults();

  return (
    <View
      style={[
        styles.routeSummaryCard,
        {
          backgroundColor: colors.surface,
          top: topOffset,
        },
      ]}
    >
      <View style={styles.routeSummaryHeader}>
        <View style={styles.routeSummaryRow}>
          <LocationPinGreen size={18} />
          <Text
            variant="bodySmall"
            font="medium"
            numberOfLines={1}
            style={styles.routeSummaryText}
          >
            {origin?.name || uiDefaults.booking.pickup_placeholder}
          </Text>
        </View>
        <Pressable style={styles.routeSummaryAdd} onPress={onAddStop}>
          <PlusCircle size={22} color={colors.primary} />
        </Pressable>
      </View>

      {destinations.length > 0 && (
        <>
          <View
            style={[
              styles.routeSummaryDivider,
              { backgroundColor: colors.border },
            ]}
          />
          <View style={styles.routeSummaryList}>
            {(showAllDestinations ? destinations : destinations.slice(0, 2)).map(
              (dest) => (
                <View key={dest.id} style={styles.routeSummaryRow}>
                  <LocationPinRed size={18} />
                  <Text
                    variant="bodySmall"
                    color="secondary"
                    numberOfLines={1}
                    style={styles.routeSummaryText}
                  >
                    {dest.name}
                  </Text>
                </View>
              )
            )}
          </View>
          {destinations.length > 2 && (
            <Pressable
              style={[
                styles.routeSummaryToggle,
                { backgroundColor: colors.accent },
              ]}
              onPress={onToggleDestinations}
            >
              <Text variant="caption" color="muted">
                {showAllDestinations
                  ? 'Show less'
                  : `+${destinations.length - 2} more stops`}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  routeSummaryCard: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  routeSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  routeSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  routeSummaryText: {
    flex: 1,
  },
  routeSummaryDivider: {
    height: 1,
    marginVertical: spacing.sm,
  },
  routeSummaryList: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  routeSummaryToggle: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  routeSummaryAdd: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});

import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import MapView from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { Button } from '@/components/common/button';
import { localJsonApi } from '@/api/local-json-api';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

const MOOD_OPTIONS = [
  { key: 'very_bad', icon: 'emoticon-sad-outline' },
  { key: 'bad', icon: 'emoticon-frown-outline' },
  { key: 'neutral', icon: 'emoticon-neutral-outline' },
  { key: 'good', icon: 'emoticon-happy-outline' },
  { key: 'great', icon: 'emoticon-excited-outline' },
] as const;

export default function TripArrivedScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    selectedRideId?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
    destinations?: string;
    destinationName?: string;
    destinationAddress?: string;
  }>();
  const activeBooking = localJsonApi.getActiveBooking();
  const [selectedMood, setSelectedMood] = useState('great');
  let destinations: { name?: string; address?: string }[] = [];
  if (params.destinations) {
    try {
      destinations = JSON.parse(params.destinations);
    } catch {
      destinations = [];
    }
  }
  const finalDestination = destinations.length > 0 ? destinations[destinations.length - 1] : null;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION} />

      <View style={[styles.overlay, { backgroundColor: 'rgba(255,255,255,0.70)' }]} />

      <View style={[styles.bottomCard, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}> 
        <View style={[styles.arrivedBadge, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color={colors.white} />
        </View>

        <Text variant="h3" weight="medium" align="center" style={styles.sectionGap}>
          You have arrived!
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text variant="h3" weight="medium" align="center">
          {params.destinationName || finalDestination?.name || activeBooking.route_defaults.destination_name}
        </Text>
        <Text variant="bodySmall" color="muted" align="center" style={styles.addressText}>
          {params.destinationAddress || finalDestination?.address || activeBooking.route_defaults.destination_address}
        </Text>

        <View style={[styles.statsCard, { borderColor: colors.border }]}> 
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">{activeBooking.trip_metrics.duration_text}</Text>
            <Text variant="caption" color="muted">Duration</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">{activeBooking.trip_metrics.distance_text}</Text>
            <Text variant="caption" color="muted">Distance</Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="speedometer" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">{activeBooking.trip_metrics.average_speed_text}</Text>
            <Text variant="caption" color="muted">Avg. Speed</Text>
          </View>
        </View>

        <View style={[styles.moodCard, { borderColor: colors.border }]}> 
          <Text variant="body" weight="medium" align="center">
            How did you feel during the entire trip?
          </Text>

          <View style={styles.moodRow}>
            {MOOD_OPTIONS.map((option) => {
              const active = selectedMood === option.key;

              return (
                <Pressable key={option.key} onPress={() => setSelectedMood(option.key)}>
                  <MaterialCommunityIcons
                    name={option.icon}
                    size={44}
                    color={active ? colors.primary : colors.border}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        <Button
          title="Finish"
          fullWidth
          navigateTo="/booking/rate-driver"
          navigateParams={params} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  arrivedBadge: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  sectionGap: {
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: spacing.lg,
  },
  addressText: {
    marginTop: spacing.sm,
  },
  statsCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  moodCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  finishButton: {
    marginTop: spacing.lg,
    minHeight: 64,
  },
});

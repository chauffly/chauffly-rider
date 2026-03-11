import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import MapView from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useBookingById } from '@/api-client';
import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { Button } from '@/components/common/button';
import { asArray, asRecord, asString } from '@/utils/api-helpers';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25
};

const MOOD_OPTIONS = [
  { key: 'very_bad', icon: 'emoticon-sad-outline' },
  { key: 'bad', icon: 'emoticon-frown-outline' },
  { key: 'neutral', icon: 'emoticon-neutral-outline' },
  { key: 'good', icon: 'emoticon-happy-outline' },
  { key: 'great', icon: 'emoticon-excited-outline' }
] as const;

export default function TripArrivedScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    bookingId?: string;
  }>();
  const bookingId = params.bookingId ?? '';

  const { data: bookingData } = useBookingById(bookingId, {
    enabled: Boolean(bookingId)
  });
  const [selectedMood, setSelectedMood] = useState('great');

  const detail = asRecord(bookingData);
  const booking = asRecord(detail.booking);
  const fare = asRecord(detail.fare);
  const stops = asArray<Record<string, unknown>>(detail.stops);
  const lastStop = useMemo(() => (stops.length > 0 ? asRecord(stops[stops.length - 1]) : {}), [stops]);

  const destinationName = asString(lastStop.name, asString(lastStop.address, 'Destination'));
  const destinationAddress = asString(lastStop.address, '--');
  const durationText =
    fare.durationMinutes !== undefined ? `${fare.durationMinutes} min` : asString(booking.durationText, '--');
  const distanceText =
    fare.distanceKm !== undefined ? `${fare.distanceKm} km` : asString(booking.distanceText, '--');

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION} />

      <View style={[styles.overlay, { backgroundColor: 'rgba(255,255,255,0.70)' }]} />

      <View style={[styles.bottomCard, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={[styles.arrivedBadge, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="calendar-check-outline" size={24} color={colors.white} />
        </View>

        <Text variant="h3" weight="medium" align="center" style={styles.sectionGap}>
          {t('booking.arrived_title')}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Text variant="h3" weight="medium" align="center">
          {destinationName}
        </Text>
        <Text variant="bodySmall" color="muted" align="center" style={styles.addressText}>
          {destinationAddress}
        </Text>

        <View style={[styles.statsCard, { borderColor: colors.border }]}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">
              {durationText}
            </Text>
            <Text variant="caption" color="muted">
              {t('booking.duration_label')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="map-marker-distance" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">
              {distanceText}
            </Text>
            <Text variant="caption" color="muted">
              {t('booking.distance_label')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="speedometer" size={26} color={colors.textPrimary} />
            <Text variant="bodySmall" weight="medium">
              --
            </Text>
            <Text variant="caption" color="muted">
              {t('booking.avg_speed_label')}
            </Text>
          </View>
        </View>

        <View style={[styles.moodCard, { borderColor: colors.border }]}>
          <Text variant="body" weight="medium" align="center">
            {t('booking.how_did_trip_feel')}
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

        <Button translationKey="booking.finish" fullWidth navigateTo="/booking/rate-driver" navigateParams={{ bookingId }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    ...StyleSheet.absoluteFillObject
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg
  },
  arrivedBadge: {
    width: 50,
    height: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: spacing.md
  },
  sectionGap: {
    marginBottom: spacing.sm
  },
  divider: {
    height: 1,
    marginBottom: spacing.lg
  },
  addressText: {
    marginTop: spacing.sm
  },
  statsCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs
  },
  moodCard: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.lg
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  }
});

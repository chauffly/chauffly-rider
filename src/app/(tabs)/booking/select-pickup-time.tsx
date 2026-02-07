import { useRef, useState } from 'react';
import { StyleSheet, View, Pressable, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';
import { addMinutes, format } from 'date-fns';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import CloseIcon from '@/components/svg/CloseIcon';
import { spacing, borderRadius } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';

export default function SelectPickupTimeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isTimeOpen, setIsTimeOpen] = useState(false);
  const dateButtonRef = useRef<View>(null);
  const timeButtonRef = useRef<View>(null);
  const [dateAnchor, setDateAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [timeAnchor, setTimeAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    originLat?: string;
    originLng?: string;
    destinations?: string;
    selectedRideId?: string;
    bookingType?: string;
    pickupDate?: string;
    pickupTime?: string;
    estimatedDurationMinutes?: string;
  }>();

  const initialDate = params.pickupDate
    ? new Date(`${params.pickupDate}T00:00:00`)
    : new Date();
  const initialTime = params.pickupTime
    ? new Date(`${format(new Date(), 'yyyy-MM-dd')}T${params.pickupTime}:00`)
    : new Date();

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  const pickupDateDisplay = format(selectedDate, 'dd MMM yyyy');
  const pickupTimeDisplay = format(selectedTime, 'h:mm a');

  const pickupDateTime = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
    selectedTime.getHours(),
    selectedTime.getMinutes()
  );
  const durationMinutes = params.estimatedDurationMinutes
    ? Number(params.estimatedDurationMinutes)
    : 45;
  const dropoffTimeDisplay = format(addMinutes(pickupDateTime, durationMinutes), 'h:mm a');

  const openDatePopover = () => {
    dateButtonRef.current?.measureInWindow((x, y, width, height) => {
      setDateAnchor({ x, y, width, height });
      setIsDateOpen(true);
    });
  };

  const openTimePopover = () => {
    timeButtonRef.current?.measureInWindow((x, y, width, height) => {
      setTimeAnchor({ x, y, width, height });
      setIsTimeOpen(true);
    });
  };

  const getPopoverLeft = (anchorX: number, popoverWidth: number) => {
    const minLeft = spacing.lg;
    const maxLeft = screenWidth - popoverWidth - spacing.lg;
    return Math.min(Math.max(anchorX, minLeft), maxLeft);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg }]}>
      <Pressable
        onPress={() => router.back()}
        style={styles.closeButton}
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
      >
        <CloseIcon size={24} color={colors.textPrimary} />
      </Pressable>

      <Text variant="h2" font="medium" translationKey="booking.select_pickup_time_title" />
      <Text variant="caption" color="muted" style={styles.subtitle} translationKey="booking.select_pickup_time_subtitle" />

      <View style={styles.section}>
        <View style={styles.row}>
          <Text variant="body" font="medium" translationKey="booking.date_label" />
          <Pressable
            ref={dateButtonRef}
            onPress={openDatePopover}
            style={[styles.valuePill, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel={t('booking.date_label')}
          >
            <Text variant="bodySmall">{pickupDateDisplay}</Text>
          </Pressable>
        </View>

        <View style={styles.row}>
          <Text variant="body" font="medium" translationKey="booking.pickup_time_label" />
          <Pressable
            ref={timeButtonRef}
            onPress={openTimePopover}
            style={[styles.valuePill, { backgroundColor: colors.accent }]}
            accessibilityRole="button"
            accessibilityLabel={t('booking.pickup_time_label')}
          >
            <Text variant="bodySmall">{pickupTimeDisplay}</Text>
          </Pressable>
        </View>

        <Text variant="caption" color="muted" style={styles.note} translationKey="booking.timezone_note" />
      </View>

      <View style={[styles.separator, { backgroundColor: colors.border }]} />

      <View style={styles.estimateRow}>
        <Text variant="bodySmall" color="muted" translationKey="booking.estimated_dropoff" />
        <Text variant="bodySmall" font="medium">{dropoffTimeDisplay}</Text>
      </View>

      <View style={styles.footer}>
        <Button
          translationKey="booking.personalize_ride"
          fullWidth
          onPress={() =>
            router.push({
              pathname: '/(tabs)/booking/personalization',
              params: {
                ...params,
                pickupDate: format(selectedDate, 'yyyy-MM-dd'),
                pickupTime: format(selectedTime, 'HH:mm'),
                estimatedDurationMinutes: durationMinutes.toString(),
              },
            })
          }
        />
      </View>

      {isDateOpen && dateAnchor && (
        <View style={styles.popoverOverlay} pointerEvents="box-none">
          <Pressable style={styles.popoverBackdrop} onPress={() => setIsDateOpen(false)} />
          <View
            style={[
              styles.popoverCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.textPrimary,
                left: getPopoverLeft(dateAnchor.x, 320),
                top: dateAnchor.y + dateAnchor.height + spacing.sm,
                width: 320,
              },
            ]}
          >
            <Calendar
              current={format(selectedDate, 'yyyy-MM-dd')}
              onDayPress={(day) => {
                setSelectedDate(new Date(`${day.dateString}T00:00:00`));
                setIsDateOpen(false);
              }}
              minDate={format(new Date(), 'yyyy-MM-dd')}
              markedDates={{
                [format(selectedDate, 'yyyy-MM-dd')]: {
                  selected: true,
                  selectedColor: colors.primary,
                  selectedTextColor: colors.textInverse,
                },
              }}
              theme={{
                backgroundColor: colors.surface,
                calendarBackground: colors.surface,
                textSectionTitleColor: colors.textSecondary,
                selectedDayBackgroundColor: colors.primary,
                selectedDayTextColor: colors.textInverse,
                todayTextColor: colors.primary,
                dayTextColor: colors.textPrimary,
                monthTextColor: colors.textPrimary,
                arrowColor: colors.textPrimary,
              }}
            />
          </View>
        </View>
      )}

      {isTimeOpen && timeAnchor && (
        <View style={styles.popoverOverlay} pointerEvents="box-none">
          <Pressable style={styles.popoverBackdrop} onPress={() => setIsTimeOpen(false)} />
          <View
            style={[
              styles.popoverCard,
              styles.timePopoverCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: colors.textPrimary,
                left: getPopoverLeft(timeAnchor.x, 240),
                top: timeAnchor.y + timeAnchor.height + spacing.sm,
                width: 240,
              },
            ]}
          >
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'spinner'}
            minuteInterval={5}
            onChange={(event, date) => {
              if (event?.type === 'dismissed') {
                setIsTimeOpen(false);
                return;
              }
              if (date) {
                setSelectedTime(date);
                setIsTimeOpen(false);
              }
            }}
            textColor={colors.textPrimary}
            accentColor={colors.primary}
            style={styles.picker}
          />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  section: {
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valuePill: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popoverCard: {
    position: 'absolute',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  timePopoverCard: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  picker: {
    height: 160,
  },
  note: {
    marginTop: spacing.xs,
  },
  separator: {
    height: 1,
    marginVertical: spacing.lg,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
});

import { useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";

import { TextInput, TextInputProps } from "./text-input";
import { Text } from "./text";
import { spacing, borderRadius } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";

type DatePickerProps = Omit<TextInputProps, "value" | "onChangeText" | "onChange"> & {
  value: Date | null;
  onChange: (next: Date | null) => void;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DatePicker({
  value,
  onChange,
  minimumDate,
  maximumDate,
  ...rest
}: DatePickerProps) {
  const { colors } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const displayValue = value ? format(value, "dd/MM/yyyy") : "";
  const selectedDate = value ?? new Date();

  const openPopover = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setIsOpen(true);
    });
  };

  const getPopoverLeft = (anchorX: number, popoverWidth: number) => {
    const minLeft = spacing.lg;
    const maxLeft = screenWidth - popoverWidth - spacing.lg;
    return Math.min(Math.max(anchorX, minLeft), maxLeft);
  };

  return (
    <>
      <Pressable ref={buttonRef} onPress={openPopover}>
        <TextInput value={displayValue} editable={false} pointerEvents="none" {...rest} />
      </Pressable>
      {isOpen && anchor && (
        <Modal transparent animationType="fade" visible onRequestClose={() => setIsOpen(false)}>
          <View style={styles.popoverOverlay} pointerEvents="box-none">
            <Pressable style={styles.popoverBackdrop} onPress={() => setIsOpen(false)} />
            <View
              style={[
                styles.popoverCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.textPrimary,
                  left: getPopoverLeft(anchor.x, 320),
                  top: anchor.y + anchor.height + spacing.sm,
                  width: 320,
                },
              ]}
            >
              <Calendar
                current={format(selectedDate, "yyyy-MM-dd")}
                onDayPress={(day) => {
                  onChange(new Date(`${day.dateString}T00:00:00`));
                  setIsOpen(false);
                }}
                minDate={minimumDate ? format(minimumDate, "yyyy-MM-dd") : undefined}
                maxDate={maximumDate ? format(maximumDate, "yyyy-MM-dd") : undefined}
                markedDates={{
                  [format(selectedDate, "yyyy-MM-dd")]: {
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
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popoverCard: {
    position: "absolute",
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
  },
});

import { useRef, useState } from "react";
import { Modal, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import { TextInput, TextInputProps } from "./text-input";
import ClockIcon from "@/components/svg/ClockIcon";
import { Text } from "./text";
import { spacing, borderRadius } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";

type TimePickerProps = Omit<TextInputProps, "value" | "onChangeText" | "onChange"> & {
  value: Date | null;
  onChange: (next: Date | null) => void;
  minuteInterval?: number;
};

export function TimePicker({
  value,
  onChange,
  minuteInterval = 5,
  ...rest
}: TimePickerProps) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isOpen, setIsOpen] = useState(false);
  const [draftTime, setDraftTime] = useState<Date>(value ?? new Date());
  const buttonRef = useRef<View>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const displayValue = value ? format(value, "h:mm a") : "";

  const openPopover = () => {
    buttonRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setDraftTime(value ?? new Date());
      setIsOpen(true);
    });
  };

  const getPopoverLeft = (popoverWidth: number) =>
    (screenWidth - popoverWidth) / 2;
  const TIME_POPOVER_WIDTH = 260;
  const TIME_POPOVER_HEIGHT = 260;
  const getPopoverTop = (popoverHeight: number) =>
    (screenHeight - popoverHeight) / 2;

  return (
    <>
      <Pressable ref={buttonRef} onPress={openPopover}>
        <TextInput
          value={displayValue}
          editable={false}
          pointerEvents="none"
          rightIcon={<ClockIcon size={20} color={colors.textMuted} />}
          {...rest}
        />
      </Pressable>
      {isOpen && anchor && (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.popoverOverlay} pointerEvents="box-none">
            <Pressable
              style={styles.popoverBackdrop}
              onPress={() => setIsOpen(false)}
            />
            <View
              style={[
                styles.popoverCard,
                styles.timePopoverCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.textPrimary,
                  left: getPopoverLeft(TIME_POPOVER_WIDTH),
                  top: getPopoverTop(TIME_POPOVER_HEIGHT),
                  width: TIME_POPOVER_WIDTH,
                },
              ]}
            >
              <DateTimePicker
                value={draftTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "spinner"}
                minuteInterval={minuteInterval}
                onChange={(event, date) => {
                  if (event?.type === "dismissed") {
                    setIsOpen(false);
                    return;
                  }
                  if (date) {
                    setDraftTime(date);
                  }
                }}
                textColor={colors.textPrimary}
                accentColor={colors.primary}
                style={styles.picker}
              />
              <View style={styles.timeActions}>
                <Pressable
                  onPress={() => setIsOpen(false)}
                  style={[
                    styles.timeActionButton,
                    { backgroundColor: colors.accent },
                  ]}
                >
                  <Text variant="bodySmall" color="muted">
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    onChange(draftTime);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.timeActionButton,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text variant="bodySmall" color="inverse">
                    Set time
                  </Text>
                </Pressable>
              </View>
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
  timePopoverCard: {
    paddingBottom: spacing.lg,
    alignItems: "center",
  },
  picker: {
    height: 160,
    width: "100%",
  },
  timeActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  timeActionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    alignItems: "center",
  },
});

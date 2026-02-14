import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";

type SwitchProps = {
  value: boolean;
  onValueChange: (next: boolean) => void;
  trackOn: string;
  trackOff: string;
  thumbOn: string;
  thumbOff: string;
  size?: "sm" | "md";
};

const SIZE_MAP = {
  sm: { width: 47, height: 28, thumb: 24, padding: 2 },
  md: { width: 51, height: 31, thumb: 27, padding: 2 },
} as const;

export const Switch = ({
  value,
  onValueChange,
  trackOn,
  trackOff,
  thumbOn,
  thumbOff,
  size = "sm",
}: SwitchProps) => {
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;
  const { width, height, thumb, padding } = SIZE_MAP[size];
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width - thumb - padding * 2],
  });

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [progress, value]);

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={6}
    >
      <View
        style={[
          styles.track,
          {
            width,
            height,
            borderRadius: height / 2,
            padding,
            backgroundColor: value ? trackOn : trackOff,
            borderColor: value ? "transparent" : "rgba(0,0,0,0.1)",
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: thumb,
              height: thumb,
              borderRadius: thumb / 2,
              backgroundColor: value ? thumbOn : thumbOff,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  track: {
    justifyContent: "center",
    borderWidth: 1,
  },
  thumb: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1.5 },
    elevation: 3,
  },
});

import { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  FlatList,
  ViewToken,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/common/text";
import { Button } from "@/components/common/button";
import { useTheme } from "@/context/theme-context";
import { spacing } from "@/constants/spacing";
import { palette } from "@/constants/colors";

const { width, height } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: any;
}

const slides: OnboardingSlide[] = [
  {
    id: "1",
    titleKey: "onboarding.slide1_title",
    descriptionKey: "onboarding.slide1_description",
    image: require("../../assets/images/onboarding-1.png"),
  },
  {
    id: "2",
    titleKey: "onboarding.slide2_title",
    descriptionKey: "onboarding.slide2_description",
    image: require("../../assets/images/onboarding-2.png"),
  },
  {
    id: "3",
    titleKey: "onboarding.slide3_title",
    descriptionKey: "onboarding.slide3_description",
    image: require("../../assets/images/onboarding-3.png"),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleSkip = () => {
    router.replace("/(auth)/login");
  };

  const handleContinue = () => {
    if (isLastSlide) {
      router.replace("/(auth)/login");
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  useEffect(() => {
    router.push("/(tabs)");
  }, []);

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} contentFit="cover" />
      <View style={styles.overlay} />
      <View
        style={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.textContainer}>
          <Text
            variant="h1"
            font="semiBold"
            style={styles.title}
            translationKey={item.titleKey}
          />
          <Text
            variant="body"
            translationKey={item.descriptionKey}
            style={{ color: "rgba(196, 196, 196, .75)" }}
          />
        </View>

        <View style={styles.pagination}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex
                  ? [styles.dotActive, { backgroundColor: colors.primary }]
                  : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonContainer}>
          {isLastSlide ? (
            <Button
              translationKey="common.get_started"
              variant="primary"
              fullWidth
              onPress={handleContinue}
            />
          ) : (
            <View style={styles.buttonRow}>
              <View style={styles.buttonWrapper}>
                <Button
                  translationKey="common.skip"
                  textStyle={{ color: colors.white }}
                  style={{
                    borderWidth: isDark ? 1 : 0,
                    borderColor: "#D9D9D940",
                    backgroundColor: isDark
                      ? colors.transparent
                      : colors.accent,
                  }}
                  fullWidth
                  onPress={handleSkip}
                />
              </View>
              <View style={styles.buttonWrapper}>
                <Button
                  translationKey="common.continue"
                  variant="primary"
                  fullWidth
                  onPress={handleContinue}
                />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        bounces={false}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    width,
    height,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    width,
    height,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  content: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: spacing.xxl,
  },
  textContainer: {
    marginBottom: spacing.xxl,
  },
  title: {
    color: palette.white,
    marginBottom: spacing.lg,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 32,
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  buttonContainer: {
    width: "100%",
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.lg,
  },
  buttonWrapper: {
    flex: 1,
  },
});

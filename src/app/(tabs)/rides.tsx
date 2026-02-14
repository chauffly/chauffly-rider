import { StyleSheet, View, ScrollView, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/common/text";
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";

type RideStatus = "Completed" | "Scheduled" | "Canceled";

type RideItem = {
  id: string;
  status: RideStatus;
  date: string;
  time: string;
  pickup: string;
  dropoff: string;
  price: string;
};

const rides: RideItem[] = [
  {
    id: "ride-1",
    status: "Completed",
    date: "Jan 24, 2026",
    time: "6:20 PM",
    pickup: "Oyo Civic Center",
    dropoff: "Airport Hotel",
    price: "₦ 18,500",
  },
  {
    id: "ride-2",
    status: "Scheduled",
    date: "Jan 25, 2026",
    time: "8:00 AM",
    pickup: "Your current location",
    dropoff: "Oko 210103",
    price: "₦ 12,000",
  },
  {
    id: "ride-3",
    status: "Completed",
    date: "Jan 20, 2026",
    time: "3:45 PM",
    pickup: "University Gate",
    dropoff: "Oyo Stadium",
    price: "₦ 9,800",
  },
];

export default function RidesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.md,
        },
      ]}
    >
      <View style={styles.header}>
        <Text variant="h3" font="medium">
          Rides
        </Text>
        <Text variant="bodySmall" color="muted">
          Your recent and upcoming trips
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {rides.map((ride) => (
          <Pressable
            key={ride.id}
            style={[
              styles.card,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardTopRow}>
              <Text variant="bodySmall" color="muted">
                {ride.date} · {ride.time}
              </Text>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      ride.status === "Completed"
                        ? "rgba(49, 141, 91, 0.12)"
                        : ride.status === "Scheduled"
                          ? "rgba(52, 120, 246, 0.12)"
                          : "rgba(224, 69, 69, 0.12)",
                  },
                ]}
              >
                <Text
                  variant="caption"
                  style={[
                    styles.badgeText,
                    {
                      color:
                        ride.status === "Completed"
                          ? "#318D5B"
                          : ride.status === "Scheduled"
                            ? "#3478F6"
                            : "#E04545",
                    },
                  ]}
                >
                  {ride.status}
                </Text>
              </View>
            </View>

            <View style={styles.route}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.routeText}>
                <Text variant="bodySmall" font="medium">
                  {ride.pickup}
                </Text>
                <Text variant="caption" color="muted">
                  Pickup
                </Text>
              </View>
            </View>

            <View style={styles.route}>
              <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
              <View style={styles.routeText}>
                <Text variant="bodySmall" font="medium">
                  {ride.dropoff}
                </Text>
                <Text variant="caption" color="muted">
                  Dropoff
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text variant="bodySmall" font="medium">
                {ride.price}
              </Text>
              <Text variant="caption" color="muted">
                Details
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    letterSpacing: 0.2,
  },
  route: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  routeText: {
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

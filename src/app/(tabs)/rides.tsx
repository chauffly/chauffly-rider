import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/common/text";
import { TextInput } from "@/components/common/text-input";
import LocationPinGreen from "@/components/svg/LocationPinGreen";
import LocationPinRed from "@/components/svg/LocationPinRed";
import SearchIcon from "@/components/svg/SearchIcon";
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/common/button";

const TABS = [
  { key: "past", label: "Past" },
  { key: "upcoming", label: "Upcoming" },
  { key: "ongoing", label: "Ongoing" },
  { key: "canceled", label: "Canceled" },
] as const;

type RideTab = (typeof TABS)[number]["key"];
type RideCardType = "history" | "live";

type RideStop = {
  id: string;
  title: string;
  subtitle: string;
  time: string;
};

type RideItem = {
  id: string;
  type: RideCardType;
  driverName: string;
  rating?: string;
  reviews?: string;
  vehicleName?: string;
  vehicleMeta?: string;
  stops: RideStop[];
  seatInfo?: number;
  schedule?: string;
  fare: string;
  showTrackRoute?: boolean;
};

const ridesByTab: Record<RideTab, RideItem[]> = {
  past: [
    {
      id: "past-1",
      type: "history",
      driverName: "David I.",
      rating: "4.5",
      reviews: "1,927 reviews",
      vehicleName: "BMW M5 Series",
      vehicleMeta: "NYC-3560 · White",
      stops: [
        {
          id: "s1",
          title: "Bobst Library",
          subtitle: "Branch Office North",
          time: "10:00 AM",
        },
        {
          id: "s2",
          title: "Union Square",
          subtitle: "Client Pickup",
          time: "10:14 AM",
        },
        {
          id: "s3",
          title: "Larchmont Hotel",
          subtitle: "Corporate HQ",
          time: "10:28 AM",
        },
      ],
      seatInfo: 1,
      schedule: "Today, Dec 11 10:30 AM",
      fare: "₦8,000",
    },
    {
      id: "past-2",
      type: "history",
      driverName: "Sarah M.",
      rating: "4.8",
      reviews: "1,102 reviews",
      vehicleName: "Mercedes E-Class",
      vehicleMeta: "ABJ-2120 · Black",
      stops: [
        {
          id: "s1",
          title: "Maitama District",
          subtitle: "Home",
          time: "07:40 AM",
        },
        {
          id: "s2",
          title: "Central Business Area",
          subtitle: "Drop Parcel",
          time: "07:54 AM",
        },
        {
          id: "s3",
          title: "Wuse II",
          subtitle: "Team Pickup",
          time: "08:05 AM",
        },
        {
          id: "s4",
          title: "Nnamdi Azikiwe Intl Airport",
          subtitle: "Terminal D",
          time: "08:32 AM",
        },
      ],
      seatInfo: 2,
      schedule: "Yesterday, Dec 10 07:30 AM",
      fare: "₦14,500",
    },
  ],
  upcoming: [
    {
      id: "upcoming-1",
      type: "history",
      driverName: "David I.",
      rating: "4.5",
      reviews: "1,927 reviews",
      vehicleName: "BMW M5 Series",
      vehicleMeta: "NYC-3560 · White",
      stops: [
        {
          id: "s1",
          title: "Transcorp Hilton",
          subtitle: "Main Entrance",
          time: "04:30 PM",
        },
        {
          id: "s2",
          title: "Jabi Lake Mall",
          subtitle: "Quick Stop",
          time: "04:52 PM",
        },
        {
          id: "s3",
          title: "Utako Bus Terminal",
          subtitle: "Pickup Guest",
          time: "05:08 PM",
        },
        {
          id: "s4",
          title: "Larchmont Hotel",
          subtitle: "Corporate HQ",
          time: "05:30 PM",
        },
      ],
      seatInfo: 1,
      schedule: "Today, Dec 11 04:30 PM",
      fare: "₦10,800",
    },
    {
      id: "upcoming-2",
      type: "history",
      driverName: "Chris A.",
      rating: "4.6",
      reviews: "864 reviews",
      vehicleName: "Range Rover Velar",
      vehicleMeta: "LOS-6601 · Silver",
      stops: [
        {
          id: "s1",
          title: "Lekki Phase 1",
          subtitle: "Pickup Point",
          time: "09:10 AM",
        },
        {
          id: "s2",
          title: "Ikoyi Club",
          subtitle: "Meeting Stop",
          time: "09:34 AM",
        },
        {
          id: "s3",
          title: "VI Marina",
          subtitle: "Final Dropoff",
          time: "09:58 AM",
        },
      ],
      seatInfo: 3,
      schedule: "Tomorrow, Dec 12 09:10 AM",
      fare: "₦12,200",
    },
  ],
  ongoing: [
    {
      id: "ongoing-1",
      type: "live",
      driverName: "David I.",
      stops: [
        {
          id: "s1",
          title: "Bobst Library",
          subtitle: "Branch Office North",
          time: "10:00 AM",
        },
        {
          id: "s2",
          title: "Broadway Junction",
          subtitle: "Passenger stop",
          time: "10:06 AM",
        },
        {
          id: "s3",
          title: "Larchmont Hotel",
          subtitle: "Corporate HQ",
          time: "10:14 AM",
        },
      ],
      fare: "₦8,000",
      showTrackRoute: true,
    },
  ],
  canceled: [
    {
      id: "canceled-1",
      type: "live",
      driverName: "David I.",
      stops: [
        {
          id: "s1",
          title: "Bobst Library",
          subtitle: "Branch Office North",
          time: "10:00 AM",
        },
        {
          id: "s2",
          title: "Larchmont Hotel",
          subtitle: "Corporate HQ",
          time: "10:08 AM",
        },
      ],
      fare: "₦8,000",
    },
    {
      id: "canceled-2",
      type: "live",
      driverName: "Chioma O.",
      stops: [
        {
          id: "s1",
          title: "Airport Road",
          subtitle: "Pickup Lobby",
          time: "06:45 PM",
        },
        {
          id: "s2",
          title: "Apo Resettlement",
          subtitle: "Dropoff Point",
          time: "07:22 PM",
        },
      ],
      fare: "₦6,200",
    },
  ],
};

function DriverHeader({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();

  return (
    <View style={styles.driverRow}>
      <View style={styles.driverIdentityRow}>
        <View style={[styles.avatarWrap, { backgroundColor: colors.border }]}>
          <MaterialCommunityIcons
            name="account"
            size={28}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.driverMeta}>
          <View style={styles.driverNameRow}>
            <Text variant="body" weight="medium">
              {ride.driverName}
            </Text>
            <View
              style={[
                styles.verifiedIconWrap,
                { backgroundColor: colors.brandBlue },
              ]}
            >
              <MaterialCommunityIcons
                name="check"
                size={12}
                color={colors.white}
              />
            </View>
          </View>
          <Text variant="bodySmall" color="secondary">
            Verified account
          </Text>
        </View>
      </View>

      {ride.type === "history" ? (
        <View style={styles.rightStat}>
          <View style={styles.ratingRow}>
            <MaterialCommunityIcons
              name="star"
              size={18}
              color={colors.primary}
            />
            <Text variant="bodySmall" weight="medium">
              {ride.rating}
            </Text>
          </View>
          <Text variant="caption" color="secondary">
            {ride.reviews}
          </Text>
        </View>
      ) : (
        <View style={styles.rightStat}>
          <Text variant="body" weight="medium">
            {ride.fare}
          </Text>
        </View>
      )}
    </View>
  );
}

function VehicleSection({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();

  if (ride.type !== "history") {
    return null;
  }

  return (
    <View style={styles.sectionRow}>
      <View style={styles.vehicleIconWrap}>
        <MaterialCommunityIcons
          name="car-sports"
          size={34}
          color={colors.textSecondary}
        />
      </View>
      <View>
        <Text variant="bodySmall" weight="medium">
          {ride.vehicleName}
        </Text>
        <Text variant="caption" color="secondary">
          {ride.vehicleMeta}
        </Text>
      </View>
    </View>
  );
}

function StopIcon({
  stopIndex,
  totalStops,
}: {
  stopIndex: number;
  totalStops: number;
}) {
  const { colors } = useTheme();

  if (stopIndex === 0) {
    return <LocationPinGreen size={24} color={colors.success} />;
  }

  if (stopIndex === totalStops - 1) {
    return <LocationPinRed size={24} color={colors.error} />;
  }

  return (
    <MaterialCommunityIcons
      name="map-marker"
      size={22}
      color={colors.primary}
    />
  );
}

function RouteSection({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();

  return (
    <View>
      {ride.stops.map((stop, index) => {
        const isLast = index === ride.stops.length - 1;

        return (
          <View key={stop.id}>
            <View style={styles.locationRow}>
              <View style={styles.pinColumn}>
                <StopIcon stopIndex={index} totalStops={ride.stops.length} />
              </View>
              <View style={styles.locationTextWrap}>
                <Text variant="body" weight="medium">
                  {stop.title}
                </Text>
                <Text variant="bodySmall" color="secondary">
                  {stop.subtitle}
                </Text>
              </View>
              <Text variant="bodySmall">{stop.time}</Text>
            </View>

            {!isLast ? (
              <View style={styles.connectorWrap}>
                <View style={styles.connectorDots}>
                  {Array.from({ length: 5 }).map((_, dotIndex) => (
                    <View
                      key={`${stop.id}-dot-${dotIndex}`}
                      style={[
                        styles.connectorDot,
                        { backgroundColor: colors.border },
                      ]}
                    />
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

function FooterSection({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();

  if (ride.type === "live") {
    if (!ride.showTrackRoute) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        title="Track Route"
        onPress={() => {}}
        style={{ borderWidth: 1, borderColor: colors.primary }}
      />
    );
  }

  return (
    <View>
      <View style={styles.footerTop}>
        <View style={styles.seatRow}>
          <MaterialCommunityIcons
            name="seat-passenger"
            size={16}
            color={colors.textPrimary}
          />
          <Text variant="bodySmall" weight="medium" color="primary">
            {ride.seatInfo} seat(s)
          </Text>
        </View>
        <View style={styles.rightStat}>
          <Text variant="body" size={"xxl"} weight="medium" color="primary">
            {ride.fare}
          </Text>
        </View>
      </View>
      <Text variant="caption" color="secondary">
        {ride.schedule}
      </Text>
    </View>
  );
}

function RideCard({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.rideCard, { backgroundColor: colors.surface }]}>
      <DriverHeader ride={ride} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <VehicleSection ride={ride} />
      {ride.type === "history" ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
      <RouteSection ride={ride} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <FooterSection ride={ride} />
    </View>
  );
}

export default function RidesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<RideTab>("upcoming");

  const rides = useMemo(() => ridesByTab[activeTab], [activeTab]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text variant="h2" weight="medium" style={styles.title}>
        Rides
      </Text>

      <View style={styles.searchInputWrap}>
        <TextInput
          placeholder="Search"
          leftIcon={<SearchIcon size={20} color={colors.textPrimary} />}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={[styles.segmentWrap, { backgroundColor: colors.surface }]}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.segmentButton,
                active && { backgroundColor: colors.textPrimary },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                variant="bodySmall"
                weight={active ? "medium" : "regular"}
                color={active ? "inverse" : "secondary"}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + spacing.xxxxl,
          gap: spacing.lg,
        }}
      >
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 26,
  },
  searchInputWrap: {
    marginBottom: 8,
  },

  segmentWrap: {
    borderRadius: borderRadius.full,
    padding: 4,
    flexDirection: "row",
    marginBottom: spacing.lg,
  },
  segmentButton: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  rideCard: {
    borderRadius: 26,
    padding: 16,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  driverIdentityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatarWrap: {
    width: 50,
    height: 50,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  driverMeta: {
    gap: 2,
  },
  driverNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  verifiedIconWrap: {
    width: 14,
    height: 14,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  rightStat: {
    alignItems: "flex-end",
    gap: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  vehicleIconWrap: {
    width: 50,
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pinColumn: {
    width: 30,
    alignItems: "center",
  },
  locationTextWrap: {
    flex: 1,
    marginLeft: 12,
    gap: 2,
  },
  connectorWrap: {
    marginTop: -16,
    height: 40,
    width: 30,
    justifyContent: "center",
  },
  connectorDots: {
    height: "100%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
  },
  connectorDot: {
    width: 2,
    height: 4,
    borderRadius: 1,
  },
  footerTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  trackButton: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});

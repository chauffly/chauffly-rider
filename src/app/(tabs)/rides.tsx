import { useMemo, useState } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { Text } from "@/components/common/text";
import { TextInput } from "@/components/common/text-input";
import LocationPinGreen from "@/components/svg/LocationPinGreen";
import LocationPinRed from "@/components/svg/LocationPinRed";
import SearchIcon from "@/components/svg/SearchIcon";
import { borderRadius, spacing } from "@/constants/spacing";
import { useTheme } from "@/context/theme-context";
import { Button } from "@/components/common/button";
import { localJsonApi, RideTabKey } from "@/api/local-json-api";

const rideTabs = localJsonApi.getRideTabs();

type RideItem = ReturnType<typeof localJsonApi.getRidesByTab>[number];

function DriverHeader({ ride }: { ride: RideItem }) {
  const { colors } = useTheme();
  const uiDefaults = localJsonApi.getUiDefaults();

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
            {uiDefaults.rides.verified_account_label}
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
                  {Array.from({ length: 3 }).map((_, dotIndex) => (
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
  const uiDefaults = localJsonApi.getUiDefaults();

  if (ride.type === "live") {
    if (!ride.showTrackRoute) {
      return null;
    }

    return (
      <Button
        variant="ghost"
        title={uiDefaults.rides.track_route_label}
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

const TAB_TO_STATUS: Record<RideTabKey, string> = {
  past: "Completed",
  upcoming: "Scheduled",
  ongoing: "Ongoing",
  canceled: "Cancelled",
};

function RideCard({ ride, activeTab }: { ride: RideItem; activeTab: RideTabKey }) {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    const rideParams = {
      driverId: ride.driverId,
      fare: ride.fare,
      stops: JSON.stringify(ride.stops),
      vehicleName: ride.vehicleName || '',
      schedule: ride.schedule || '',
    };

    if (activeTab === "upcoming") {
      router.push({
        pathname: "/booking/schedule-detail",
        params: rideParams,
      });
    } else {
      router.push({
        pathname: "/booking/ride-detail",
        params: {
          ...rideParams,
          rideStatus: TAB_TO_STATUS[activeTab],
        },
      });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.rideCard, { backgroundColor: colors.surface }]}
    >
      <DriverHeader ride={ride} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <VehicleSection ride={ride} />
      {ride.type === "history" ? (
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
      ) : null}
      <RouteSection ride={ride} />
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      <FooterSection ride={ride} />
    </Pressable>
  );
}

export default function RidesScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<RideTabKey>("upcoming");
  const uiDefaults = localJsonApi.getUiDefaults();

  const rides = useMemo(
    () => localJsonApi.getRidesByTab(activeTab),
    [activeTab],
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top + 24 },
      ]}
    >
      <Text variant="h2" weight="medium" style={styles.title}>
        {uiDefaults.rides.screen_title}
      </Text>

      <View style={styles.searchInputWrap}>
        <TextInput
          placeholder={uiDefaults.rides.search_placeholder}
          leftIcon={<SearchIcon size={20} color={colors.textPrimary} />}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={[styles.segmentWrap, { backgroundColor: colors.surface }]}>
        {rideTabs.map((tab) => {
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
          <RideCard key={ride.id} ride={ride} activeTab={activeTab} />
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
    gap: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  vehicleIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  pinColumn: {
    width: 24,
    alignItems: "center",
    paddingTop: 2,
  },
  locationTextWrap: {
    flex: 1,
    gap: 2,
  },
  connectorWrap: {
    marginLeft: 12,
    marginVertical: 4,
    marginTop: -10,
  },
  connectorDots: {
    gap: 3,
    paddingVertical: 2,
  },
  connectorDot: {
    width: 2,
    height: 8,
    borderRadius: 2,
  },
  footerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  seatRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

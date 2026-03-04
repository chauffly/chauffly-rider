import { StyleSheet, View, Pressable, Linking, Modal, TextInput } from 'react-native';
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from "@/components/common/text";
import ChevronLeft from '@/components/svg/ChevronLeft';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { localJsonApi } from '@/api/local-json-api';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

export default function DriverAcceptsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    originName?: string;
    originAddress?: string;
    destinations?: string;
    selectedRideId?: string;
    pickupDate?: string;
    pickupTime?: string;
    estimatedDurationMinutes?: string;
    distanceKm?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
  }>();
  const apiDriver = localJsonApi.getPrimaryDriver();
  const driverName = params.driverName || apiDriver.display_name;
  const driverPhone = params.driverPhone || apiDriver.phone_number;
  const driverRating = params.driverRating || apiDriver.rating.toFixed(1);
  const driverVehicle = params.driverVehicle || apiDriver.vehicle.display_name;

  const [rideArrivalState, setRideArrivalState] = useState<
    "accepted" | "heading" | "arrived"
  >("accepted");
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");

  useEffect(() => {
    // TODO: Replace timer-based state simulation with backend/socket ride status events.
    const toHeading = setTimeout(() => {
      setRideArrivalState("heading");
    }, 1800);

    const toArrived = setTimeout(() => {
      setRideArrivalState("arrived");
    }, 5000);

    return () => {
      clearTimeout(toHeading);
      clearTimeout(toArrived);
    };
  }, []);

  useEffect(() => {
    if (rideArrivalState !== "arrived") {
      return;
    }

    setShowPinModal(true);
  }, [rideArrivalState]);

  const handlePinConfirm = () => {
    if (!pin.trim()) {
      return;
    }

    setShowPinModal(false);
    setPin("");
    router.push({
      pathname: "/booking/heading-destination",
      params,
    });
  };

  const statusTitle =
    rideArrivalState === "accepted"
      ? t("booking.chauffeur_accepts_ride")
      : rideArrivalState === "heading"
        ? t("booking.driver_heading_to_location")
        : t("booking.chauffeur_has_arrived");

  const statusSubtitle =
    rideArrivalState === "accepted"
      ? t("booking.driver_assigned_later_note")
      : rideArrivalState === "heading"
        ? t("booking.arriving_in_one_minute")
        : t("booking.arrival_waiting_note");

  const handleCallDriver = async () => {
    const sanitizedPhone = driverPhone.replace(
      /[^0-9+]/g,
      "",
    );
    const phoneUrl = `tel:${sanitizedPhone}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    }
  };

  const openDriverChat = () => {
    router.push({
      pathname: "/booking/message-driver",
      params,
    });
  };

  const openDriverInfo = () => {
    router.push({
      pathname: "/booking/driver-info",
      params,
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION}>
        <Marker coordinate={{ latitude: 9.18, longitude: 7.55 }}>
          <View style={[styles.marker, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons
              name="car"
              size={18}
              color={colors.textInverse}
            />
          </View>
        </Marker>
        <Polyline
          coordinates={[
            { latitude: 9.18, longitude: 7.55 },
            { latitude: 9.11, longitude: 7.52 },
          ]}
          strokeColor={colors.primary}
          strokeWidth={4}
        />
      </MapView>

      <Pressable
        onPress={() => router.back()}
        style={[
          styles.backButton,
          {
            top: insets.top + spacing.md,
            backgroundColor: colors.surface,
            shadowColor: colors.textPrimary,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={t("common.cancel")}
      >
        <ChevronLeft size={24} color={colors.textPrimary} />
      </Pressable>

      <View
        style={[
          styles.bottomCard,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.lg,
            shadowColor: colors.textPrimary,
          },
        ]}
      >
        <Text variant="h3" font="medium" style={styles.statusTitle}>
          {statusTitle}
        </Text>
        <Text variant="body" color="muted" style={styles.statusSubtitle}>
          {statusSubtitle}
        </Text>
        <Text variant="body" style={styles.vehicleText}>
          {driverVehicle}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable style={styles.driverRow} onPress={openDriverInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <MaterialCommunityIcons
              name="account"
              size={28}
              color={colors.textSecondary}
            />
          </View>
          <View style={styles.driverInfo}>
            <Text variant="body" font="medium">
              {driverName}
            </Text>
            <View style={styles.ratingRow}>
              <MaterialCommunityIcons
                name="star"
                size={14}
                color={colors.primary}
              />
              <Text variant="bodySmall" color="muted">
                {driverRating}
              </Text>
              <Text variant="bodySmall" color="muted">
                {driverPhone}
              </Text>
            </View>
          </View>
          <View style={styles.actionIcons}>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel={t("booking.message_driver")}
              onPress={(event) => {
                event.stopPropagation();
                openDriverChat();
              }}
            >
              <MaterialCommunityIcons
                name="message-text-outline"
                size={20}
                color={colors.primary}
              />
            </Pressable>
            <Pressable
              style={[styles.iconButton, { backgroundColor: colors.accent }]}
              accessibilityRole="button"
              accessibilityLabel={t("booking.call_driver")}
              onPress={async (event) => {
                event.stopPropagation();
                await handleCallDriver();
              }}
            >
              <MaterialCommunityIcons
                name="phone-outline"
                size={20}
                color={colors.primary}
              />
            </Pressable>
          </View>
        </Pressable>

        {/* <View style={styles.footerButtons}>
          <Button translationKey="common.back" variant="outline" style={styles.footerButton} onPress={() => router.back()} />
          <Button translationKey="booking.view_rides" style={styles.footerButton} onPress={() => router.push('/(tabs)/rides')} />
        </View> */}
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={showPinModal}
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalCard, { backgroundColor: colors.surface }]}
          >
            <Text variant="h3" weight="semiBold" align="center">
              {t('booking.enter_pin_title')}
            </Text>

            <Text variant="body" weight="medium" style={styles.pinLabel}>
              {t('booking.verify_pin_label')}
            </Text>

            <TextInput
              style={[
                styles.pinInput,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              placeholder={t('booking.enter_pin_placeholder')}
              placeholderTextColor={colors.textSecondary}
              value={pin}
              onChangeText={setPin}
              keyboardType="number-pad"
            />

            <Pressable
              style={[
                styles.pinConfirmButton,
                {
                  backgroundColor: pin.trim() ? colors.buttonPrimary : colors.border,
                },
              ]}
              onPress={handlePinConfirm}
              disabled={!pin.trim()}
            >
              <Text variant="body" weight="medium" color="inverse">
                {t('booking.confirm_passenger')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  marker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomCard: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  statusTitle: {
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  statusSubtitle: {
    textAlign: "center",
  },
  vehicleText: {
    textAlign: "center",
    marginTop: spacing.sm,
  },
  driverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  driverInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  actionIcons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  footerButtons: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  footerButton: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  pinLabel: {
    marginTop: spacing.sm,
  },
  pinInput: {
    borderWidth: 1,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    fontSize: 16,
  },
  pinConfirmButton: {
    marginTop: spacing.md,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
});

import { useEffect } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';

const DEFAULT_REGION = {
  latitude: 9.0579,
  longitude: 7.4951,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

export default function HeadingDestinationScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    originName?: string;
    destinations?: string;
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
    selectedRideId?: string;
  }>();

  useEffect(() => {
    // TODO: Replace timer-based progression with backend trip status updates.
    const timer = setTimeout(() => {
      router.push({
        pathname: '/booking/trip-arrived',
        params,
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [router, params]);

  const handleCallDriver = async () => {
    const driverPhone = (params.driverPhone || '0800000000').replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${driverPhone}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    }
  };

  const openDriverChat = () => {
    router.push({
      pathname: '/booking/message-driver',
      params,
    });
  };

  const openDriverInfo = () => {
    router.push({
      pathname: '/booking/driver-info',
      params,
    });
  };

  return (
    <View style={styles.container}>
      <MapView style={styles.map} initialRegion={DEFAULT_REGION}>
        <Marker coordinate={{ latitude: 9.22, longitude: 7.45 }}>
          <MaterialCommunityIcons name="car" size={24} color={colors.textPrimary} />
        </Marker>

        <Polyline
          coordinates={[
            { latitude: 9.22, longitude: 7.45 },
            { latitude: 9.18, longitude: 7.47 },
            { latitude: 9.17, longitude: 7.53 },
            { latitude: 9.12, longitude: 7.52 },
          ]}
          strokeColor={colors.primary}
          strokeWidth={6}
        />
      </MapView>

      <Pressable
        onPress={() => router.back()}
        style={[styles.floatingButton, styles.leftButton, { top: insets.top + spacing.xxxxl, backgroundColor: colors.surface }]}
      >
        <MaterialCommunityIcons name="chevron-left" size={24} color={colors.textPrimary} />
      </Pressable>

      <View
        style={[
          styles.floatingButton,
          styles.rightButton,
          { bottom: 420, backgroundColor: colors.surface },
        ]}
      >
        <MaterialCommunityIcons name="crosshairs-gps" size={24} color={colors.textPrimary} />
      </View>

      <View style={[styles.bottomCard, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.lg }]}> 
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text variant="h3" weight="medium" align="center">
          Heading to destination...
        </Text>
        <Text variant="bodySmall" color="muted" align="center" style={styles.subtitle}>
          Will arrive at the destination in 3 min..
        </Text>
        <Text variant="body" align="center" style={styles.vehicleText}>
          {params.driverVehicle || 'Mercedes Benz e350 2019, Black'}
        </Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <Pressable style={styles.driverRow} onPress={openDriverInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.border }]}>
            <MaterialCommunityIcons name="account" size={28} color={colors.textSecondary} />
          </View>

          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text variant="body" weight="medium">{params.driverName }</Text> 
                <MaterialCommunityIcons name="check-decagram" size={18} color={colors.brandBlue} />
 
            </View>

            <View style={styles.metaRow}>
              <MaterialCommunityIcons name="star" size={14} color={colors.primary} />
              <Text variant="bodySmall">{params.driverRating || '4.5'}</Text>
              <Text variant="bodySmall" color="muted">{params.driverPhone}</Text>
            </View>
          </View>

           <View style={styles.actionIcons}>
                     <Pressable
                       style={[styles.iconButton, { backgroundColor: colors.accent }]}
                       accessibilityRole="button"
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
      </View>
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
  floatingButton: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  leftButton: {
    left: spacing.lg,
  },
  rightButton: {
    right: spacing.lg,
  },
  bottomCard: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  handle: {
    width: 74,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  subtitle: {
    marginTop: spacing.sm,
  },
  vehicleText: {
    marginTop: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  verified: {
    width: 16,
    height: 16,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});

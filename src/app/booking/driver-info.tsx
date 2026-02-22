import { Linking, Pressable, StyleSheet, View, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { spacing, borderRadius } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { localJsonApi } from '@/api/local-json-api';

export default function DriverInfoScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    driverName?: string;
    driverPhone?: string;
    driverRating?: string;
    driverVehicle?: string;
  }>();
  const apiDriver = localJsonApi.getPrimaryDriver();

  const driverName = params.driverName || apiDriver.display_name;
  const driverPhone = params.driverPhone || apiDriver.phone_number;
  const driverRating = params.driverRating || apiDriver.rating.toFixed(1);
  const vehicleName = params.driverVehicle || apiDriver.vehicle.display_name;

  const handleCallDriver = async () => {
    const cleanPhone = driverPhone.replace(/[^0-9+]/g, '');
    const phoneUrl = `tel:${cleanPhone}`;
    const supported = await Linking.canOpenURL(phoneUrl);
    if (supported) {
      await Linking.openURL(phoneUrl);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md }]}> 
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.headerIcon}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" weight="medium">Driver Information</Text>
        <View style={styles.headerIcon} />
      </View>

      <View style={[styles.mainCard, { backgroundColor: colors.surface }]}> 
        <Image source={require('../../../assets/images/avatar.png')} style={styles.avatar} />
        <Text variant="h2" weight="medium" style={styles.mtMd}>{driverName}</Text>
        <Text variant="body" color="muted">{driverPhone}</Text>

        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <View style={styles.metricInline}>
              <MaterialCommunityIcons name="star" size={18} color={colors.primary} />
              <Text variant="body" weight="medium">{driverRating}</Text>
            </View>
            <Text variant="body" color="muted">Rating</Text>
          </View>
          <View style={styles.metricItem}>
            <Text variant="body" weight="medium">{apiDriver.trips_completed}</Text>
            <Text variant="body" color="muted">Trips</Text>
          </View>
        </View>
      </View>

      <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}> 
        <View style={styles.detailRow}>
          <Text variant="body" color="muted">Member Since</Text>
          <Text variant="body" weight="medium">{apiDriver.member_since}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="body" color="muted">Car Model</Text>
          <Text variant="body" weight="medium">{vehicleName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="body" color="muted">Color</Text>
          <Text variant="body" weight="medium">{apiDriver.vehicle.color}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text variant="body" color="muted">Plate Number</Text>
          <Text variant="body" weight="medium">{apiDriver.vehicle.plate_number}</Text>
        </View>
      </View>

      <View style={[styles.footerRow, { backgroundColor: colors.surface, paddingBottom: insets.bottom + spacing.sm }]}> 
        <Button
          title="Call"
          variant="outline"
          fullWidth
          onPress={handleCallDriver}
          style={styles.footerButton}
          textStyle={{ color: colors.primary }}
        />
        <Button
          title="Chat"
          fullWidth
          navigateTo="/booking/message-driver"
          navigateParams={params}
          style={styles.footerButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerIcon: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainCard: {
    borderRadius: 28,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  mtMd: {
    marginTop: spacing.md,
  },
  metricsRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.xl,
  },
  metricItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  metricInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailsCard: {
    borderRadius: 28,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: spacing.md,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  footerButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: borderRadius.full,
  },
});

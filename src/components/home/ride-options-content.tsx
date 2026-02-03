import { StyleSheet, View, Pressable, ScrollView } from 'react-native';
import { Image as ExpoImage } from 'expo-image';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import Check from '@/components/svg/Check';
import Schedule from '@/components/svg/Schedule';
import { borderRadius, spacing } from '@/constants/spacing';
import { useTheme } from '@/context/theme-context';
import { RideOption } from './types';

interface RideOptionsContentProps {
  rideOptions: RideOption[];
  selectedRideId: string;
  onSelectRide: (id: string) => void;
  onProceed?: () => void;
}

export function RideOptionsContent({
  rideOptions,
  selectedRideId,
  onSelectRide,
  onProceed,
}: RideOptionsContentProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.rideOptionsContainer}>
      <View style={styles.rideOptionsHeader}>
        <View>
          <Text variant="h3" font="medium">
            Choose a ride
          </Text>
          <Text variant="caption" color="muted">
            Prices are estimates
          </Text>
        </View>
        <View style={[styles.etaPill, { backgroundColor: colors.accent }]}>
          <Text variant="caption" color="muted">
            3 min away
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.rideOptionsList}
      >
        {rideOptions.map((option) => {
          const isSelected = option.id === selectedRideId;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelectRide(option.id)}
              style={[
                styles.rideOptionCard,
                {
                  borderColor: isSelected ? colors.primary : colors.border,
                  backgroundColor: isSelected ? colors.accent : colors.surface, 
                },
              ]}
            >
              <View
                style={[
                  styles.rideOptionImageWrap,
                  { backgroundColor: isSelected ? colors.surface : '#F2F2F2' },
                ]}
              >
                <ExpoImage
                  source={option.image}
                  style={styles.rideOptionImage}
                  contentFit="contain"
                />
              </View>
              <View style={styles.rideOptionInfo}>
                <View style={styles.rideOptionTopRow}>
                  <Text variant="body" font="medium" numberOfLines={1}>
                    {option.name}
                  </Text>
                  {isSelected && (
                    <View style={styles.rideOptionCheck}>
                      <Check />
                    </View>
                  )}
                </View>
                <Text variant="caption" color="muted" numberOfLines={1}>
                  {option.subtitle}
                </Text>
              </View>
              <View style={styles.rideOptionPriceWrap}>
                <Text variant="body" font="medium">
                  {option.price}
                </Text>
                <Text variant="caption" color="muted">
                  2-4 min
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.paymentRow}>
        <Text variant="body" font="medium">
          Payment
        </Text>
        <View style={styles.paymentMethod}>
          <ExpoImage
            source={require('../../../assets/images/master-card.png')}
            style={{ width: 32, height: 24 }}
            contentFit="contain"
          />
          <Text variant="bodySmall" weight="medium">
            **** 9948
          </Text>
        </View>
      </View>

      <View style={styles.proceedRow}>
        <Button title="Proceed" style={styles.proceedButton} onPress={onProceed} />
        <Pressable style={[styles.walletButton, { backgroundColor: colors.primary }]}>
          <Schedule />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  rideOptionsContainer: {
    flex: 1,
  },
  rideOptionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  etaPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  rideOptionsList: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  rideOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 4,
  },
  rideOptionImageWrap: {
    width: 54,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  rideOptionImage: {
    width:45,
    height:45,
  },
  rideOptionInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  rideOptionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  rideOptionPriceWrap: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rideOptionCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(49, 141, 91, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  proceedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  proceedButton: {
    flex: 1,
  },
  walletButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

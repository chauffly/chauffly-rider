import { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  FlatList,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { Text } from '@/components/common/text';
import { Button } from '@/components/common/button';
import { LocationInput } from '@/components/common/location-input';
import { LocationHistoryItem } from '@/components/common/location-history-item';
import { BottomSheet } from '@/components/common/bottom-sheet';
import { Divider } from '@/components/ui/divider';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { useLocation, LocationCoordinates } from '@/context/location-context';
import { borderRadius, spacing } from "@/constants/spacing";
import {
  locationHistoryService,
  LocationHistoryItem as HistoryItemType,
} from '@/services/location-history';
import {
  googlePlacesService,
  PlacePrediction,
} from '@/services/google-places';
import CloseIcon from '@/components/svg/CloseIcon';
import PlusCircle from '@/components/svg/PlusCircle';
import LocationPinGreen from '@/components/svg/LocationPinGreen';
import LocationPinRed from '@/components/svg/LocationPinRed';

interface RouteStop {
  id: string;
  name: string;
  address: string;
  coordinates: LocationCoordinates;
}

export default function YourRouteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    editMode?: string;
    originName?: string;
    originAddress?: string;
    originLat?: string;
    originLng?: string;
    destinations?: string;
    focusIndex?: string;
    destinationName?: string;
    destinationAddress?: string;
    destinationLat?: string;
    destinationLng?: string;
  }>();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { currentLocation } = useLocation();

  const [origin, setOrigin] = useState<RouteStop | null>(null);
  const [destinations, setDestinations] = useState<RouteStop[]>([]);
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlacePrediction[]>([]);
  const [locationHistory, setLocationHistory] = useState<HistoryItemType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Handle edit mode - load existing route data
  useEffect(() => {
    if (params.editMode === 'true' && params.originLat && params.originLng) {
      // Load origin from params
      setOrigin({
        id: 'origin',
        name: params.originName || '',
        address: params.originAddress || '',
        coordinates: {
          latitude: parseFloat(params.originLat),
          longitude: parseFloat(params.originLng),
        },
      });

      // Load destinations from params
      if (params.destinations) {
        try {
          const loadedDestinations = JSON.parse(params.destinations);
          setDestinations(loadedDestinations);

          // Focus on the specified index (last destination by default)
          if (params.focusIndex) {
            setActiveInputIndex(parseInt(params.focusIndex));
          }
        } catch (error) {
          console.error('Error parsing destinations:', error);
        }
      }
    }
  }, [params.editMode, params.originLat, params.originLng, params.destinations, params.focusIndex]);

  // Auto-focus last destination input when screen opens (non-edit mode)
  useEffect(() => {
    if (params.editMode !== 'true' && destinations.length === 0) {
      // Focus on first destination input
      setActiveInputIndex(0);
    }
  }, []);

  const inputRef = useRef<TextInput>(null);

  // Focus input when activeInputIndex changes
  useEffect(() => {
    if (activeInputIndex !== null) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeInputIndex]);

  const loadLocationHistory = useCallback(async () => {
    const history = await locationHistoryService.getHistory();
    const historyWithDistance = history.map((item) => {
      if (currentLocation) {
        const distance = locationHistoryService.calculateDistance(
          currentLocation.coordinates,
          item.coordinates
        );
        return {
          ...item,
          distance,
        };
      }
      return item;
    });
    setLocationHistory(historyWithDistance);
  }, [currentLocation]);

  const searchPlaces = useCallback(
    async (query: string) => {
      console.log('🔍 Searching for:', query);
      setIsSearching(true);
      const results = await googlePlacesService.autocomplete(
        query,
        currentLocation?.coordinates
      );
      console.log('📍 Search results:', results.length, 'places found');
      setSearchResults(results);
      setIsSearching(false);
    },
    [currentLocation]
  );

  useEffect(() => {
    if (currentLocation && !origin) {
      setOrigin({
        id: 'current',
        name: t('location.your_current_location'),
        address: currentLocation.address,
        coordinates: currentLocation.coordinates,
      });
    }
  }, [currentLocation, t, origin]);

  useEffect(() => {
    // Only handle single destination param if NOT in edit mode
    if (params.editMode !== 'true' && params.destinationName && params.destinationLat && params.destinationLng) {
      const destination: RouteStop = {
        id: `dest_${Date.now()}`,
        name: params.destinationName,
        address: params.destinationAddress || '',
        coordinates: {
          latitude: parseFloat(params.destinationLat),
          longitude: parseFloat(params.destinationLng),
        },
      };
      setDestinations([destination]);
    }
  }, [params.editMode, params.destinationName, params.destinationLat, params.destinationLng, params.destinationAddress]);

  useEffect(() => {
    loadLocationHistory();
  }, [loadLocationHistory]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchPlaces(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, searchPlaces]);

  const handleClose = () => {
    // Reset all state to initial values
    setOrigin(currentLocation ? {
      id: 'current',
      name: t('location.your_current_location'),
      address: currentLocation.address,
      coordinates: currentLocation.coordinates,
    } : null);
    setDestinations([]);
    setActiveInputIndex(0);
    setSearchQuery('');
    setSearchResults([]);
    setShowActionSheet(false);
    router.back();
  };

  const handleInputFocus = (index: number) => {
    setActiveInputIndex(index);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleSelectPlace = async (prediction: PlacePrediction) => {
    const details = await googlePlacesService.getPlaceDetails(prediction.placeId);
    if (details) {
      const stop: RouteStop = {
        id: `stop_${Date.now()}`,
        name: details.name,
        address: details.address,
        coordinates: details.coordinates,
      };

      await locationHistoryService.addToHistory({
        name: details.name,
        address: details.address,
        coordinates: details.coordinates,
      });

      handleStopSelected(stop);
    }
  };

  const handleSelectHistoryItem = async (item: HistoryItemType) => {
    const stop: RouteStop = {
      id: `stop_${Date.now()}`,
      name: item.name,
      address: item.address,
      coordinates: item.coordinates,
    };

    await locationHistoryService.addToHistory({
      name: item.name,
      address: item.address,
      coordinates: item.coordinates,
    });

    handleStopSelected(stop);
  };

  const handleStopSelected = (stop: RouteStop) => {
    Keyboard.dismiss();
    setSearchQuery('');
    setSearchResults([]);

    // If editing origin
    if (activeInputIndex === -1) {
      setOrigin(stop);
      setActiveInputIndex(null);
      return;
    }

    // If editing existing destination or adding new one
    if (activeInputIndex !== null && activeInputIndex >= 0) {
      let updatedDestinations: RouteStop[];
      if (activeInputIndex < destinations.length) {
        // Editing existing destination - update it
        updatedDestinations = [...destinations];
        updatedDestinations[activeInputIndex] = stop;
      } else {
        // Adding new destination
        updatedDestinations = [...destinations, stop];
      }
      setDestinations(updatedDestinations);
      setActiveInputIndex(null);

      // Show action sheet to ask if they want to add more stops or continue
      setShowActionSheet(true);
    }
  };

  const handleAddAnotherStop = () => {
    setShowActionSheet(false);
    // Set active index to next destination slot
    setActiveInputIndex(destinations.length);
  };

  const handleContinue = () => {
    setShowActionSheet(false);
    navigateToSetLocation();
  };

  const navigateToSetLocation = () => {
    if (origin && destinations.length > 0) {
      Keyboard.dismiss();
      router.push({
        pathname: '/(tabs)',
        params: {
          viewMode: 'set-location',
          originName: origin.name,
          originAddress: origin.address,
          originLat: origin.coordinates.latitude.toString(),
          originLng: origin.coordinates.longitude.toString(),
          destinations: JSON.stringify(destinations),
        },
      });
    }
  };

  const handleKeyboardDone = () => {
    if (origin && destinations.length > 0) {
      navigateToSetLocation();
    } else {
      Keyboard.dismiss();
    }
  };

  const handleAddStop = () => {
    setActiveInputIndex(destinations.length);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveDestination = (index: number) => {
    const newDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(newDestinations);
  };

  const handleTogglePin = async (id: string) => {
    await locationHistoryService.togglePin(id);
    await loadLocationHistory();
  };

  const renderLocationList = () => {
    if (searchQuery.length >= 2) {
      return (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.placeId}
          style={styles.listContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <Divider />}
          renderItem={({ item }) => (
            <LocationHistoryItem
              name={item.mainText}
              address={item.secondaryText}
              onPress={() => handleSelectPlace(item)}
            />
          )}
          ListEmptyComponent={
            !isSearching ? (
              <View style={styles.emptyState}>
                <Text variant="body" color="muted" align="center">
                  {t('location.no_results')}
                </Text>
              </View>
            ) : null
          }
        />
      );
    }

    return (
      <FlatList
        data={locationHistory}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        renderItem={({ item }) => (
          <LocationHistoryItem
            name={item.name}
            timestamp={item.timestamp}
            distance={
              item.distance
                ? locationHistoryService.formatDistance(item.distance)
                : undefined
            }
            isPinned={item.isPinned}
            onPress={() => handleSelectHistoryItem(item)}
            onPinPress={() => handleTogglePin(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text variant="body" color="muted" align="center">
              {t('location.no_recent_locations')}
            </Text>
          </View>
        }
      />
    );
  };

  // Check if we're adding a new destination (activeInputIndex equals destinations.length)
  const isAddingNewDestination = activeInputIndex !== null &&
    activeInputIndex >= 0 &&
    activeInputIndex >= destinations.length;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Pressable onPress={handleClose} style={styles.closeButton}>
          <CloseIcon size={24} color={colors.textPrimary} />
        </Pressable>
        <Text variant="h3" font="medium" translationKey="location.your_route" />
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={handleContinue}
          disabled={!origin || destinations.length === 0}
          style={({ pressed }) => [
            styles.continueButton,
            {
              backgroundColor: colors.primary,
              borderColor: colors.primary,
              opacity:
                !origin || destinations.length === 0 ? 0.4 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text variant="bodySmall" weight="semiBold" color="inverse">
            Continue
          </Text>
        </Pressable>
      </View>

      <View style={[styles.inputsContainer, { borderColor: colors.border }]}>
        {/* Origin Input */}
        <View style={styles.inputWrapper}>
          <View
            style={[styles.routeLine, { backgroundColor: colors.border }]}
          />
          <LocationInput
            type="origin"
            leftIcon={<LocationPinGreen size={20} />}
            style={{
              borderWidth: 0,
              backgroundColor: "transparent",
              paddingHorizontal: 0,
            }}
            value={activeInputIndex === -1 ? searchQuery : undefined}
            displayValue={activeInputIndex === -1 ? undefined : origin?.name}
            placeholderKey="location.your_current_location"
            onPress={
              activeInputIndex !== -1 ? () => handleInputFocus(-1) : undefined
            }
            onChangeText={
              activeInputIndex === -1 ? handleSearchChange : undefined
            }
            isEditable={activeInputIndex === -1}
            ref={activeInputIndex === -1 ? inputRef : undefined}
            returnKeyType="done"
            onSubmitEditing={handleKeyboardDone}
          />
        </View>

        <Divider marginHorizontal={spacing.xs} />

        {/* Existing Destinations */}
        {destinations.map((dest, index) => (
          <View key={dest.id} style={styles.inputWrapper}>
            <LocationInput
              type="destination"
              leftIcon={<LocationPinRed size={20} />}
              style={{
                borderWidth: 0,
                backgroundColor: "transparent",
                paddingHorizontal: 0,
              }}
              value={activeInputIndex === index ? searchQuery : undefined}
              displayValue={activeInputIndex === index ? undefined : dest.name}
              placeholderKey="location.where_to"
              onPress={
                activeInputIndex !== index
                  ? () => handleInputFocus(index)
                  : undefined
              }
              onChangeText={
                activeInputIndex === index ? handleSearchChange : undefined
              }
              isEditable={activeInputIndex === index}
              ref={activeInputIndex === index ? inputRef : undefined}
              rightIcon={
                activeInputIndex !== index ? (
                  destinations.length > 1 ? (
                    <CloseIcon size={20} color={colors.textSecondary} />
                  ) : index === destinations.length - 1 ? (
                    <PlusCircle size={24} color={colors.primary} />
                  ) : undefined
                ) : undefined
              }
              onRightIconPress={
                destinations.length > 1
                  ? () => handleRemoveDestination(index)
                  : index === destinations.length - 1
                    ? handleAddStop
                    : undefined
              }
              returnKeyType="done"
              onSubmitEditing={handleKeyboardDone}
            />
          </View>
        ))}

        {/* New Destination Input - shown when no destinations or adding a new stop */}
        {(destinations.length === 0 || isAddingNewDestination) && (
          <View style={styles.inputWrapper}>
            <LocationInput
              type="destination"
              leftIcon={<LocationPinRed size={20} />}
              style={{
                borderWidth: 0,
                backgroundColor: "transparent",
                paddingHorizontal: 0,
              }}
              value={
                activeInputIndex !== null && activeInputIndex >= 0
                  ? searchQuery
                  : ""
              }
              placeholderKey="location.where_to"
              onPress={
                activeInputIndex === null || activeInputIndex === -1
                  ? () => handleInputFocus(destinations.length)
                  : undefined
              }
              onChangeText={
                activeInputIndex !== null && activeInputIndex >= 0
                  ? handleSearchChange
                  : undefined
              }
              isEditable={activeInputIndex !== null && activeInputIndex >= 0}
              ref={
                activeInputIndex !== null && activeInputIndex >= 0
                  ? inputRef
                  : undefined
              }
              returnKeyType="done"
              onSubmitEditing={handleKeyboardDone}
            />
          </View>
        )}
      </View>

      {renderLocationList()}

      {/* Action Sheet for Add Stop or Continue */}
      <BottomSheet
        visible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        maxHeight={200}
      >
        <View style={styles.actionSheetContent}>
          <Text variant="h3" font="medium" style={styles.actionSheetTitle}>
            {t("location.destination_added")}
          </Text>
          <Text variant="body" color="muted" style={styles.actionSheetSubtitle}>
            {t("location.add_more_stops_question")}
          </Text>

          <View style={styles.actionButtons}>
            <Button
              translationKey="location.add_another_stop"
              variant="outline"
              size="sm"
              onPress={handleAddAnotherStop}
              style={styles.actionButton}
            />
            <Button
              translationKey="location.continue_booking"
              variant="primary"
              size="sm"
              onPress={handleContinue}
              style={styles.actionButton}
            />
          </View>
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  closeButton: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  headerSpacer: {
    flex: 1,
  },
  continueButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  inputsContainer: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    borderWidth: 1,
    borderRadius: spacing.xxl,
    margin: spacing.lg,
  },
  inputWrapper: {
    position: "relative",
  },
  routeLine: {
    position: "absolute",
    left: 22,
    top: 52,
    width: 2,
    height: spacing.md,
    zIndex: -1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  emptyState: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  actionSheetContent: {
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  actionSheetTitle: {
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  actionSheetSubtitle: {
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  actionButtons: {
    flexDirection: "row",
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});

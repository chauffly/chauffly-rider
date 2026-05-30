import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import {
  useCreateSavedAddress,
  useDeleteSavedAddress,
  useSavedAddresses,
  useToggleSavedAddressPin,
  useUpdateSavedAddress
} from '@/api-client';
import { Text } from '@/components/common/text';
import { TextInput } from '@/components/common/text-input';
import { Button } from '@/components/common/button';
import { BottomSheet } from '@/components/common/bottom-sheet';
import { useTheme } from '@/context/theme-context';
import { useTranslation } from '@/context/language-context';
import { borderRadius, spacing } from '@/constants/spacing';
import { StackHeader } from '@/components/common/stack-header';
import { googlePlacesService, PlacePrediction } from '@/services/google-places';
import { asArray, asBoolean, asRecord, asString } from '@/utils/api-helpers';

type AddressLabel = 'home' | 'office' | 'apartment' | 'other';

interface SavedAddressVm {
  id: string;
  title: string;
  address: string;
  label: AddressLabel;
  customLabel: string;
  lat: string;
  lng: string;
  isPinned: boolean;
}

const toAddressList = (value: unknown): SavedAddressVm[] => {
  const rootRecord = asRecord(value);
  const maybeItems = asArray<Record<string, unknown>>(rootRecord.items);
  const source = maybeItems.length > 0 ? maybeItems : asArray<Record<string, unknown>>(value);
  return source.map((address) => {
    const coordinates = asRecord(address.coordinates);
    const label = asString(address.label, 'other') as AddressLabel;
    const customLabel = asString(address.customLabel ?? address.custom_label);
    return {
      id: asString(address.id),
      title: customLabel || label,
      address: asString(address.addressLine ?? address.address_line, '--'),
      label,
      customLabel,
      lat: String(coordinates.lat ?? ''),
      lng: String(coordinates.lng ?? ''),
      isPinned: asBoolean(address.isPinned ?? address.is_pinned)
    };
  });
};

export default function SavedAddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();

  const { data: addressesData } = useSavedAddresses();
  const createAddress = useCreateSavedAddress();
  const updateAddress = useUpdateSavedAddress();
  const deleteAddress = useDeleteSavedAddress();
  const togglePin = useToggleSavedAddressPin();

  const addresses = useMemo(() => toAddressList(addressesData), [addressesData]);

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuTarget, setMenuTarget] = useState<SavedAddressVm | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [addressName, setAddressName] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [editAddressName, setEditAddressName] = useState('');
  const [editAddressQuery, setEditAddressQuery] = useState('');
  const [editSelectedCoords, setEditSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [editPredictions, setEditPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isEditSearching, setIsEditSearching] = useState(false);
  const [hasAddressSelection, setHasAddressSelection] = useState(false);
  const [hasEditAddressSelection, setHasEditAddressSelection] = useState(false);

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setAddressName('');
    setAddressQuery('');
    setSelectedCoords(null);
    setPredictions([]);
    setHasAddressSelection(false);
  };

  const searchAddressSuggestions = useCallback(
    async (input: string, setList: (list: PlacePrediction[]) => void, setLoading: (loading: boolean) => void) => {
      if (input.length < 2) {
        setList([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const results = await googlePlacesService.autocomplete(input);
        setList(results);
      } catch {
        setList([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Add modal: debounce search
  useEffect(() => {
    if (!isAddModalVisible || hasAddressSelection) {
      return;
    }
    const timer = setTimeout(() => {
      void searchAddressSuggestions(addressQuery.trim(), setPredictions, setIsSearching);
    }, 350);
    return () => clearTimeout(timer);
  }, [addressQuery, hasAddressSelection, isAddModalVisible, searchAddressSuggestions]);

  // Edit modal: debounce search
  useEffect(() => {
    if (!isEditModalVisible || hasEditAddressSelection) {
      return;
    }
    const timer = setTimeout(() => {
      void searchAddressSuggestions(editAddressQuery.trim(), setEditPredictions, setIsEditSearching);
    }, 350);
    return () => clearTimeout(timer);
  }, [editAddressQuery, hasEditAddressSelection, isEditModalVisible, searchAddressSuggestions]);

  const handleAddressSelected = async (prediction: PlacePrediction) => {
    const details = await googlePlacesService.getPlaceDetails(prediction.placeId);
    if (!details) {
      return;
    }
    setAddressQuery(details.address || prediction.description);
    setSelectedCoords({
      lat: details.coordinates.latitude,
      lng: details.coordinates.longitude
    });
    setPredictions([]);
    setHasAddressSelection(true);
  };

  const handleEditAddressSelected = async (prediction: PlacePrediction) => {
    const details = await googlePlacesService.getPlaceDetails(prediction.placeId);
    if (!details) {
      return;
    }
    setEditAddressQuery(details.address || prediction.description);
    setEditSelectedCoords({
      lat: details.coordinates.latitude,
      lng: details.coordinates.longitude
    });
    setEditPredictions([]);
    setHasEditAddressSelection(true);
  };

  const handleSaveAddress = async () => {
    if (!addressName.trim() || !addressQuery.trim() || !selectedCoords) {
      return;
    }

    await createAddress.mutateAsync({
      label: 'other',
      custom_label: addressName.trim(),
      address_line: addressQuery.trim(),
      coordinates: selectedCoords,
      is_pinned: false
    });
    closeAddModal();
  };

  const openAddressMenu = (item: SavedAddressVm, event: GestureResponderEvent) => {
    setMenuTarget(item);
    setMenuPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY
    });
    setIsMenuVisible(true);
  };

  const closeAddressMenu = () => {
    setIsMenuVisible(false);
  };

  const openEditModal = () => {
    if (!menuTarget) return;
    setEditAddressName(menuTarget.customLabel || menuTarget.title);
    setEditAddressQuery(menuTarget.address);
    const lat = Number.parseFloat(menuTarget.lat);
    const lng = Number.parseFloat(menuTarget.lng);
    setEditSelectedCoords(
      Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
    );
    setEditPredictions([]);
    setHasEditAddressSelection(true);
    setIsMenuVisible(false);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditAddressName('');
    setEditAddressQuery('');
    setEditSelectedCoords(null);
    setEditPredictions([]);
    setHasEditAddressSelection(false);
  };

  const handleSaveEditedAddress = async () => {
    if (!menuTarget || !editAddressName.trim() || !editAddressQuery.trim() || !editSelectedCoords) {
      return;
    }

    await updateAddress.mutateAsync({
      id: menuTarget.id,
      input: {
        label: 'other',
        custom_label: editAddressName.trim(),
        address_line: editAddressQuery.trim(),
        coordinates: editSelectedCoords
      }
    });
    closeEditModal();
    setMenuTarget(null);
  };

  const openDeleteModal = () => {
    if (!menuTarget) return;
    setIsMenuVisible(false);
    setIsDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const handleDeleteAddress = async () => {
    if (!menuTarget) return;
    await deleteAddress.mutateAsync({ id: menuTarget.id });
    setIsDeleteModalVisible(false);
    setMenuTarget(null);
  };

  const toggleAddressPin = async (addressId: string) => {
    await togglePin.mutateAsync({ id: addressId });
  };

  const POPOVER_WIDTH = 170;
  const popoverLeft = Math.max(
    spacing.lg,
    Math.min(menuPosition.x - POPOVER_WIDTH + spacing.xl, screenWidth - POPOVER_WIDTH - spacing.lg)
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg
        }
      ]}
    >
      <StackHeader translationKey="account.saved_addresses_title" onBack={() => router.back()} align="center" />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.map((item) => (
          <View key={item.id} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Ionicons name={item.isPinned ? 'bookmark' : 'location-outline'} size={20} color={colors.textMuted} />
                <Text variant="body" weight="semiBold">
                  {item.title}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('account.pin_address')}
                  onPress={() => toggleAddressPin(item.id)}
                >
                  <Ionicons name={item.isPinned ? 'bookmark' : 'bookmark-outline'} size={18} color={colors.primary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('account.address_options')}
                  onPress={(event) => openAddressMenu(item, event)}
                >
                  <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} />
                </Pressable>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text variant="bodySmall" color="muted">
              {item.address}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button translationKey="account.add_address" fullWidth onPress={() => setIsAddModalVisible(true)} />
      </View>

      {isMenuVisible && (
        <View style={styles.popoverOverlay}>
          <Pressable style={styles.popoverBackdrop} onPress={closeAddressMenu} />
          <View
            style={[
              styles.popover,
              {
                top: menuPosition.y + spacing.xs,
                left: popoverLeft,
                backgroundColor: colors.surface,
                shadowColor: colors.textPrimary
              }
            ]}
          >
            <Pressable
              style={styles.popoverItem}
              onPress={openEditModal}
              accessibilityRole="button"
              accessibilityLabel={t('account.edit_action')}
            >
              <Ionicons name="create-outline" size={20} color={colors.textMuted} />
              <Text variant="body" color="muted" translationKey="account.edit_action" />
            </Pressable>
            <View style={[styles.popoverDivider, { backgroundColor: colors.border }]} />
            <Pressable
              style={styles.popoverItem}
              onPress={openDeleteModal}
              accessibilityRole="button"
              accessibilityLabel={t('account.delete_action')}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text variant="body" color="error" translationKey="account.delete_action" />
            </Pressable>
          </View>
        </View>
      )}

      <BottomSheet visible={isAddModalVisible} onClose={closeAddModal} maxHeight={640}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg
            }
          ]}
        >
          <Text variant="h2" weight="medium" align="center" translationKey="account.add_address_title" />

          <TextInput
            labelTranslationKey="account.name_label"
            placeholderTranslationKey="account.name_placeholder"
            value={addressName}
            onChangeText={setAddressName}
            leftIcon={<Ionicons name="bookmark-outline" size={20} color={colors.primary} />}
          />
          <TextInput
            labelTranslationKey="account.address_label"
            placeholderTranslationKey="account.address_placeholder"
            value={addressQuery}
            onChangeText={(text) => {
              setAddressQuery(text);
              setHasAddressSelection(false);
              if (text.length === 0) {
                setSelectedCoords(null);
                setPredictions([]);
              }
            }}
            leftIcon={<Ionicons name="location-outline" size={20} color={colors.primary} />}
            rightIcon={isSearching ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
          />
          {predictions.length > 0 ? (
            <View style={[styles.suggestionsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {predictions.map((p) => (
                  <Pressable
                    key={p.placeId}
                    onPress={() => handleAddressSelected(p)}
                    style={styles.suggestionRow}
                  >
                    <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" weight="medium" numberOfLines={1}>
                        {p.mainText}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {p.secondaryText}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {selectedCoords ? (
            <View style={styles.coordsRow}>
              <Ionicons name="navigate-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" color="muted">
                {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
              </Text>
            </View>
          ) : null}

          <Button
            title={t('common.save')}
            fullWidth
            onPress={handleSaveAddress}
            disabled={!addressName.trim() || !selectedCoords}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={isEditModalVisible} onClose={closeEditModal} maxHeight={640}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg
            }
          ]}
        >
          <Text variant="h2" weight="medium" align="center" translationKey="account.edit_address_title" />

          <TextInput
            labelTranslationKey="account.name_label"
            placeholderTranslationKey="account.name_placeholder"
            value={editAddressName}
            onChangeText={setEditAddressName}
            leftIcon={<Ionicons name="bookmark-outline" size={20} color={colors.primary} />}
          />
          <TextInput
            labelTranslationKey="account.address_label"
            placeholderTranslationKey="account.address_placeholder"
            value={editAddressQuery}
            onChangeText={(text) => {
              setEditAddressQuery(text);
              setHasEditAddressSelection(false);
              if (text.length === 0) {
                setEditSelectedCoords(null);
                setEditPredictions([]);
              }
            }}
            leftIcon={<Ionicons name="location-outline" size={20} color={colors.primary} />}
            rightIcon={isEditSearching ? <ActivityIndicator size="small" color={colors.primary} /> : undefined}
          />
          {editPredictions.length > 0 ? (
            <View style={[styles.suggestionsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {editPredictions.map((p) => (
                  <Pressable
                    key={p.placeId}
                    onPress={() => handleEditAddressSelected(p)}
                    style={styles.suggestionRow}
                  >
                    <Ionicons name="location-outline" size={18} color={colors.textMuted} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodySmall" weight="medium" numberOfLines={1}>
                        {p.mainText}
                      </Text>
                      <Text variant="caption" color="muted" numberOfLines={1}>
                        {p.secondaryText}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : null}

          {editSelectedCoords ? (
            <View style={styles.coordsRow}>
              <Ionicons name="navigate-outline" size={16} color={colors.textMuted} />
              <Text variant="caption" color="muted">
                {editSelectedCoords.lat.toFixed(5)}, {editSelectedCoords.lng.toFixed(5)}
              </Text>
            </View>
          ) : null}

          <Button
            title={t('common.save')}
            fullWidth
            onPress={handleSaveEditedAddress}
            disabled={!editAddressName.trim() || !editSelectedCoords}
          />
        </View>
      </BottomSheet>

      <BottomSheet visible={isDeleteModalVisible} onClose={closeDeleteModal} maxHeight={360}>
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg
            }
          ]}
        >
          <Text variant="h2" weight="medium" align="center" translationKey="account.delete_address_title" />
          <Text variant="bodySmall" color="muted" align="center" translationKey="account.delete_address_message" />
          <Button title={t('common.delete')} fullWidth onPress={handleDeleteAddress} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xxxxl
  },
  card: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  cardTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm
  },
  divider: {
    height: 1,
    marginVertical: spacing.sm
  },
  footer: {
    marginTop: 'auto'
  },
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFillObject
  },
  popover: {
    position: 'absolute',
    width: 170,
    borderRadius: borderRadius.md,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
    paddingVertical: spacing.xs
  },
  popoverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  popoverDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: spacing.sm
  },
  modalSheet: {
    gap: spacing.md
  },
  suggestionsBox: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    maxHeight: 220,
    overflow: 'hidden'
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  }
});

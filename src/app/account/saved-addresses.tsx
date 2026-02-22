import { useState } from "react";
import {
  GestureResponderEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { Text } from "@/components/common/text";
import { TextInput } from "@/components/common/text-input";
import { Button } from "@/components/common/button";
import { BottomSheet } from "@/components/common/bottom-sheet";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "@/context/language-context";
import { borderRadius, spacing } from "@/constants/spacing";
import { StackHeader } from "@/components/common/stack-header";
import { localJsonApi } from '@/api/local-json-api';

type SavedAddress = {
  key: string;
  title: string;
  address: string;
};

export default function SavedAddressesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [menuTarget, setMenuTarget] = useState<SavedAddress | null>(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [addressName, setAddressName] = useState("");
  const [addressValue, setAddressValue] = useState("");
  const [editAddressName, setEditAddressName] = useState("");
  const [editAddressValue, setEditAddressValue] = useState("");
  const previewName = addressName.trim();
  const previewAddress = addressValue.trim();
  const hasPreviewContent = previewName.length > 0 || previewAddress.length > 0;
  const editPreviewName = editAddressName.trim();
  const editPreviewAddress = editAddressValue.trim();
  const hasEditPreviewContent =
    editPreviewName.length > 0 || editPreviewAddress.length > 0;
  const [addresses, setAddresses] = useState<SavedAddress[]>([
    ...localJsonApi.getSavedAddresses().map((address) => ({
      key: address.id,
      title: address.label,
      address: address.address_line,
    })),
  ]);

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setAddressName("");
    setAddressValue("");
  };

  const handleSaveAddress = () => {
    if (!addressName.trim() || !addressValue.trim()) {
      return;
    }

    setAddresses((prev) => [
      {
        key: `custom-${Date.now()}`,
        title: addressName.trim(),
        address: addressValue.trim(),
      },
      ...prev,
    ]);
    setAddressName("");
    setAddressValue("");
    setIsAddModalVisible(false);
  };

  const getAddressTitle = (item: SavedAddress) =>
    item.title;

  const getAddressValue = (item: SavedAddress) =>
    item.address;

  const openAddressMenu = (
    item: SavedAddress,
    event: GestureResponderEvent,
  ) => {
    setMenuTarget(item);
    setMenuPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
    setIsMenuVisible(true);
  };

  const closeAddressMenu = () => {
    setIsMenuVisible(false);
  };

  const openEditModal = () => {
    if (!menuTarget) return;
    setEditAddressName(getAddressTitle(menuTarget));
    setEditAddressValue(getAddressValue(menuTarget));
    setIsMenuVisible(false);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditAddressName("");
    setEditAddressValue("");
  };

  const handleSaveEditedAddress = () => {
    if (!menuTarget || !editAddressName.trim() || !editAddressValue.trim()) {
      return;
    }

    setAddresses((prev) =>
      prev.map((item) =>
        item.key === menuTarget.key
          ? {
              ...item,
              title: editAddressName.trim(),
              address: editAddressValue.trim(),
            }
          : item,
      ),
    );
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

  const handleDeleteAddress = () => {
    if (!menuTarget) return;
    setAddresses((prev) => prev.filter((item) => item.key !== menuTarget.key));
    setIsDeleteModalVisible(false);
    setMenuTarget(null);
  };

  const POPOVER_WIDTH = 170;
  const popoverLeft = Math.max(
    spacing.lg,
    Math.min(
      menuPosition.x - POPOVER_WIDTH + spacing.xl,
      screenWidth - POPOVER_WIDTH - spacing.lg,
    ),
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + spacing.lg,
        },
      ]}
    >
      <StackHeader
        translationKey="account.saved_addresses_title"
        onBack={() => router.back()}
        align="center"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {addresses.map((item) => (
          <View
            key={item.key}
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitle}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.textMuted}
                />
                <Text variant="body" weight="semiBold">
                  {item.title}
                </Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t("account.address_options")}
                onPress={(event) => openAddressMenu(item, event)}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={18}
                  color={colors.textMuted}
                />
              </Pressable>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <Text variant="bodySmall" color="muted">
              {item.address}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}
      >
        <Button
          translationKey="account.add_address"
          fullWidth
          onPress={() => setIsAddModalVisible(true)}
        />
      </View>

      {isMenuVisible && (
        <View style={styles.popoverOverlay}>
          <Pressable
            style={styles.popoverBackdrop}
            onPress={closeAddressMenu}
          />
          <View
            style={[
              styles.popover,
              {
                top: menuPosition.y + spacing.xs,
                left: popoverLeft,
                backgroundColor: colors.surface,
                shadowColor: colors.textPrimary,
              },
            ]}
          >
            <Pressable
              style={styles.popoverItem}
              onPress={openEditModal}
              accessibilityRole="button"
              accessibilityLabel={t("account.edit_action")}
            >
              <Ionicons
                name="create-outline"
                size={20}
                color={colors.textMuted}
              />
              <Text
                variant="body"
                color="muted"
                translationKey="account.edit_action"
              />
            </Pressable>
            <View
              style={[
                styles.popoverDivider,
                { backgroundColor: colors.border },
              ]}
            />
            <Pressable
              style={styles.popoverItem}
              onPress={openDeleteModal}
              accessibilityRole="button"
              accessibilityLabel={t("account.delete_action")}
            >
              <Ionicons name="trash-outline" size={20} color={colors.error} />
              <Text
                variant="body"
                color="error"
                translationKey="account.delete_action"
              />
            </Pressable>
          </View>
        </View>
      )}

      <BottomSheet
        visible={isAddModalVisible}
        onClose={closeAddModal}
        maxHeight={640}
      >
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <Text
            variant="h2"
            weight="medium"
            align="center"
            translationKey="account.add_address_title"
          />

          <View
            style={[
              styles.previewCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.previewHeader}>
              <Ionicons
                name={hasPreviewContent ? "location-sharp" : "location-outline"}
                size={20}
                color={hasPreviewContent ? colors.error : colors.textMuted}
              />
              <Text
                variant="body"
                weight="semiBold"
                color={previewName ? undefined : "muted"}
              >
                {previewName || t("account.preview_name_empty")}
              </Text>
            </View>
            <Text variant="bodySmall" color="muted">
              {previewAddress || t("account.preview_address_empty")}
            </Text>
          </View>

          <TextInput
            labelTranslationKey="account.name_label"
            placeholderTranslationKey="account.name_placeholder"
            value={addressName}
            onChangeText={setAddressName}
          />

          <TextInput
            labelTranslationKey="account.address_label"
            placeholderTranslationKey="account.address_placeholder"
            value={addressValue}
            onChangeText={setAddressValue}
          />

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              translationKey="common.cancel"
              onPress={closeAddModal}
              style={styles.actionButton}
            />
            <Button
              translationKey="common.save"
              onPress={handleSaveAddress}
              disabled={!addressName.trim() || !addressValue.trim()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={isEditModalVisible}
        onClose={closeEditModal}
        maxHeight={640}
      >
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <Text
            variant="h3"
            weight="medium"
            align="center"
            translationKey="account.edit_address_title"
          />

          <View
            style={[
              styles.previewCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.previewHeader}>
              <Ionicons
                name={
                  hasEditPreviewContent ? "location-sharp" : "location-outline"
                }
                size={20}
                color={hasEditPreviewContent ? colors.error : colors.textMuted}
              />
              <Text
                variant="body"
                weight="semiBold"
                color={editPreviewName ? undefined : "muted"}
              >
                {editPreviewName || t("account.preview_name_empty")}
              </Text>
            </View>
            <Text variant="bodySmall" color="muted">
              {editPreviewAddress || t("account.preview_address_empty")}
            </Text>
          </View>

          <TextInput
            labelTranslationKey="account.name_label"
            placeholderTranslationKey="account.name_placeholder"
            value={editAddressName}
            onChangeText={setEditAddressName}
          />

          <TextInput
            labelTranslationKey="account.address_label"
            placeholderTranslationKey="account.address_placeholder"
            value={editAddressValue}
            onChangeText={setEditAddressValue}
          />

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              translationKey="common.cancel"
              onPress={closeEditModal}
              style={styles.actionButton}
            />
            <Button
              translationKey="common.save"
              onPress={handleSaveEditedAddress}
              disabled={!editAddressName.trim() || !editAddressValue.trim()}
              style={styles.actionButton}
            />
          </View>
        </View>
      </BottomSheet>

      <BottomSheet
        visible={isDeleteModalVisible}
        onClose={closeDeleteModal}
        maxHeight={520}
      >
        <View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.background,
              paddingBottom: insets.bottom + spacing.lg,
            },
          ]}
        >
          <Text
            variant="h3"
            weight="medium"
            align="center"
            color="error"
            translationKey="account.delete_address_title"
          />
          <View
            style={[
              styles.divider,
              { backgroundColor: colors.border, marginVertical: spacing.md },
            ]}
          />
          <Text
            variant="body"
            align="center"
            translationKey="account.delete_address_question"
            style={styles.deleteQuestion}
          />

          {menuTarget && (
            <View
              style={[
                styles.previewCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.previewHeader}>
                <Ionicons
                  name="location-sharp"
                  size={20}
                  color={colors.error}
                />
                <Text variant="body" weight="semiBold">
                  {getAddressTitle(menuTarget)}
                </Text>
              </View>
              <Text variant="bodySmall" color="muted">
                {getAddressValue(menuTarget)}
              </Text>
            </View>
          )}

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              translationKey="account.delete_no_cancel"
              onPress={closeDeleteModal}
              style={styles.actionButton}
            />
            <Button
              translationKey="account.delete_yes"
              onPress={handleDeleteAddress}
              style={styles.actionButton}
            />
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  content: {
    gap: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  divider: {
    height: 0.5,
    marginVertical: spacing.lg,
  },
  footer: {
    paddingTop: spacing.sm,
  },
  popoverOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  popoverBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  popover: {
    position: "absolute",
    width: 170,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.sm,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  popoverItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  popoverDivider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  modalSheet: {
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: borderRadius.xxl,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  deleteQuestion: {
    marginBottom: spacing.md,
  },
});

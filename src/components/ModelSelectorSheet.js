import React from "react";
import { Modal, View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/theme";
import { listProviders } from "../lib/providers";

export default function ModelSelectorSheet({ visible, onClose, onSelect, activeProviderId, connectedMap }) {
  const providers = listProviders();

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Switch model</Text>
        <FlatList
          data={providers}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => {
            const connected = !!connectedMap?.[item.id];
            const active = item.id === activeProviderId;
            return (
              <Pressable style={styles.row} onPress={() => onSelect(item.id)}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                </View>
                {!connected && <Text style={styles.notConnected}>Not connected</Text>}
                {active && <Ionicons name="checkmark-circle" size={20} color={colors.black} />}
              </Pressable>
            );
          }}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    paddingTop: 8,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: "70%",
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginBottom: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
  rowLabel: { fontSize: 15, color: colors.textPrimary, fontWeight: "600", marginBottom: 4 },
  badge: { alignSelf: "flex-start", backgroundColor: colors.chipBg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  notConnected: { fontSize: 12, color: colors.danger },
});

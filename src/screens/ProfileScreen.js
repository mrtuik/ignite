import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, Modal, TextInput, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../theme/theme";
import { listProviders } from "../lib/providers";
import {
  getConnectedProviders,
  saveProviderKey,
  removeProviderKey,
  getActiveProvider,
  setActiveProvider,
} from "../lib/auth";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const providers = listProviders();
  const [connectedMap, setConnectedMap] = useState({});
  const [activeProviderId, setActiveProviderId] = useState("gemini");
  const [keyModal, setKeyModal] = useState(null); // provider object or null
  const [keyInput, setKeyInput] = useState("");

  const refresh = useCallback(async () => {
    const map = await getConnectedProviders(providers.map((p) => p.id));
    setConnectedMap(map);
    setActiveProviderId(await getActiveProvider("gemini"));
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRowPress = (provider) => {
    if (connectedMap[provider.id]) {
      setActiveProvider(provider.id).then(() => setActiveProviderId(provider.id));
    } else {
      setKeyInput("");
      setKeyModal(provider);
    }
  };

  const saveKey = async () => {
    if (!keyModal || !keyInput.trim()) return;
    await saveProviderKey(keyModal.id, keyInput.trim());
    await setActiveProvider(keyModal.id);
    setKeyModal(null);
    refresh();
  };

  const disconnect = async (provider) => {
    await removeProviderKey(provider.id);
    refresh();
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.white} />
          </View>
          <Text style={styles.name}>Ignite User</Text>
          <Text style={styles.email}>you@example.com</Text>
        </View>

        <Text style={styles.sectionLabel}>Models</Text>
        <View style={styles.sectionCard}>
          {providers.map((p, i) => {
            const connected = !!connectedMap[p.id];
            const active = p.id === activeProviderId;
            return (
              <Pressable
                key={p.id}
                style={[styles.modelRow, i < providers.length - 1 && styles.rowDivider]}
                onPress={() => onRowPress(p)}
                onLongPress={() => connected && disconnect(p)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.modelName}>{p.label}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{p.badge}</Text>
                    </View>
                    <Text style={connected ? styles.connectedText : styles.notConnectedText}>
                      {connected ? "Connected" : "Tap to add key"}
                    </Text>
                  </View>
                </View>
                {active && connected && <Ionicons name="checkmark-circle" size={20} color={colors.black} />}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.sectionCard}>
          <View style={[styles.row, styles.rowDivider]}>
            <Text style={styles.rowLabel}>Usage &amp; credits</Text>
            <Text style={styles.rowValue}>Pay-as-you-go via your own keys</Text>
          </View>
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.danger }]}>Sign out</Text>
          </Pressable>
        </View>

        <Text style={styles.footer}>Made with ☕ Coffee with TUIK</Text>
      </ScrollView>

      <Modal visible={!!keyModal} transparent animationType="fade" onRequestClose={() => setKeyModal(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Connect {keyModal?.label}</Text>
            <Text style={styles.modalHint}>
              Your key is stored only on this device and sent directly to {keyModal?.badge}'s API.
            </Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Paste API key"
              placeholderTextColor={colors.textSecondary}
              value={keyInput}
              onChangeText={setKeyInput}
              secureTextEntry
              autoCapitalize="none"
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.modalCancel} onPress={() => setKeyModal(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.modalSave} onPress={saveKey}>
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 18, fontWeight: "700", color: colors.textPrimary },
  avatarWrap: { alignItems: "center", paddingVertical: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  name: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginTop: 12 },
  email: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: "700", color: colors.textSecondary, textTransform: "uppercase", marginHorizontal: 16, marginTop: 20, marginBottom: 8 },
  sectionCard: { backgroundColor: colors.surface, marginHorizontal: 16, borderRadius: radius.cardSm, overflow: "hidden" },
  modelRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 14 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  modelName: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  badge: { backgroundColor: colors.chipBg, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 11, color: colors.textSecondary, fontWeight: "600" },
  connectedText: { fontSize: 12, color: "#2E7D32" },
  notConnectedText: { fontSize: 12, color: colors.textSecondary },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 14 },
  rowLabel: { fontSize: 15, color: colors.textPrimary },
  rowValue: { fontSize: 12, color: colors.textSecondary },
  footer: { textAlign: "center", fontSize: 12, color: colors.textSecondary, marginTop: 32 },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: 24 },
  modalCard: { backgroundColor: colors.surface, borderRadius: radius.cardSm, padding: 20, width: "100%" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 6 },
  modalHint: { fontSize: 12, color: colors.textSecondary, marginBottom: 14, lineHeight: 17 },
  modalInput: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.button, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.textPrimary, marginBottom: 16 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12 },
  modalCancel: { paddingHorizontal: 14, paddingVertical: 10 },
  modalCancelText: { color: colors.textSecondary, fontWeight: "600" },
  modalSave: { backgroundColor: colors.black, borderRadius: radius.button, paddingHorizontal: 16, paddingVertical: 10 },
  modalSaveText: { color: colors.white, fontWeight: "700" },
});

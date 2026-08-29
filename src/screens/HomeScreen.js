import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { colors, radius } from "../theme/theme";
import Header from "../components/Header";
import InputCard from "../components/InputCard";
import BottomPillBar from "../components/BottomPillBar";
import ModelSelectorSheet from "../components/ModelSelectorSheet";
import { createSession } from "../lib/storage";
import { getActiveProvider, setActiveProvider, getConnectedProviders } from "../lib/auth";
import { listProviders } from "../lib/providers";

const FILTERS = [
  { key: "suggested", label: "Suggested", icon: null },
  { key: "wireframe", label: "Wireframe", icon: "grid-outline" },
  { key: "apps", label: "Apps", icon: "phone-portrait-outline" },
  { key: "websites", label: "Websites", icon: "globe-outline" },
  { key: "prototype", label: "Prototype", icon: "layers-outline" },
];

const SUGGESTIONS = [
  { icon: "restaurant-outline", text: "A food delivery app home screen like Zomato" },
  { icon: "cart-outline", text: "An e-commerce product page with variant selector" },
  { icon: "calendar-outline", text: "A booking flow for a lab test marketplace" },
  { icon: "bar-chart-outline", text: "A dashboard for tracking weekly habits" },
  { icon: "chatbubbles-outline", text: "A landing page for an AI coding tool" },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [activeFilter, setActiveFilter] = useState("suggested");
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [providerId, setProviderId] = useState("gemini");
  const [connectedMap, setConnectedMap] = useState({});

  useEffect(() => {
    (async () => {
      const active = await getActiveProvider("gemini");
      setProviderId(active);
      const map = await getConnectedProviders(listProviders().map((p) => p.id));
      setConnectedMap(map);
    })();
  }, []);

  const activeLabel = listProviders().find((p) => p.id === providerId)?.label || "Gemini 3.0";

  const startChat = async (message) => {
    const initial = (message ?? text).trim();
    if (!initial) return;
    const session = await createSession(initial.slice(0, 40));
    navigation.navigate("Chat", { sessionId: session.id, initialMessage: initial });
    setText("");
  };

  return (
    <View style={styles.root}>
      <Header />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={{ height: 64 }} />
        <Text style={styles.heroLine}>Turn your ideas</Text>
        <Text style={styles.heroLine}>
          into <Text style={styles.heroBold}>Ignite</Text>
        </Text>

        <View style={{ height: 28 }} />
        <InputCard
          value={text}
          onChangeText={setText}
          onSend={() => startChat()}
          onOpenModelSelector={() => setModelSheetOpen(true)}
          modelLabel={activeLabel}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 12, paddingHorizontal: 16 }}>
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[styles.filterChip, active && styles.filterChipActive]}
              >
                {f.icon && <Ionicons name={f.icon} size={14} color={active ? colors.white : colors.textSecondary} />}
                <Text style={[styles.filterChipText, active && { color: colors.white }]}>{f.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.suggestionCard}>
          {SUGGESTIONS.map((s, i) => (
            <Pressable
              key={i}
              style={[styles.suggestionRow, i < SUGGESTIONS.length - 1 && styles.suggestionDivider]}
              onPress={() => startChat(s.text)}
            >
              <Ionicons name={s.icon} size={20} color={colors.textSecondary} style={{ marginRight: 12 }} />
              <Text style={styles.suggestionText}>{s.text}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 90 }} />
      </ScrollView>

      <BottomPillBar
        onPlan={() => navigation.navigate("PlanPanel")}
        onFiles={() => navigation.navigate("FilesPanel")}
      />

      <ModelSelectorSheet
        visible={modelSheetOpen}
        onClose={() => setModelSheetOpen(false)}
        activeProviderId={providerId}
        connectedMap={connectedMap}
        onSelect={async (id) => {
          setProviderId(id);
          await setActiveProvider(id);
          setModelSheetOpen(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 16 },
  heroLine: { fontSize: 34, color: "#1a1a1a", paddingHorizontal: 16, lineHeight: 40 },
  heroBold: { fontWeight: "700", color: colors.black },
  filterRow: { marginTop: 20, flexGrow: 0 },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.black, borderColor: colors.black },
  filterChipText: { fontSize: 13, fontWeight: "600", color: colors.textSecondary },
  suggestionCard: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.cardSm,
    overflow: "hidden",
  },
  suggestionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 14 },
  suggestionDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  suggestionText: { fontSize: 15, color: colors.textPrimary, flex: 1 },
});

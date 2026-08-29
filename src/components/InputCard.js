import React, { useState } from "react";
import { View, TextInput, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { colors, radius, elevation } from "../theme/theme";

export default function InputCard({ value, onChangeText, onSend, onOpenModelSelector, modelLabel, sending }) {
  const [ideasActive, setIdeasActive] = useState(false);

  return (
    <View style={styles.card}>
      <TextInput
        style={styles.input}
        placeholder="What do you want to design?"
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        multiline
      />
      <View style={styles.controlRow}>
        <Pressable style={styles.attachBtn} hitSlop={6}>
          <Feather name="paperclip" size={16} color={colors.textPrimary} />
        </Pressable>

        <Pressable style={styles.chip}>
          <Text style={styles.chipText}>Design Style</Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
        </Pressable>

        <Pressable
          style={[styles.chip, ideasActive && styles.chipActive]}
          onPress={() => setIdeasActive((v) => !v)}
        >
          <Ionicons name="bulb-outline" size={14} color={ideasActive ? colors.accentText : colors.textSecondary} />
          <Text style={[styles.chipText, ideasActive && { color: colors.accentText }]}>Ideas</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        <Pressable style={styles.modelBtn} onPress={onOpenModelSelector}>
          <Ionicons name="sparkles" size={14} color={colors.textPrimary} />
          <Text style={styles.modelText} numberOfLines={1}>{modelLabel}</Text>
          <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
        </Pressable>

        <Pressable style={styles.sendBtn} onPress={onSend} disabled={sending}>
          <Ionicons name={sending ? "hourglass-outline" : "arrow-up"} size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    marginHorizontal: 16,
    padding: 14,
    ...elevation[3],
  },
  input: { fontSize: 16, color: colors.textPrimary, minHeight: 40, maxHeight: 120, paddingBottom: 8 },
  controlRow: { flexDirection: "row", alignItems: "center", height: 44, gap: 8 },
  attachBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.rowHoverBg,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.accentBg, borderColor: colors.accentBg },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: "600" },
  modelBtn: { flexDirection: "row", alignItems: "center", gap: 4, maxWidth: 130 },
  modelText: { fontSize: 12, color: colors.textPrimary, fontWeight: "600" },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
});

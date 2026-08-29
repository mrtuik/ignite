import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, elevation } from "../theme/theme";

export default function BottomPillBar({ active, onPlan, onFiles }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Pressable style={styles.item} onPress={onPlan}>
          <Ionicons name="albums-outline" size={16} color={active === "plan" ? colors.black : colors.textSecondary} />
          <Text style={[styles.label, active === "plan" && styles.labelActive]}>Plan</Text>
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.item} onPress={onFiles}>
          <Ionicons name="folder-outline" size={16} color={active === "files" ? colors.black : colors.textSecondary} />
          <Text style={[styles.label, active === "files" && styles.labelActive]}>Files</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", paddingBottom: 8 },
  pill: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingVertical: 8,
    paddingHorizontal: 6,
    ...elevation[4],
  },
  item: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 4 },
  label: { fontSize: 13, color: colors.textSecondary, fontWeight: "600" },
  labelActive: { color: colors.black },
  divider: { width: 1, backgroundColor: colors.border, marginVertical: 2 },
});

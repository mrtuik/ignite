import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/theme";

const ICONS = { html: "code-slash-outline", js: "logo-javascript", css: "color-palette-outline", json: "braces-outline", text: "document-text-outline" };

export default function FileCard({ file, onPress, onLongPress }) {
  return (
    <Pressable style={styles.card} onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.iconArea}>
        <Ionicons name={ICONS[file.type] || "document-outline"} size={32} color={colors.textSecondary} />
      </View>
      <View style={styles.labelArea}>
        <Text style={styles.filename} numberOfLines={1}>{file.name}</Text>
        <Text style={styles.filetype}>{(file.type || "text").toUpperCase()}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.cardXs, borderWidth: 1, borderColor: colors.border, overflow: "hidden" },
  iconArea: { height: 90, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  labelArea: { padding: 10 },
  filename: { fontSize: 13, fontWeight: "700", color: colors.textPrimary },
  filetype: { fontSize: 11, color: colors.textSecondary, marginTop: 2 },
});

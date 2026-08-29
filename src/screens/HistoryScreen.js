import React, { useCallback, useState } from "react";
import { View, Text, TextInput, SectionList, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../theme/theme";
import { getSessionIndex, groupByDate } from "../lib/storage";

export default function HistoryScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [allSessions, setAllSessions] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getSessionIndex().then((list) => alive && setAllSessions(list));
      return () => {
        alive = false;
      };
    }, [])
  );

  const filtered = allSessions.filter((s) => (s.title || "").toLowerCase().includes(query.toLowerCase()));
  const sections = groupByDate(filtered).map(([title, data]) => ({ title, data }));

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>History</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search chats"
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate("Chat", { sessionId: item.id })}
          >
            <Text style={styles.rowTitle} numberOfLines={1}>{item.title || "Untitled chat"}</Text>
            <Text style={styles.rowTime}>{formatTime(item.updatedAt)}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No chats found.</Text>}
      />
    </SafeAreaView>
  );
}

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.rowHoverBg,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textPrimary },
  sectionHeader: { fontSize: 13, fontWeight: "700", color: colors.textSecondary, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6 },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.textPrimary, flexShrink: 1, marginRight: 12 },
  rowTime: { fontSize: 12, color: colors.textSecondary },
  emptyText: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
});

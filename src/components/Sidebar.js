import React, { useCallback, useState } from "react";
import { View, Text, Pressable, StyleSheet, SectionList } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, typography, radius } from "../theme/theme";
import { getSessionIndex, groupByDate, createSession } from "../lib/storage";

export default function Sidebar({ navigation }) {
  const [sections, setSections] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      getSessionIndex().then((list) => {
        if (!alive) return;
        const grouped = groupByDate(list).map(([title, data]) => ({ title, data }));
        setSections(grouped);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  const openChat = (sessionId) => {
    navigation.navigate("MainStack", { screen: "Chat", params: { sessionId } });
    navigation.closeDrawer?.();
  };

  const startNewChat = async () => {
    const session = await createSession();
    openChat(session.id);
  };

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoDot}>
            <Text style={styles.logoDotText}>i</Text>
          </View>
          <Text style={styles.logoText}>Ignite</Text>
        </View>
        <Pressable onPress={() => navigation.navigate("MainStack", { screen: "Profile" })} hitSlop={8}>
          <Ionicons name="person-circle-outline" size={26} color={colors.textPrimary} />
        </Pressable>
      </View>

      <Pressable style={styles.newChatBtn} onPress={startNewChat}>
        <Ionicons name="add" size={18} color={colors.white} />
        <Text style={styles.newChatText}>New chat</Text>
      </Pressable>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.row} onPress={() => openChat(item.id)}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} style={{ marginRight: 8 }} />
            <Text style={styles.rowText} numberOfLines={1}>
              {item.title || "Untitled chat"}
            </Text>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No chats yet — start a new one above.</Text>
        }
      />

      <Pressable
        style={styles.historyLink}
        onPress={() => navigation.navigate("MainStack", { screen: "History" })}
      >
        <Ionicons name="time-outline" size={16} color={colors.textPrimary} />
        <Text style={styles.historyLinkText}>See all history</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  logoDotText: { color: colors.white, fontWeight: "700", fontSize: 12 },
  logoText: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginLeft: 6 },
  newChatBtn: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.black,
    borderRadius: radius.button,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 6,
  },
  newChatText: { color: colors.white, fontWeight: "600", fontSize: 14 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  row: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10 },
  rowText: { fontSize: 14, color: colors.textPrimary, flexShrink: 1 },
  emptyText: { paddingHorizontal: 16, paddingTop: 24, color: colors.textSecondary, fontSize: 13 },
  historyLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  historyLinkText: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
});

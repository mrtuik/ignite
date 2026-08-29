import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";

import { colors } from "../theme/theme";
import { createSession } from "../lib/storage";

export default function Header() {
  const navigation = useNavigation();

  const onNewChat = async () => {
    const session = await createSession();
    navigation.navigate("Chat", { sessionId: session.id });
  };

  return (
    <View style={styles.bar}>
      <Pressable style={styles.logoRow} onPress={() => navigation.navigate("Home")} hitSlop={8}>
        <View style={styles.logoDot}>
          <Text style={styles.logoDotText}>i</Text>
        </View>
        <Text style={styles.logoText}>Ignite</Text>
      </Pressable>

      <View style={styles.icons}>
        <Pressable onPress={onNewChat} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="add" size={22} color={colors.black} />
        </Pressable>
        <Pressable
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          hitSlop={10}
          style={styles.iconBtn}
        >
          <Ionicons name="time-outline" size={22} color={colors.black} />
        </Pressable>
        <Pressable onPress={() => navigation.navigate("Profile")} hitSlop={10} style={styles.iconBtn}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  logoDotText: { color: colors.white, fontWeight: "700", fontSize: 13 },
  logoText: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginLeft: 8 },
  icons: { flexDirection: "row", alignItems: "center", gap: 16 },
  iconBtn: { padding: 2 },
});

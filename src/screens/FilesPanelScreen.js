import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../theme/theme";
import FileCard from "../components/FileCard";
import BottomPillBar from "../components/BottomPillBar";
import { getSession, saveSession } from "../lib/storage";

export default function FilesPanelScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params || {};
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (sessionId) getSession(sessionId).then(setSession);
  }, [sessionId]);

  const files = Object.values(session?.files || {});

  const onLongPress = (file) => {
    Alert.alert(file.name, undefined, [
      { text: "Rename", onPress: () => {} },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const next = { ...session, files: { ...session.files } };
          delete next.files[file.name];
          await saveSession(next);
          setSession(next);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouch} onPress={() => navigation.goBack()} />
      <SafeAreaView style={styles.sheet} edges={["bottom"]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Files</Text>
          {files.length > 1 ? (
            <Pressable style={styles.zipBtn}>
              <Ionicons name="download-outline" size={14} color={colors.textPrimary} />
              <Text style={styles.zipBtnText}>ZIP</Text>
            </Pressable>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>

        {files.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Ionicons name="folder-open-outline" size={40} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No files yet — generate something to see it here</Text>
          </View>
        ) : (
          <FlatList
            data={files}
            keyExtractor={(f) => f.name}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <FileCard
                file={item}
                onPress={() => navigation.navigate("FilePreview", { sessionId, filename: item.name })}
                onLongPress={() => onLongPress(item)}
              />
            )}
          />
        )}

        <BottomPillBar
          active="files"
          onPlan={() => navigation.replace("PlanPanel", { sessionId })}
          onFiles={() => {}}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  backdropTouch: { flex: 1 },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    height: "88%",
    paddingHorizontal: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: "center", marginVertical: 10 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  zipBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  zipBtnText: { fontSize: 12, fontWeight: "600", color: colors.textPrimary },
  emptyWrap: { alignItems: "center", justifyContent: "center", paddingVertical: 80, gap: 12 },
  emptyText: { color: colors.textSecondary, fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
});

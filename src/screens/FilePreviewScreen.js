import React, { useEffect, useState, useCallback, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

import { colors } from "../theme/theme";
import { getSession } from "../lib/storage";

let WebView = null;
if (Platform.OS !== "web") {
  // Native only — react-native-webview has no meaningful web build here;
  // HTML files render via an <iframe> fallback on web instead (below).
  WebView = require("react-native-webview").WebView;
}

export default function FilePreviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, filename } = route.params || {};
  const [file, setFile] = useState(null);
  const webviewKey = useRef(0);
  const [refreshTick, setRefreshTick] = useState(0);

  const load = useCallback(async () => {
    const s = await getSession(sessionId);
    setFile(s?.files?.[filename] || null);
  }, [sessionId, filename]);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  const onShare = async () => {
    if (!file) return;
    try {
      const path = FileSystem.cacheDirectory + file.name;
      await FileSystem.writeAsStringAsync(path, file.content);
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path);
    } catch (e) {
      // sharing not available on this platform/build — silently ignore
    }
  };

  if (!file) {
    return (
      <SafeAreaView style={styles.root}>
        <Text style={styles.notFound}>File not found.</Text>
      </SafeAreaView>
    );
  }

  const isHtml = file.type === "html";

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.filename} numberOfLines={1}>{file.name}</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => setRefreshTick((t) => t + 1)} hitSlop={8}>
            <Ionicons name="refresh-outline" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={onShare} hitSlop={8}>
            <Ionicons name="share-outline" size={20} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {isHtml ? (
          Platform.OS === "web" ? (
            // eslint-disable-next-line jsx-a11y/iframe-has-title
            <iframe srcDoc={file.content} style={{ flex: 1, width: "100%", height: "100%", border: "none" }} />
          ) : (
            <WebView key={webviewKey.current} originWhitelist={["*"]} source={{ html: file.content }} style={{ flex: 1 }} />
          )
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <Text style={styles.code}>{file.content}</Text>
          </ScrollView>
        )}
      </View>

      {isHtml && (
        <View style={styles.actionBar}>
          <Pressable style={styles.installBtn} onPress={onShare}>
            <Text style={styles.installBtnText}>Export file</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  filename: { fontSize: 18, color: colors.textPrimary, fontWeight: "600", flex: 1, marginHorizontal: 12 },
  headerIcons: { flexDirection: "row", gap: 16 },
  body: { flex: 1, backgroundColor: colors.white },
  code: { fontFamily: "monospace", fontSize: 12, color: colors.textPrimary, lineHeight: 18 },
  notFound: { textAlign: "center", marginTop: 40, color: colors.textSecondary },
  actionBar: { padding: 16 },
  installBtn: { backgroundColor: colors.black, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  installBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
});

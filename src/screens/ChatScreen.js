import React, { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";

import { colors, radius, elevation } from "../theme/theme";
import Header from "../components/Header";
import InputCard from "../components/InputCard";
import BottomPillBar from "../components/BottomPillBar";
import ModelSelectorSheet from "../components/ModelSelectorSheet";
import { getSession, saveSession } from "../lib/storage";
import { getActiveProvider, setActiveProvider, getConnectedProviders, getProviderKey } from "../lib/auth";
import { listProviders } from "../lib/providers";
import { runAgentTurn } from "../lib/agentLoop";

const NO_KEY_REPLY = "Please connect your API key to start generating. Go to Profile → Models, or tap the model selector above, to add a key for at least one provider.";

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId, initialMessage } = route.params || {};

  const [session, setSession] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [modelSheetOpen, setModelSheetOpen] = useState(false);
  const [providerId, setProviderId] = useState("gemini");
  const [connectedMap, setConnectedMap] = useState({});
  const listRef = useRef(null);
  const bootstrapped = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      (async () => {
        const s = await getSession(sessionId);
        if (alive) setSession(s);
        const active = await getActiveProvider("gemini");
        if (alive) setProviderId(active);
        const map = await getConnectedProviders(listProviders().map((p) => p.id));
        if (alive) setConnectedMap(map);
      })();
      return () => {
        alive = false;
      };
    }, [sessionId])
  );

  useEffect(() => {
    if (session && initialMessage && !bootstrapped.current) {
      bootstrapped.current = true;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const activeLabel = listProviders().find((p) => p.id === providerId)?.label || "Gemini 3.0";

  async function send(message) {
    const msg = (message ?? text).trim();
    if (!msg || !session) return;
    setText("");
    setSending(true);

    const withUser = {
      ...session,
      messages: [...session.messages, { role: "user", text: msg, createdAt: Date.now() }],
    };
    setSession(withUser);
    await saveSession(withUser);
    scrollToEnd();

    const apiKey = await getProviderKey(providerId);
    if (!apiKey) {
      const withReply = {
        ...withUser,
        messages: [
          ...withUser.messages,
          { role: "assistant", text: NO_KEY_REPLY, createdAt: Date.now(), needsKey: true },
        ],
      };
      setSession(withReply);
      await saveSession(withReply);
      setSending(false);
      scrollToEnd();
      return;
    }

    try {
      const priorHistory = withUser.messages
        .slice(0, -1)
        .map((m) => ({ role: m.role, content: m.text }));

      const filesTable = { ...(withUser.files || {}) };
      const result = await runAgentTurn({
        userMessage: msg,
        priorHistory,
        providerId,
        filesTable,
      });

      const assistantMsg = {
        role: "assistant",
        text: result.summary,
        title: result.title,
        planSteps: result.plan_steps,
        files: result.files,
        createdAt: Date.now(),
      };

      const merged = {
        ...withUser,
        title: withUser.messages.length === 1 ? msg.slice(0, 40) : withUser.title,
        messages: [...withUser.messages, assistantMsg],
        planSteps: result.plan_steps || [],
        files: filesTable,
      };
      setSession(merged);
      await saveSession(merged);
    } catch (e) {
      const errMsg = e?.code === "NO_API_KEY" ? NO_KEY_REPLY : `Something went wrong: ${e.message || e}`;
      const merged = {
        ...withUser,
        messages: [...withUser.messages, { role: "assistant", text: errMsg, createdAt: Date.now() }],
      };
      setSession(merged);
      await saveSession(merged);
    } finally {
      setSending(false);
      scrollToEnd();
    }
  }

  function scrollToEnd() {
    requestAnimationFrame(() => listRef.current?.scrollToEnd?.({ animated: true }));
  }

  if (!session) return <View style={styles.root} />;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Header />
      <FlatList
        ref={listRef}
        data={session.messages}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
        renderItem={({ item }) =>
          item.role === "user" ? (
            <View style={styles.userBubbleWrap}>
              <View style={styles.userBubble}>
                <Text style={styles.userBubbleText}>{item.text}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.aiCard}>
              {item.title && <Text style={styles.aiTitle}>{item.title}</Text>}
              <Text style={styles.aiSummary} numberOfLines={4}>{item.text}</Text>
              {!item.needsKey && (
                <View style={styles.reactionRow}>
                  <Ionicons name="arrow-undo-outline" size={18} color={colors.textSecondary} />
                  <Ionicons name="thumbs-up-outline" size={18} color={colors.textSecondary} />
                  <Ionicons name="thumbs-down-outline" size={18} color={colors.textSecondary} />
                  <Ionicons name="copy-outline" size={18} color={colors.textSecondary} />
                  <Ionicons name="ellipsis-horizontal" size={18} color={colors.textSecondary} />
                  <View style={{ flex: 1 }} />
                  <Pressable style={styles.expandBtn} onPress={() => navigation.navigate("PlanPanel", { sessionId })}>
                    <Ionicons name="chevron-down" size={16} color={colors.white} />
                  </Pressable>
                </View>
              )}
              {item.needsKey && (
                <Pressable style={styles.connectBtn} onPress={() => navigation.navigate("Profile")}>
                  <Text style={styles.connectBtnText}>Connect an API key</Text>
                </Pressable>
              )}
            </View>
          )
        }
      />

      <BottomPillBar
        onPlan={() => navigation.navigate("PlanPanel", { sessionId })}
        onFiles={() => navigation.navigate("FilesPanel", { sessionId })}
      />

      <InputCard
        value={text}
        onChangeText={setText}
        onSend={() => send()}
        onOpenModelSelector={() => setModelSheetOpen(true)}
        modelLabel={activeLabel}
        sending={sending}
      />
      <View style={{ height: 12 }} />

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  userBubbleWrap: { alignItems: "flex-end", marginBottom: 12 },
  userBubble: { backgroundColor: colors.black, borderRadius: radius.cardSm, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "82%" },
  userBubbleText: { color: colors.white, fontSize: 15 },
  aiCard: { backgroundColor: colors.surface, borderRadius: radius.cardSm, padding: 14, marginBottom: 12, ...elevation[1] },
  aiTitle: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  aiSummary: { fontSize: 14, color: "#555555", lineHeight: 20 },
  reactionRow: { flexDirection: "row", alignItems: "center", gap: 14, marginTop: 12 },
  expandBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.black, alignItems: "center", justifyContent: "center" },
  connectBtn: { marginTop: 12, alignSelf: "flex-start", backgroundColor: colors.black, borderRadius: radius.button, paddingHorizontal: 14, paddingVertical: 8 },
  connectBtnText: { color: colors.white, fontWeight: "600", fontSize: 13 },
});

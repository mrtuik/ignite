import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, radius } from "../theme/theme";
import PlanTimeline from "../components/PlanTimeline";
import BottomPillBar from "../components/BottomPillBar";
import { getSession } from "../lib/storage";

export default function PlanPanelScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { sessionId } = route.params || {};
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (sessionId) getSession(sessionId).then(setSession);
  }, [sessionId]);

  const steps = session?.planSteps || [];
  const totalSeconds = steps.reduce((sum, s) => sum + (s.duration_s || 0), 0);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const lastAssistant = [...(session?.messages || [])].reverse().find((m) => m.role === "assistant");

  return (
    <View style={styles.backdrop}>
      <Pressable style={styles.backdropTouch} onPress={() => navigation.goBack()} />
      <SafeAreaView style={styles.sheet} edges={["bottom"]}>
        <View style={styles.handle} />
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.title}>Plan</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.divider} />

        <View style={styles.metaRow}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.metaText}>
            {totalSeconds > 0 ? `Worked for ${minutes}m ${seconds}s` : "No work logged yet"}
          </Text>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <PlanTimeline steps={steps} />

          {lastAssistant && !lastAssistant.needsKey && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryText}>
                <Text style={{ fontWeight: "700" }}>Done — </Text>
                {lastAssistant.text}
              </Text>
            </View>
          )}
        </ScrollView>

        <BottomPillBar
          active="plan"
          onPlan={() => {}}
          onFiles={() => navigation.replace("FilesPanel", { sessionId })}
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
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: "700", color: colors.textPrimary },
  divider: { height: 1, backgroundColor: colors.border },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 14 },
  metaText: { fontSize: 13, color: colors.textSecondary },
  summaryCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.cardSm, padding: 16, marginTop: 8 },
  summaryText: { fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
});

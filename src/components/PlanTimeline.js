import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/theme";

function TimelineItem({ step }) {
  const [expanded, setExpanded] = useState(false);
  const isThought = step.type === "thought";

  return (
    <View style={styles.itemWrap}>
      <View style={styles.rail}>
        <View style={[styles.iconCircle, isThought ? styles.thoughtBg : styles.actionBg]}>
          <Ionicons
            name={isThought ? "bulb-outline" : "terminal-outline"}
            size={16}
            color={colors.textPrimary}
          />
        </View>
        <View style={styles.railLine} />
      </View>
      <Pressable style={styles.content} onPress={() => setExpanded((v) => !v)}>
        <View style={styles.rowTop}>
          <Text style={styles.label}>
            {isThought ? `Thought for ${step.duration_s ?? 1}s` : step.label}
          </Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.textSecondary}
          />
        </View>
        {expanded && (
          <View style={isThought ? styles.thoughtDetail : styles.actionDetail}>
            <Text style={isThought ? styles.thoughtDetailText : styles.actionDetailText}>
              {step.detail || "No further detail."}
            </Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

export default function PlanTimeline({ steps }) {
  if (!steps || steps.length === 0) {
    return <Text style={styles.empty}>No plan yet — send a prompt to get started.</Text>;
  }
  return (
    <View>
      {steps.map((step, i) => (
        <TimelineItem key={i} step={step} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  itemWrap: { flexDirection: "row" },
  rail: { alignItems: "center", width: 32, marginRight: 12 },
  iconCircle: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  thoughtBg: { backgroundColor: colors.rowHoverBg },
  actionBg: { backgroundColor: colors.chipBg },
  railLine: { flex: 1, width: 2, backgroundColor: colors.border, marginTop: 4 },
  content: { flex: 1, paddingBottom: 16 },
  rowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 4 },
  label: { fontSize: 15, color: colors.textPrimary, flexShrink: 1 },
  thoughtDetail: { marginTop: 8, paddingLeft: 4 },
  thoughtDetailText: { fontSize: 13, color: colors.textSecondary, lineHeight: 19 },
  actionDetail: { marginTop: 8, backgroundColor: colors.rowHoverBg, borderRadius: 8, padding: 8 },
  actionDetailText: { fontFamily: "monospace", fontSize: 12, color: colors.textPrimary },
  empty: { color: colors.textSecondary, fontSize: 14, paddingVertical: 24, textAlign: "center" },
});

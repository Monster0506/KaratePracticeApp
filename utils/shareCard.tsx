import { forwardRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Chip, Dialog, Portal, Button } from "react-native-paper";
import { ACHIEVEMENTS } from "@/utils/achievement"; // Assuming ACHIEVEMENTS is in a constants file
import QRBlock from "@/components/QRBlock";
interface Props {
  username?: string;
  sessions: number;
  techniques: number;
  earned: string[]; // Assuming earned is an array of achievement IDs
}

export const ShareCard = forwardRef<View, Props>(
  ({ username = "Karateka", sessions, techniques, earned }, ref) => {
    const query = new URLSearchParams({
      u: username,
      s: String(sessions),
      t: String(techniques),
      e: String(earned.join(",")),
    }).toString();

    const [selectedAchievement, setSelectedAchievement] = useState<
      null | (typeof ACHIEVEMENTS)[number]
    >(null);
    const qrPayload = `https://karateapp.monster0506.dev/?${query}`;
    return (
      <View ref={ref} style={styles.card}>
        <Text variant="titleLarge">{username}'s Progress</Text>
        <Text style={styles.big}>{sessions}</Text>
        <Text>Sessions</Text>
        <Text style={styles.big}>{techniques}</Text>
        <Text>Techniques Practiced</Text>

        <View style={styles.badges}>
          {ACHIEVEMENTS.filter((a) => earned.includes(a.id)).map((a) => (
            <Chip
              key={a.id}
              compact
              style={styles.chip}
              onPress={() => setSelectedAchievement(a)}
            >
              {a.label}
            </Chip>
          ))}
        </View>

        <View style={styles.qr}>
          <QRBlock value={qrPayload} />
        </View>

        <Portal>
          <Dialog
            visible={!!selectedAchievement}
            onDismiss={() => setSelectedAchievement(null)}
          >
            <Dialog.Title>{selectedAchievement?.label}</Dialog.Title>
            <Dialog.Content>
              <Text>{selectedAchievement?.description}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setSelectedAchievement(null)}>
                Close
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    width: 280,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 4,
    backgroundColor: "#222",
  },
  big: { fontSize: 32, fontWeight: "600" },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 },
  chip: { backgroundColor: "#444" },
  qr: { marginTop: 12 },
});

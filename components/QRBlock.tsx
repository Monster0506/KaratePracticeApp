import React from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRProps {
  value: string;
}

export default function QRBlock({ value }: QRProps) {
  return (
    <View style={styles.wrapper}>
      <QRCode value={value} size={220} backgroundColor="white" color="black" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignSelf: "center",
  },
});

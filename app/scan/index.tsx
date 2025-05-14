import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  CameraView,
  useCameraPermissions,
  BarcodeScanningResult,
} from "expo-camera";
import { Text, Button, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);

    if (data.startsWith("http")) {
      Linking.openURL(data); // opens in external browser
    } else {
      alert("Invalid QR Code");
    }
  };

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>Camera access is required to scan QR codes.</Text>
        <Button onPress={requestPermission}>Grant Permission</Button>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <CameraView
        style={StyleSheet.absoluteFill}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={handleBarcodeScanned}
      />
      {scanned && (
        <Button
          mode="contained"
          onPress={() => setScanned(false)}
          style={styles.resetButton}
        >
          Scan Again
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  resetButton: {
    position: "absolute",
    bottom: 32,
    alignSelf: "center",
  },
});

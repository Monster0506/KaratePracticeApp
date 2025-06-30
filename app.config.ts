import { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  // Spread existing configuration to inherit any properties already defined in 'config'
  ...config,

  // Top-level Expo properties from the old JSON format
  name: "KarateApp",
  slug: "KarateApp",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "karateapp",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  owner: "monster0506",

  // Splash screen configuration (extracted from the 'expo-splash-screen' plugin in the old JSON)
  // The 'imageWidth' property is specific to the plugin's configuration and not a standard
  // property of the top-level 'splash' object, so it's omitted here.
  splash: {
    image: "./assets/images/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },

  // Notification configuration (extracted from the 'expo-notifications' plugin in the old JSON)
  notification: {
    icon: "./assets/images/icon.png",
    color: "#ffffff",
    iosDisplayInForeground: true,
  },

  // iOS-specific configuration
  ios: {
    ...config.ios, // Spread existing iOS config
    supportsTablet: true,
    infoPlist: {
      ...config.ios?.infoPlist, // Merge with any existing infoPlist entries
      NSCameraUsageDescription:
        "This app uses the camera to scan QR codes for stat sharing.",
      NSUserNotificationUsageDescription:
        "This app sends daily practice reminders.",
    },
  },

  // Android-specific configuration
  android: {
    ...config.android, // Spread existing Android config
    // Use the dynamic environment variable for googleServicesFile as per the 'current' template
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    edgeToEdgeEnabled: true,
    package: "com.monster0506.KarateApp",
    permissions: ["CAMERA", "NOTIFICATIONS"],
  },

  // Web-specific configuration
  web: {
    ...config.web, // Spread existing Web config
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },

  // Experimental features
  experiments: {
    ...config.experiments, // Spread existing experiments
    typedRoutes: true,
  },

  // Extra fields accessible via Constants.expoConfig.extra
  extra: {
    ...config.extra, // Spread existing extra
    router: {},
    eas: {
      projectId: "7832cb16-7306-44ad-8bf0-596c8347f248",
    },
  },

  // Plugins list.
  // Configuration that could be moved to top-level 'splash' or 'notification' is removed from plugin objects here.
  // The '@react-native-firebase/app' plugin's Android 'googleServicesFile' path is made dynamic.
  plugins: [
    // This array will effectively replace any plugins defined in the initial 'config' object.
    [
      "@react-native-firebase/app",
      {
        ios: {
          googleServicesFile: "./GoogleService-Info.plist",
        },
        android: {
          // Use the dynamic environment variable for googleServicesFile
          googleServicesFile:
            process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json",
        },
      },
    ],
    "expo-router",
    // The configuration for 'expo-splash-screen' is now at the top-level 'splash' key.
    "expo-splash-screen",
    [
      "expo-camera",
      {
        cameraPermission:
          "Allow KarateApp to access your camera to scan QR codes",
      },
    ],
    // The configuration for 'expo-notifications' is now at the top-level 'notification' key.
    "expo-notifications",
    "expo-build-properties",
    "expo-web-browser",
  ],
});
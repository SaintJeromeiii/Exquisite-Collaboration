import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.exquisitecollab.desk",
  appName: "EXQ Desk",
  webDir: "out",
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      backgroundColor: "#05070a",
      launchAutoHide: true,
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#05070a",
      overlaysWebView: false,
    },
    LocalNotifications: {
      iconColor: "#c9a227",
    },
  },
};

export default config;

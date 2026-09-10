import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.exquisitecollab.desk",
  appName: "Exquisite",
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
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;

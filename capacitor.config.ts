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
      style: "LIGHT",
      backgroundColor: "#05070a",
    },
  },
};

export default config;

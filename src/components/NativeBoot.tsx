"use client";

import { useEffect } from "react";

export function NativeBoot() {
  useEffect(() => {
    let remove: (() => void) | undefined;

    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      const { StatusBar, Style } = await import("@capacitor/status-bar");
      const { SplashScreen } = await import("@capacitor/splash-screen");
      const { App } = await import("@capacitor/app");

      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#05070a" });
      await SplashScreen.hide();

      const handle = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack || window.history.length > 1) {
          window.history.back();
          return;
        }
        void App.exitApp();
      });
      remove = () => {
        void handle.remove();
      };
    })();

    return () => remove?.();
  }, []);

  return null;
}

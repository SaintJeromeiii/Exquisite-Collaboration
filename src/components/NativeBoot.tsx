"use client";

import { useEffect } from "react";
import { extraHref } from "@/lib/drop-reminders";

function syncSystemInset() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  const extra = vv
    ? Math.max(0, window.innerHeight - (vv.height + vv.offsetTop))
    : 0;
  root.style.setProperty("--exq-sys-inset", `${Math.round(extra)}px`);
}

export function NativeBoot() {
  useEffect(() => {
    let remove: (() => void) | undefined;
    let offViewport: (() => void) | undefined;

    void (async () => {
      const { Capacitor } = await import("@capacitor/core");
      if (!Capacitor.isNativePlatform()) return;

      syncSystemInset();
      const vv = window.visualViewport;
      const onResize = () => syncSystemInset();
      window.addEventListener("resize", onResize);
      vv?.addEventListener("resize", onResize);
      vv?.addEventListener("scroll", onResize);
      offViewport = () => {
        window.removeEventListener("resize", onResize);
        vv?.removeEventListener("resize", onResize);
        vv?.removeEventListener("scroll", onResize);
      };

      const { StatusBar, Style } = await import("@capacitor/status-bar");
      const { SplashScreen } = await import("@capacitor/splash-screen");
      const { App } = await import("@capacitor/app");
      const { LocalNotifications } = await import(
        "@capacitor/local-notifications"
      );

      await StatusBar.setStyle({ style: Style.Dark });
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
      } catch {
        // Android 15+ ignores overlay control; CSS insets handle the bars.
      }
      try {
        await StatusBar.setBackgroundColor({ color: "#05070a" });
      } catch {
        // Same Android 15 limitation.
      }
      await SplashScreen.hide();

      const back = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack || window.history.length > 1) {
          window.history.back();
          return;
        }
        void App.exitApp();
      });
      const tap = await LocalNotifications.addListener(
        "localNotificationActionPerformed",
        (event) => {
          const href = extraHref(event.notification.extra);
          if (href) window.location.assign(href);
        },
      );
      remove = () => {
        void back.remove();
        void tap.remove();
      };
    })();

    return () => {
      offViewport?.();
      remove?.();
    };
  }, []);

  return null;
}

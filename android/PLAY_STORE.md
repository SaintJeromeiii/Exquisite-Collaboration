# EXQ Desk on Google Play

The web terminal is wrapped as a native Android app (`com.exquisitecollab.desk`) so you can install it on a phone and ship updates through the Play Store.

Capacitor 8 needs JDK 21. This Mac can use Android Studio’s bundled JDK automatically when you run the npm scripts.

## Install on your Android (today)

1. Connect the phone with USB debugging, or use an emulator.
2. From the repo root:

```bash
npm run android:apk
```

3. Sideload `android/app/build/outputs/apk/debug/app-debug.apk`.

Or open the project in Android Studio:

```bash
npm run android:open
```

## First Play Store listing

You do this once in your own Google account. Play Console is not something I can submit for you.

1. Create a [Google Play Developer](https://play.google.com/console) account ($25 one-time).
2. Create an app named **EXQ Desk**.
3. Privacy policy URL (GitHub Pages, always public):

   `https://saintjeromeiii.github.io/Exquisite-Collaboration/privacy/`

   That page lives in `docs/privacy/` and deploys on every push to `main`. After the first push, open the repo → Settings → Pages and set Source to **GitHub Actions** if it is not already.
4. Upload listing assets:
   - App icon: `public/icons/icon-512.png`
   - Feature graphic: `assets/play-feature.png`
   - Phone screenshots of the desk (MKT, LEDGER, a dossier)
5. Complete Data safety: no collected data, no shared data, local storage only.
6. Content rating questionnaire (likely Everyone / tools).

## Release signing (required for Play)

Create a keystore **once** and keep it. Losing it means you cannot update the same listing.

```bash
keytool -genkeypair -v \
  -keystore android/exq-release.jks \
  -keyalg RSA -keysize 2048 -validity 36500 \
  -alias exq
```

Copy `android/key.properties.example` to `android/key.properties` and fill in the passwords. Both files stay off git.

## Every store update

1. Bump `versionCode` (must go up by 1) and `versionName` in `android/app/build.gradle`.
2. Build the Play bundle:

```bash
npm run android:aab
```

3. Upload `android/app/build/outputs/bundle/release/app-release.aab` to a production or internal-testing track.
4. After Google reviews it, phones update through the Play Store.

The first upload can take a few days to review. Later updates are usually faster.

## Short description (80 characters)

Collab sneaker terminal. Follow and endorse any drop — not just celebrity.

## Full description (draft)

EXQ Desk is a Wall Street-style information terminal for sneaker collaborations. Cover celebrity, boutique, designer, athlete, retailer, and brand-on-brand names. Follow a collab to put it on coverage. Endorse to stamp it as the desk call. No inventory. No buy/sell flow.

Market figures in this version are desk estimates shipped with the app.

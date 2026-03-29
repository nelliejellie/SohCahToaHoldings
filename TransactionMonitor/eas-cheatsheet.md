# EAS Build Commands Cheatsheet

Since your project (`TransactionMonitor`) is built on Expo SDK 55 (Canary) and utilizes native libraries, you must use Expo Application Services (EAS) to orchestrate cloud builds instead of standard Expo Go. 

Here are the master commands for every scenario:

## 1. Development Builds
Development builds act as your own "Custom Expo Go". They contain all your custom native modules. Once installed on your phone, you run `npx expo start --dev-client` and it connects locally just like Expo Go!

**Android (APK):**
```bash
eas build --profile development --platform android
```

**iOS (Simulator or Physical Device):**
*(Requires an active Apple Developer account to sign the certificates)*
```bash
eas build --profile development --platform ios
```

---

## 2. Preview Builds
Preview builds skip the local development server completely. They bundle the entire app up exactly as it will appear in production, allowing you to share testable APKs to stakeholders before full releases.

**Android (Standalone APK):**
```bash
eas build --profile preview --platform android
```

**iOS (AdHoc / Internal Testing):**
```bash
eas build --profile preview --platform ios
```

---

## 3. Production Builds
Production builds are heavily compressed, signed, and formatted explicitly for App Store submission (generating `.aab` for Android and `.ipa` for iOS). **You cannot install these directly onto a physical phone via USB.**

**Android (Play Store - AAB):**
```bash
eas build --profile production --platform android
```

**iOS (App Store Submission):**
```bash
eas build --profile production --platform ios
```

---

## 🌩️ Over-The-Air (OTA) Updates
OTA updates allow you to push JavaScript and asset framework changes directly to your users' devices *without* them needing to download a new APK or wait for App Store reviews!

**Important Rule:** OTA updates only work for UI/Javascript changes. If you add a *new native library* (e.g., `npx expo install react-native-maps`), you must build a completely new APK/AAB as described above.

### Step 1: Initialize EAS Update
First, install the module and configure your project for secure updates:
```bash
npx expo install expo-updates
eas update:configure
```

### Step 2: Push an Update
Once you make changes to your React/TypeScript code, you can broadcast them immediately to all distributed devices.

**Push to Preview branch (Staging APKs):**
```bash
eas update --branch preview --message "Fixed Dashboard gloss bug"
```

**Push to Production branch (Live Play Store App):**
```bash
eas update --branch production --message "Launched new feature"
```

*Crucial Note: The `--branch` flag must strictly match the channel the user's APK was originally built on. If you built the APK they downloaded using `--profile preview`, that device is automatically listening for updates on the `preview` branch!*

---

## ⚡ Useful Execution Commands
Once you have installed the **Development Build** onto your phone, use this command to boot up the local dev server so the phone can connect to your code changes:

```bash
npx expo start --dev-client
```

*Note: If you ever install a new native package via `npx expo install` (like Maps, Camera, etc.), you must run the Development Build command again so the server compiles the new native code!*

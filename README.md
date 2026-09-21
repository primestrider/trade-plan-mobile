# React Native Expo Boilerplate

A modern and production-ready React Native boilerplate built with Expo, Expo Router, TypeScript, and a collection of carefully selected libraries for state management, data fetching, forms, validation, storage, animations, and internationalization.

## Tech Stack

This boilerplate includes:

- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Axios
- React Native MMKV
- React Native Reanimated
- React Native Worklets
- React Native Gesture Handler
- React Native Keyboard Controller
- Shopify FlashList
- Expo Image
- Expo Localization
- Expo Font

## Styling and Dark Mode

Utility styles come from `@/styles`, split by whether they depend on the theme.

Theme-neutral utilities (layout, spacing, sizing, typography) and raw palette swatches are static:

```tsx
import { styles, view } from "@/styles";

<View style={view(styles.flex1, styles.p4, styles.roundedLg)} />;
```

Semantic colors (`bgBackground`, `textForeground`, `borderBorder`, ...) depend on the active
color scheme, so they are only reachable through `useStyles()`. Name the result `styles` and the
rest of the component stays unchanged:

```tsx
import { text, useStyles, view } from "@/styles";

export function Card() {
  const styles = useStyles();

  return (
    <View style={view(styles.p4, styles.bgCard, styles.borderBorder)}>
      <Text style={text(styles.textBase, styles.textForeground)}>Themed</Text>
    </View>
  );
}
```

Keeping semantic colors off the static object is deliberate: a surface can never be silently
pinned to light mode.

For raw color values — native chrome, icon tints, animated colors — use `useTheme()`:

```tsx
const { colors, isDark, mode, setMode } = useTheme();
```

### Theme preference

`<ThemeToggle />` (from `@/shared/components`) switches between **System**, **Light**, and
**Dark**. `System` keeps following the OS setting; the choice is persisted to MMKV and
rehydrated synchronously, so the app never flashes the wrong theme on launch. See the
`/example/theme` screen.

Two things stay light regardless of the selected theme:

- Shadow utilities use hardcoded `rgba(0, 0, 0, ...)`, so they are barely visible on dark surfaces.
- The splash screen and adaptive icon colors are build-time config rendered before JavaScript starts.

## Requirements

Before starting, make sure the following tools are installed:

- Node.js
- npm
- Android Studio
- Android SDK
- JDK compatible with the current Expo and React Native versions
- ADB for physical Android device testing

For iOS development:

- macOS
- Xcode
- CocoaPods

## Getting Started

Clone the repository:

```bash
git clone <repository-url>
cd rn-expo-boilerplate
```

Install dependencies:

```bash
npm install
```

Start the Expo development server:

```bash
npm start
```

## Running the Application

### Android

Run the application on an Android emulator or connected physical device:

```bash
npm run android
```

This command runs:

```bash
expo run:android
```

If the native Android project does not exist yet, Expo will generate it automatically.

### iOS

Run the application on iOS:

```bash
npm run ios
```

> iOS native builds require macOS and Xcode.

### Web

Run the application in a browser:

```bash
npm run web
```

## Available Scripts

| Command                         | Description                                                                  |
| ------------------------------- | ---------------------------------------------------------------------------- |
| `npm start`                     | Starts the Expo development server                                           |
| `npm run android`               | Builds and runs the Android development application                          |
| `npm run android:release`       | Builds a release APK for all supported Android ABIs                          |
| `npm run android:release:clean` | Regenerates the Android native project from scratch and builds a release APK |
| `npm run ios`                   | Builds and runs the iOS application                                          |
| `npm run web`                   | Starts the web application                                                   |
| `npm run lint`                  | Runs the Expo linter                                                         |
| `npm test`                      | Runs the Jest unit test suite                                                |
| `npm run test:watch`            | Runs the tests in watch mode                                                 |
| `npm run test:coverage`         | Runs the tests and reports coverage                                          |
| `npm run reset-project`         | Runs the project reset script                                                |

## Android Release Build

The project includes a custom Android release build script:

```text
scripts/build-android-release.mjs
```

To create a normal Android release build:

```bash
npm run android:release
```

The build process:

```text
Expo config synchronization
        ↓
Android native project
        ↓
Gradle release build
        ↓
Universal release APK
```

The resulting APK is located at:

```text
android/app/build/outputs/apk/release/app-release.apk
```

### Supported Android Architectures

The release build supports:

```text
armeabi-v7a
arm64-v8a
x86
x86_64
```

This allows the APK to run on a broad range of physical Android devices and Android emulators.

The build command internally uses:

```bash
gradlew assembleRelease -PreactNativeArchitectures=armeabi-v7a,arm64-v8a,x86,x86_64
```

> A universal APK containing all ABIs will be larger than a single-architecture APK. For Google Play production distribution, consider using an Android App Bundle (`.aab`) so Google Play can deliver architecture-specific artifacts to each device.

## Clean Android Release Build

For most builds, use:

```bash
npm run android:release
```

If you encounter native build problems, stale configuration, CMake issues, or corrupted native build state, run:

```bash
npm run android:release:clean
```

The clean build runs:

```bash
expo prebuild --clean --platform android
```

This deletes and regenerates the native Android project before building the release APK.

> Do not use the clean build unnecessarily. A normal build is usually faster because Gradle, CMake, and native dependencies can reuse existing build caches.

## App Versioning

The application version is sourced from `package.json`:

```json
{
  "version": "1.0.1"
}
```

The Expo configuration reads this value:

```ts
import packageJson from "./package.json";

const config: ExpoConfig = {
  version: packageJson.version,
};
```

For Android, `versionCode` can be generated automatically from the semantic version.

Example:

```ts
function getVersionCode(version: string): number {
  const [major, minor, patch] = version.split(".").map(Number);

  return major * 10000 + minor * 100 + patch;
}
```

Example mappings:

| Version | Android versionCode |
| ------- | ------------------: |
| `1.0.0` |             `10000` |
| `1.0.1` |             `10001` |
| `1.1.0` |             `10100` |
| `2.0.0` |             `20000` |

To increase the patch version without automatically creating a Git commit or tag:

```bash
npm version patch --no-git-tag-version
```

Then create a new release build:

```bash
npm run android:release
```

## Firebase App Distribution

### Automatic distribution on merge to `main`

Merging to `main` triggers `.github/workflows/deploy-android.yml`, which runs the test suite, prebuilds the Android project, builds a signed release APK, verifies it was signed with the release key, and uploads it to Firebase App Distribution. It can also be run manually from **Actions → Distribute Android → Run workflow**.

Release signing is injected by `configs/signing.config.ts`, not by `android/app/build.gradle`. The `android/` directory is gitignored and regenerated on every prebuild, so edits made there do not survive. When the keystore environment variables are absent the build falls back to the debug key, which keeps a local `npm run android:release` working without any keystore.

#### Setup

The pipeline needs a Firebase project, a service account key, a release keystore, and a GitHub environment named `app-distribution` holding five secrets and two variables.

**[docs/firebase-app-distribution-setup.md](docs/firebase-app-distribution-setup.md)** walks through all of it step by step, covers what to change when cloning this boilerplate into a new project, and documents the failures hit during the first setup along with their causes.

### Manual upload

The generated release APK can be uploaded to Firebase App Distribution:

```text
android/app/build/outputs/apk/release/app-release.apk
```

A release APK is standalone and includes the JavaScript bundle, so testers do not need to run Metro Bundler.

Before uploading a new release, make sure:

- `version` has been updated.
- Android `versionCode` is greater than the previous release.
- The APK is signed consistently with previous builds.
- The required Android ABI is included in the APK.

## Android ABI Troubleshooting

If Android installation fails with:

```text
INSTALL_FAILED_NO_MATCHING_ABIS
```

check the device ABI:

```bash
adb shell getprop ro.product.cpu.abilist
```

Example:

```text
arm64-v8a
```

On PowerShell, inspect the ABIs included in an APK with:

```powershell
tar -tf android/app/build/outputs/apk/release/app-release.apk |
  Select-String "^lib/" |
  ForEach-Object { ($_ -split "/")[1] } |
  Sort-Object -Unique
```

For the universal release build, the expected output is:

```text
arm64-v8a
armeabi-v7a
x86
x86_64
```

The APK must contain at least one ABI supported by the target device.

## React Native Reanimated Build Issues on Windows

React Native Reanimated uses native C++ code and relies on tools such as CMake and Ninja during Android builds. Windows users may encounter native build errors, especially when building React Native's New Architecture.

Common errors may include:

```text
ninja: error: manifest 'build.ninja' still dirty after 100 tries
```

or errors involving:

```text
CMake
Ninja
.cxx
externalNativeBuild
react-native-reanimated
```

Refer to the official Reanimated documentation for current Windows-specific setup and troubleshooting guidance:

https://docs.swmansion.com/react-native-reanimated/docs/guides/building-on-windows/

import { execSync } from "node:child_process";

const gradleCommand =
  process.platform === "win32" ? "gradlew.bat" : "./gradlew";

const isCleanBuild = process.argv.includes("--clean");
const shouldPrebuild = process.argv.includes("--prebuild") || isCleanBuild;

const architectures = ["armeabi-v7a", "arm64-v8a", "x86", "x86_64"].join(",");

const buildEnv = {
  ...process.env,
  NODE_ENV: "production",
};

const run = (command, options = {}) => {
  execSync(command, {
    stdio: "inherit",
    env: buildEnv,
    ...options,
  });
};

// Only prebuild when asked for
if (shouldPrebuild) {
  console.log(
    isCleanBuild
      ? "\nRegenerating Android native project from scratch...\n"
      : "\nSyncing Expo config to Android native project...\n",
  );

  run(
    isCleanBuild
      ? "npx expo prebuild --clean --platform android"
      : "npx expo prebuild --platform android",
  );
}

console.log(`\nBuilding Android release APK for: ${architectures}\n`);

run(
  `${gradleCommand} assembleRelease -PreactNativeArchitectures=${architectures}`,
  {
    cwd: "android",
  },
);

console.log(`
✅ Build successful!

APK:
android/app/build/outputs/apk/release/app-release.apk
`);

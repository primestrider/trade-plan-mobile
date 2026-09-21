import {
  addReleaseSigningConfig,
} from "../../configs/signing.config";

const BUILD_GRADLE = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
            shrinkResources enableShrinkResources.toBoolean()
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}`;

describe("addReleaseSigningConfig", () => {
  it("adds a release signingConfig that reads env", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(
      'storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")',
    );
    expect(result).toContain(
      'storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
    );
    expect(result).toContain('keyAlias System.getenv("ANDROID_KEY_ALIAS")');
    expect(result).toContain(
      'keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
    );
  });

  it("makes buildTypes.release pick its signing config conditionally", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(
      'signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug',
    );
  });

  it("leaves buildTypes.debug untouched", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(`        debug {
            signingConfig signingConfigs.debug
        }`);
  });

  it("is idempotent — a second transform changes nothing", () => {
    const once = addReleaseSigningConfig(BUILD_GRADLE);
    const twice = addReleaseSigningConfig(once);

    expect(twice).toBe(once);
  });

  it("throws when the signingConfigs.debug block is missing", () => {
    const withoutDebugBlock = BUILD_GRADLE.replace(
      "storeFile file('debug.keystore')",
      "storeFile file('other.keystore')",
    );

    expect(() => addReleaseSigningConfig(withoutDebugBlock)).toThrow(
      /signingConfigs.*debug.*not found/i,
    );
  });

  it("throws when the signing line in buildTypes.release is missing", () => {
    const withoutReleaseAnchor = BUILD_GRADLE.replace(
      "            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'",
      "            def somethingElse = true",
    );

    expect(() => addReleaseSigningConfig(withoutReleaseAnchor)).toThrow(
      /buildTypes.*release.*not found/i,
    );
  });
});

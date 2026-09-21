import "tsx/cjs"; // Add this to import TypeScript files

import { ExpoConfig } from "expo/config";
import { androidConfig } from "./configs/android.config";
import { iosConfig } from "./configs/ios.config";
import { plugins } from "./configs/plugins.config";
import { withReleaseSigning } from "./configs/signing.config";
import { webConfig } from "./configs/web.config";
import packageJson from "./package.json";

const config: ExpoConfig = {
  name: process.env.EXPO_PUBLIC_APP_NAME ?? packageJson.name,
  slug: "trade-plan-mobile",
  version: packageJson.version,

  orientation: "portrait",
  icon: "./assets/images/icon.png",

  scheme: "tradeplanmobile",
  userInterfaceStyle: "automatic",

  android: androidConfig,
  ios: iosConfig,
  web: webConfig,

  plugins,

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
};

/**
 * The plugin is applied to the config directly instead of through the
 * `plugins` array: `ExpoConfig["plugins"]` is typed
 * `(string | [] | [string] | [string, any])[]`, which does not accept a
 * function — which is why `plugins.config.ts` has to write
 * `fontPlugin as [string, any]`. This form type-checks without a cast.
 */
export default withReleaseSigning(config);

// iOS 27 closes the app at launch unless it adopts the scene lifecycle. Expo ships the delegate;
// this plugin points the manifest at it and stops AppDelegate from creating the window itself.
const { withDangerousMod, withInfoPlist } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const OLD_START = `#if os(iOS) || os(tvOS)
    window = UIWindow(frame: UIScreen.main.bounds)
    factory.startReactNative(
      withModuleName: "main",
      in: window,
      launchOptions: launchOptions)
#endif

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`;

const NEW_START = `    // iOS 27 traps at launch unless the app uses scenes. ExpoAppSceneDelegate creates the window.
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)`;

function withIosScenes(config) {
  config = withInfoPlist(config, (cfg) => {
    cfg.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: "Default Configuration",
            UISceneDelegateClassName: "EXExpoAppSceneDelegate",
          },
        ],
      },
    };
    return cfg;
  });

  return withDangerousMod(config, [
    "ios",
    (cfg) => {
      const file = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName, "AppDelegate.swift");
      if (!fs.existsSync(file)) return cfg;
      let source = fs.readFileSync(file, "utf8");
      source = source.replace(
        "class AppDelegate: ExpoAppDelegate {",
        "class AppDelegate: ExpoAppDelegate, ExpoReactNativeFactoryProvider {",
      );
      if (source.includes(OLD_START)) source = source.replace(OLD_START, NEW_START);
      fs.writeFileSync(file, source);
      return cfg;
    },
  ]);
}

module.exports = withIosScenes;

// Adds the App Intent that lets the Shortcuts app save a payment in Fynn without opening it.
// Expo Go cannot load this: it only exists in a build made with `npx expo run:ios` or EAS.
const { IOSConfig, withDangerousMod, withXcodeProject } = require("@expo/config-plugins");
const fs = require("node:fs");
const path = require("node:path");

const FILE = "FynnCapture.swift";

module.exports = function withFynnCapture(config) {
  config = withDangerousMod(config, [
    "ios",
    (cfg) => {
      const source = path.join(cfg.modRequest.projectRoot, "plugins", "ios", FILE);
      const target = path.join(cfg.modRequest.platformProjectRoot, cfg.modRequest.projectName, FILE);
      fs.copyFileSync(source, target);
      return cfg;
    },
  ]);

  return withXcodeProject(config, (cfg) => {
    IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
      filepath: `${cfg.modRequest.projectName}/${FILE}`,
      groupName: cfg.modRequest.projectName,
      project: cfg.modResults,
    });
    return cfg;
  });
};

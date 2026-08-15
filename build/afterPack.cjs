const fs = require("fs");
const path = require("path");

// Keep English (US) always, plus Filipino for local users.
const KEEP_LOCALES = new Set(["en-US.pak", "fil.pak"]);

exports.default = async function afterPack(context) {
  const { appOutDir, electronPlatformName } = context;

  // Locales live in different places per platform.
  const localesDir =
    electronPlatformName === "darwin"
      ? path.join(
          appOutDir,
          `${context.packager.appInfo.productFilename}.app`,
          "Contents",
          "Resources",
          "locales"
        )
      : path.join(appOutDir, "locales");

  if (!fs.existsSync(localesDir)) {
    console.log(`[afterPack] locales dir not found, skipping: ${localesDir}`);
    return;
  }

  const files = fs.readdirSync(localesDir);
  let removed = 0;
  let savedBytes = 0;

  for (const file of files) {
    if (!file.endsWith(".pak") || KEEP_LOCALES.has(file)) continue;
    const fullPath = path.join(localesDir, file);
    savedBytes += fs.statSync(fullPath).size;
    fs.unlinkSync(fullPath);
    removed++;
  }

  console.log(
    `[afterPack] removed ${removed} unused locale files, saved ~${(
      savedBytes /
      1024 /
      1024
    ).toFixed(1)}MB`
  );
};
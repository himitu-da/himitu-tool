const {
  getTodayISO,
  parseSemver,
  bumpVersion,
  readMetadata,
  writeMetadata,
  parseArgMap,
} = require("./tool-version-utils");

function printUsage() {
  console.log("Usage:");
  console.log("  npm run tools:version:update -- --id=timer --bump=patch --summary=Fix bug");
  console.log("  npm run tools:version:update -- --id=timer --version=2.0.0 --summary=Major refactor");
}

function run() {
  const args = parseArgMap(process.argv.slice(2));
  const id = args.id;
  const bump = args.bump;
  const explicitVersion = args.version;
  const summary = typeof args.summary === "string" ? args.summary : "Maintenance update";

  if (!id) {
    console.error("Error: --id is required.");
    printUsage();
    process.exit(1);
  }

  if (!bump && !explicitVersion) {
    console.error("Error: either --bump or --version is required.");
    printUsage();
    process.exit(1);
  }

  if (bump && explicitVersion) {
    console.error("Error: use either --bump or --version, not both.");
    printUsage();
    process.exit(1);
  }

  if (bump && !["major", "minor", "patch"].includes(bump)) {
    console.error("Error: --bump must be major, minor, or patch.");
    process.exit(1);
  }

  if (explicitVersion) {
    parseSemver(explicitVersion);
  }

  const metadata = readMetadata();
  if (!metadata) {
    console.error("Error: src/app/tool-versions.json was not found. Run npm run tools:version:init first.");
    process.exit(1);
  }

  const tools = [...metadata.tools];
  const index = tools.findIndex((tool) => tool.id === id);

  if (index === -1) {
    console.error(`Error: tool id '${id}' was not found in metadata.`);
    process.exit(1);
  }

  const target = { ...tools[index] };
  const currentVersion = target.version || "1.0.0";
  const nextVersion = explicitVersion || bumpVersion(currentVersion, bump);
  const today = getTodayISO();

  target.version = nextVersion;
  target.updatedAt = today;
  target.changeSummary = summary;

  const history = Array.isArray(target.history) ? [...target.history] : [];
  history.push({
    version: nextVersion,
    updatedAt: today,
    summary,
  });
  target.history = history;

  tools[index] = target;

  writeMetadata({ schemaVersion: 1, generatedAt: today, tools });

  console.log(`Updated ${id}`);
  console.log(`  version: ${currentVersion} -> ${nextVersion}`);
  console.log(`  updatedAt: ${today}`);
  console.log(`  summary: ${summary}`);
}

run();

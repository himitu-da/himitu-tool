const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT_DIR, "src", "app");
const META_PATH = path.join(APP_DIR, "tool-versions.json");

function getTodayISO() {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: process.env.TOOL_VERSION_TZ || "Asia/Tokyo",
  });
  return formatter.format(new Date());
}

function parseSemver(version) {
  const match = String(version).match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}. Use x.y.z`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function bumpVersion(version, bumpType) {
  const v = parseSemver(version);

  if (bumpType === "major") {
    return `${v.major + 1}.0.0`;
  }
  if (bumpType === "minor") {
    return `${v.major}.${v.minor + 1}.0`;
  }
  if (bumpType === "patch") {
    return `${v.major}.${v.minor}.${v.patch + 1}`;
  }

  throw new Error(`Unknown bump type: ${bumpType}`);
}

function readMetadata() {
  if (!fs.existsSync(META_PATH)) {
    return null;
  }

  const raw = fs.readFileSync(META_PATH, "utf8");
  return JSON.parse(raw);
}

function writeMetadata(data) {
  const sortedTools = [...data.tools].sort((a, b) => a.id.localeCompare(b.id));
  const normalized = {
    schemaVersion: 1,
    generatedAt: getTodayISO(),
    tools: sortedTools,
  };

  fs.writeFileSync(META_PATH, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
}

function listToolIdsFromAppDir() {
  const entries = fs.readdirSync(APP_DIR, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => fs.existsSync(path.join(APP_DIR, name, "page.tsx")))
    .sort((a, b) => a.localeCompare(b));
}

function parseToolTitlesFromHomePage() {
  const homePath = path.join(APP_DIR, "page.tsx");
  if (!fs.existsSync(homePath)) {
    return {};
  }

  const src = fs.readFileSync(homePath, "utf8");
  const titleById = {};

  const pattern = /\{\s*title:\s*"([^"]+)"\s*,\s*path:\s*"\/([^"]+)"/g;
  let match = pattern.exec(src);

  while (match) {
    titleById[match[2]] = match[1];
    match = pattern.exec(src);
  }

  return titleById;
}

function parseArgMap(argv) {
  const map = {};

  argv.forEach((arg) => {
    if (!arg.startsWith("--")) return;

    const body = arg.slice(2);
    const equalIndex = body.indexOf("=");

    if (equalIndex === -1) {
      map[body] = true;
      return;
    }

    const key = body.slice(0, equalIndex);
    const value = body.slice(equalIndex + 1);
    map[key] = value;
  });

  return map;
}

function semverSortValue(version) {
  const { major, minor, patch } = parseSemver(version);
  return major * 1000000 + minor * 1000 + patch;
}

module.exports = {
  APP_DIR,
  META_PATH,
  getTodayISO,
  parseSemver,
  bumpVersion,
  readMetadata,
  writeMetadata,
  listToolIdsFromAppDir,
  parseToolTitlesFromHomePage,
  parseArgMap,
  semverSortValue,
};

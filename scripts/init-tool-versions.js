const {
  getTodayISO,
  readMetadata,
  writeMetadata,
  listToolIdsFromAppDir,
  parseToolTitlesFromHomePage,
} = require("./tool-version-utils");

function run() {
  const today = getTodayISO();
  const ids = listToolIdsFromAppDir();
  const titleById = parseToolTitlesFromHomePage();
  const existing = readMetadata();

  const existingMap = new Map((existing?.tools || []).map((tool) => [tool.id, tool]));

  const tools = ids.map((id) => {
    const prev = existingMap.get(id);

    if (prev) {
      return {
        ...prev,
        id,
        title: titleById[id] || prev.title || id,
      };
    }

    return {
      id,
      title: titleById[id] || id,
      version: "1.0.0",
      updatedAt: today,
      changeSummary: "Initial registration",
      history: [
        {
          version: "1.0.0",
          updatedAt: today,
          summary: "Initial registration",
        },
      ],
    };
  });

  writeMetadata({ schemaVersion: 1, generatedAt: today, tools });

  const removed = (existing?.tools || [])
    .map((tool) => tool.id)
    .filter((id) => !ids.includes(id));

  console.log(`Synced ${tools.length} tools to src/app/tool-versions.json`);
  if (removed.length > 0) {
    console.log(`Removed stale entries: ${removed.join(", ")}`);
  }
}

run();

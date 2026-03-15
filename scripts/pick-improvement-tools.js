const {
  getTodayISO,
  readMetadata,
  parseArgMap,
  semverSortValue,
} = require("./tool-version-utils");

function daysSince(dateString) {
  const base = new Date(`${dateString}T00:00:00.000Z`).getTime();
  const now = new Date(`${getTodayISO()}T00:00:00.000Z`).getTime();
  return Math.max(0, Math.floor((now - base) / (1000 * 60 * 60 * 24)));
}

function scoreTool(tool) {
  const staleDays = daysSince(tool.updatedAt || "1970-01-01");
  const semverRank = semverSortValue(tool.version || "1.0.0");
  const lowVersionBonus = Math.max(0, 1_000_000 - semverRank);
  return staleDays * 1000 + lowVersionBonus;
}

function run() {
  const args = parseArgMap(process.argv.slice(2));
  const top = Number(args.top || 10);
  const outputJson = Boolean(args.json);

  if (!Number.isFinite(top) || top <= 0) {
    console.error("Error: --top must be a positive number.");
    process.exit(1);
  }

  const metadata = readMetadata();
  if (!metadata) {
    console.error("Error: src/app/tool-versions.json was not found. Run npm run tools:version:init first.");
    process.exit(1);
  }

  const ranked = [...metadata.tools]
    .map((tool) => ({
      id: tool.id,
      title: tool.title,
      version: tool.version,
      updatedAt: tool.updatedAt,
      changeSummary: tool.changeSummary,
      priorityScore: scoreTool(tool),
      staleDays: daysSince(tool.updatedAt || "1970-01-01"),
    }))
    .sort((a, b) => {
      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }
      return a.id.localeCompare(b.id);
    })
    .slice(0, top);

  if (outputJson) {
    console.log(JSON.stringify(ranked, null, 2));
    return;
  }

  console.log(`Improvement candidates (top ${top}):`);
  console.table(
    ranked.map((item) => ({
      id: item.id,
      version: item.version,
      updatedAt: item.updatedAt,
      staleDays: item.staleDays,
      priorityScore: item.priorityScore,
      summary: item.changeSummary,
    }))
  );
}

run();

const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("[ERROR] MONGODB_URI environment variable is required to run restore.");
  process.exit(1);
}

const targetFile = process.argv[2];
if (!targetFile) {
  console.error("Usage: node scripts/restore-db.js <path-to-backup.json>");
  process.exit(1);
}

const resolvedPath = path.resolve(targetFile);
if (!fs.existsSync(resolvedPath)) {
  console.error(`[ERROR] File not found: ${resolvedPath}`);
  process.exit(1);
}

async function runRestore() {
  console.log(`Reading backup file from: ${resolvedPath}`);
  const rawData = JSON.parse(fs.readFileSync(resolvedPath, "utf8"));
  if (!rawData.collections) {
    console.error("[ERROR] Invalid backup format: missing 'collections' property.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("dj_g_spark");

  for (const [collName, docs] of Object.entries(rawData.collections)) {
    if (!Array.isArray(docs) || docs.length === 0) continue;

    console.log(`Restoring collection '${collName}' (${docs.length} items)...`);
    const collection = db.collection(collName);
    await collection.deleteMany({});
    await collection.insertMany(docs);
    console.log(`✓ Restored '${collName}'`);
  }

  await client.close();
  console.log("\n🎉 Database restoration completed successfully!");
}

runRestore().catch((err) => {
  console.error("[FATAL] Restore failed:", err);
  process.exit(1);
});

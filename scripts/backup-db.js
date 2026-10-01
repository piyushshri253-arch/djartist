const dns = require("dns");
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {}
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("[ERROR] MONGODB_URI environment variable is required to run backup.");
  process.exit(1);
}

const COLLECTIONS = [
  "events",
  "past_events",
  "gallery",
  "blogs",
  "reviews",
  "settings",
  "social_settings",
  "deleted_events",
  "deleted_blogs",
  "admin_users",
];

async function runBackup() {
  console.log("Starting secure MongoDB database backup...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("dj_g_spark");

  const backupData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    collections: {},
  };

  for (const collName of COLLECTIONS) {
    try {
      const records = await db.collection(collName).find({}).toArray();
      backupData.collections[collName] = records;
      console.log(`✓ Exported ${collName}: ${records.length} document(s)`);
    } catch (err) {
      console.warn(`! Warning reading ${collName}:`, err.message);
    }
  }

  await client.close();

  const backupDir = path.join(__dirname, "..", "backups");
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(backupDir, `backup_${timestamp}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");

  console.log(`\n🎉 Backup completed successfully! Saved to:\n   ${backupFile}`);
}

runBackup().catch((err) => {
  console.error("[FATAL] Backup failed:", err);
  process.exit(1);
});

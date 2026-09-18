const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://piyushshri253_db_user:q3nLhTyLn9CvwUeW@cluster0.fcclcik.mongodb.net/dj_g_spark?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(uri);

const dataDir = path.join(__dirname, '..', 'src', 'data');
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

async function seed() {
  console.log('Connecting to MongoDB Atlas...');
  await client.connect();
  const db = client.db('dj_g_spark');
  console.log('Connected! Seeding files from:', dataDir);

  for (const file of files) {
    const collName = file.replace(/\.json$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
    const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
    
    await db.collection(collName).updateOne(
      { _id: 'current_dataset' },
      { $set: { data: content, updatedAt: new Date(), seededAt: new Date() } },
      { upsert: true }
    );
    console.log('Seeded collection:', collName, Array.isArray(content) ? `${content.length} items` : 'object');
  }

  await client.close();
  console.log('ALL DATA SEEDED SUCCESSFULLY TO MONGODB ATLAS!');
}

seed().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});

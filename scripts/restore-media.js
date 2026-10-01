const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI environment variable is required.");
  process.exit(1);
}

const client = new MongoClient(uri);

async function restoreMedia() {
  console.log('Connecting to MongoDB Atlas...');
  await client.connect();
  const db = client.db('dj_g_spark');

  const galleryPath = path.join(__dirname, '..', 'src', 'data', 'gallery.json');
  const videosPath = path.join(__dirname, '..', 'src', 'data', 'videos.json');

  const galleryData = JSON.parse(fs.readFileSync(galleryPath, 'utf8'));
  const videosData = JSON.parse(fs.readFileSync(videosPath, 'utf8'));

  const galRes = await db.collection('gallery').updateOne(
    { _id: 'current_dataset' },
    { $set: { data: galleryData, updatedAt: new Date(), restoredAt: new Date() } },
    { upsert: true }
  );
  console.log('Gallery collection restored:', galRes.acknowledged, 'Count:', galleryData.length);

  const vidRes = await db.collection('videos').updateOne(
    { _id: 'current_dataset' },
    { $set: { data: videosData, updatedAt: new Date(), restoredAt: new Date() } },
    { upsert: true }
  );
  console.log('Videos collection restored:', vidRes.acknowledged, 'Count:', videosData.length);

  // Verify
  const galDoc = await db.collection('gallery').findOne({ _id: 'current_dataset' });
  const vidDoc = await db.collection('videos').findOne({ _id: 'current_dataset' });
  const evDoc = await db.collection('events').findOne({ _id: 'current_dataset' });

  console.log('=== VERIFICATION IN MONGODB ATLAS ===');
  console.log('gallery items:', galDoc.data ? galDoc.data.length : 0);
  console.log('videos items:', vidDoc.data ? vidDoc.data.length : 0);
  console.log('events items (protected & unchanged):', evDoc.data ? evDoc.data.length : 0);

  await client.close();
}

restoreMedia().catch(err => {
  console.error('Error restoring media:', err);
  process.exit(1);
});

const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

async function run() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('dj_g_spark');

  console.log('=== 1. CHECK & RESTORE BLOGS ===');
  const blogDoc = await db.collection('blog').findOne({ _id: 'current_dataset' });
  const delBlogDoc = await db.collection('deleted_blogs').findOne({ _id: 'current_dataset' });
  console.log('Current blogs in DB:', blogDoc?.data?.length || 0);
  console.log('Deleted blogs in DB:', delBlogDoc?.data?.length || 0);

  // Clear deleted_blogs blacklist
  await db.collection('deleted_blogs').updateOne(
    { _id: 'current_dataset' },
    { $set: { data: [], updatedAt: new Date() } },
    { upsert: true }
  );
  console.log('Cleared deleted_blogs blacklist in MongoDB Atlas.');

  // Restore authentic blogs from src/data/blog.json
  const rawBlogs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', 'blog.json'), 'utf8'));
  await db.collection('blog').updateOne(
    { _id: 'current_dataset' },
    { $set: { data: rawBlogs, updatedAt: new Date(), restoredAt: new Date() } },
    { upsert: true }
  );
  console.log(`Restored ${rawBlogs.length} authentic blogs to MongoDB Atlas 'blog' collection.`);

  console.log('\n=== 2. CHECK VIDEOS ===');
  const vidDoc = await db.collection('videos').findOne({ _id: 'current_dataset' });
  console.log('Current videos in DB:', vidDoc?.data?.length || 0);
  if (vidDoc && Array.isArray(vidDoc.data)) {
    console.log('Video IDs in DB:', vidDoc.data.map(v => v.id));
  }

  console.log('\n=== 3. CHECK REVIEWS ===');
  const revDoc = await db.collection('reviews').findOne({ _id: 'current_dataset' });
  console.log('Current reviews in DB:', revDoc?.data?.length || 0);
  if (revDoc && Array.isArray(revDoc.data)) {
    console.log('Review summaries:', revDoc.data.map(r => ({ id: r.id, name: r.name, status: r.status, targetType: r.targetType })));
  }

  await client.close();
  console.log('\n>>> COMPLETED BLOG RESTORATION & DB INSPECTION! <<<');
}

run().catch(console.error);

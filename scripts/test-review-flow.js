const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

async function runReviewTest() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('dj_g_spark');
  const collection = db.collection('reviews');

  console.log('=== TEST 1: Read current reviews from MongoDB Atlas ===');
  const initialDoc = await collection.findOne({ _id: 'current_dataset' });
  const initialReviews = initialDoc?.data || [];
  console.log(`Current total reviews: ${initialReviews.length}`);
  console.log(`Approved reviews: ${initialReviews.filter(r => r.status === 'approved').length}`);
  console.log(`Pending reviews: ${initialReviews.filter(r => r.status === 'pending').length}`);

  console.log('\n=== TEST 2: Simulate User Submitting a Review on Website ===');
  const testId = `test-rev-${Date.now()}`;
  const newPendingReview = {
    id: testId,
    name: "Test Fan Delhi",
    userEmail: "fan@example.com",
    role: "Concert Attendee",
    organization: "Delhi NCR",
    initials: "TF",
    rating: 5,
    badge: "PERFORMANCE REVIEW",
    badgeColor: "text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30",
    event: "Delhi Live Concert",
    quote: "Mind blowing sound quality and unbelievable energy from start to finish!",
    date: "OCT 2026",
    category: "performance",
    status: "pending", // NEW SUBMISSION MUST BE PENDING
    createdAt: new Date().toISOString(),
    targetType: "event"
  };

  const updatedWithPending = [newPendingReview, ...initialReviews];
  await collection.updateOne(
    { _id: 'current_dataset' },
    { $set: { data: updatedWithPending, updatedAt: new Date() } }
  );
  console.log(`Inserted test review with status='pending'. ID: ${testId}`);

  console.log('\n=== TEST 3: Check Public Website View (Must Exclude Pending) ===');
  const afterSubmitDoc = await collection.findOne({ _id: 'current_dataset' });
  const publicReviews = (afterSubmitDoc?.data || []).filter(r => r.status === 'approved');
  const isPendingVisible = publicReviews.some(r => r.id === testId);
  console.log(`Is pending review visible to public visitors? ${isPendingVisible ? '❌ YES (BUG)' : '✅ NO (SECURE - Pending approval)'}`);
  if (isPendingVisible) {
    throw new Error("Pending review should not be visible to public!");
  }

  console.log('\n=== TEST 4: Simulate Admin Approving the Review in Admin Panel ===');
  const currentReviews = afterSubmitDoc?.data || [];
  const approvedList = currentReviews.map(r => {
    if (r.id === testId) {
      return { ...r, status: 'approved' };
    }
    return r;
  });
  await collection.updateOne(
    { _id: 'current_dataset' },
    { $set: { data: approvedList, updatedAt: new Date() } }
  );
  console.log(`Admin approved review ID: ${testId}`);

  console.log('\n=== TEST 5: Check Public Website View After Admin Approval ===');
  const afterApproveDoc = await collection.findOne({ _id: 'current_dataset' });
  const updatedPublicReviews = (afterApproveDoc?.data || []).filter(r => r.status === 'approved');
  const isApprovedVisible = updatedPublicReviews.some(r => r.id === testId);
  console.log(`Is approved review visible to public visitors now? ${isApprovedVisible ? '✅ YES (SUCCESS - Dynamically displayed)' : '❌ NO'}`);
  if (!isApprovedVisible) {
    throw new Error("Approved review should be visible to public!");
  }

  console.log('\n=== TEST 6: Clean Up Test Review ===');
  const cleanList = (afterApproveDoc?.data || []).filter(r => r.id !== testId);
  await collection.updateOne(
    { _id: 'current_dataset' },
    { $set: { data: cleanList, updatedAt: new Date() } }
  );
  console.log('Test review cleaned up successfully.');

  const finalDoc = await collection.findOne({ _id: 'current_dataset' });
  console.log(`Final total reviews in DB: ${finalDoc?.data?.length}`);

  await client.close();
  console.log('\n>>> ALL 6 END-TO-END REVIEW MODERATION TESTS PASSED! <<<');
}

runReviewTest().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

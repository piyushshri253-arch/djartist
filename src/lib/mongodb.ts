import { MongoClient } from "mongodb";
import dns from "dns";

// Ensure DNS SRV queries resolve reliably across all ISPs/local networks
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setServers is restricted
}

const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://piyushshri253_db_user:q3nLhTyLn9CvwUeW@cluster0.fcclcik.mongodb.net/dj_g_spark?retryWrites=true&w=majority&appName=Cluster0";

const mongoOptions = {
  serverSelectionTimeoutMS: 3000,
  connectTimeoutMS: 3000,
  maxPoolSize: 10,
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (process.env.NODE_ENV === "development") {
    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, mongoOptions);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, mongoOptions);
    clientPromise = client.connect();
  }
}

export async function getDb() {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db("dj_g_spark");
  } catch (err) {
    console.warn("[MongoDB] Connection warning, using fallback:", err);
    return null;
  }
}

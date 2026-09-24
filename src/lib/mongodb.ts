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
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  maxPoolSize: 10,
  socketTimeoutMS: 45000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function getClientPromise(): Promise<MongoClient> {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, mongoOptions);
    global._mongoClientPromise = client.connect().catch((err) => {
      // Clear cached promise on failure so next request can retry fresh
      global._mongoClientPromise = undefined;
      throw err;
    });
  }
  return global._mongoClientPromise;
}

export async function getDb() {
  try {
    const connectedClient = await getClientPromise();
    return connectedClient.db("dj_g_spark");
  } catch (err) {
    console.error("[MongoDB] Connection error:", err);
    global._mongoClientPromise = undefined;
    return null;
  }
}

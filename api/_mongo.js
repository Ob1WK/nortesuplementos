import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "norte_suplementos";

let clientPromise;

export async function getDb() {
  if (!uri) {
    throw new Error("Missing MONGODB_URI");
  }

  if (uri.includes("<db_password>")) {
    throw new Error("MONGODB_URI still contains <db_password>. Replace it in Vercel with the real MongoDB Atlas user password.");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri);
    clientPromise = client.connect();
  }

  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    clientPromise = undefined;
    if (/bad auth|Authentication failed/i.test(error.message || "")) {
      throw new Error("MongoDB authentication failed. Check the Atlas username/password in MONGODB_URI and URL-encode special characters in the password.");
    }
    throw error;
  }
}

export function isAdmin(req) {
  const expected = process.env.ADMIN_TOKEN;
  const token = req.headers["x-admin-token"];

  if (expected) {
    return token === expected;
  }

  return process.env.NODE_ENV !== "production";
}

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

export async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

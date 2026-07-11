import { getDb, sendJson } from "./_mongo.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return sendJson(res, 200, {
      ok: true,
      mongodb: "connected",
      db: process.env.MONGODB_DB || "norte_suplementos",
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasAdminToken: Boolean(process.env.ADMIN_TOKEN)
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      mongodb: "error",
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasAdminToken: Boolean(process.env.ADMIN_TOKEN),
      error: error.message || "Error interno"
    });
  }
}

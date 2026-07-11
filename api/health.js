import { getDb, getDbName, sendJson } from "./_mongo.js";

export default async function handler(req, res) {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return sendJson(res, 200, {
      ok: true,
      mongodb: "connected",
      db: getDbName(),
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasAdminToken: Boolean(process.env.ADMIN_TOKEN),
      mongodbDbIgnored: Boolean(process.env.MONGODB_DB && process.env.MONGODB_DB !== getDbName())
    });
  } catch (error) {
    return sendJson(res, 500, {
      ok: false,
      mongodb: "error",
      hasMongoUri: Boolean(process.env.MONGODB_URI),
      hasAdminToken: Boolean(process.env.ADMIN_TOKEN),
      db: getDbName(),
      mongodbDbIgnored: Boolean(process.env.MONGODB_DB && process.env.MONGODB_DB !== getDbName()),
      error: error.message || "Error interno"
    });
  }
}

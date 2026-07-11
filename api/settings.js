import { getDb, isAdmin, readBody, sendJson } from "./_mongo.js";

const defaultSettings = {
  topLeft: "Envío gratis a partir de $80.000",
  topCenter: "Suplementos de calidad para resultados reales",
  topRight: "3 cuotas sin interés",
  updatedAt: new Date()
};

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const settings = db.collection("settings");

    if (req.method === "GET") {
      const doc = await settings.findOne({ id: "site" }, { projection: { _id: 0 } });
      return sendJson(res, 200, doc || defaultSettings);
    }

    if (req.method !== "PUT") {
      res.setHeader("Allow", "GET,PUT");
      return sendJson(res, 405, { error: "Metodo no permitido" });
    }

    if (!isAdmin(req)) {
      return sendJson(res, 401, { error: "No autorizado" });
    }

    const payload = await readBody(req);
    const next = {
      id: "site",
      topLeft: String(payload.topLeft || "").trim(),
      topCenter: String(payload.topCenter || "").trim(),
      topRight: String(payload.topRight || "").trim(),
      updatedAt: new Date()
    };

    await settings.updateOne({ id: "site" }, { $set: next }, { upsert: true });
    return sendJson(res, 200, next);
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Error interno" });
  }
}

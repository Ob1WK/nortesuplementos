import { getDb, isAdmin, readBody, sendJson } from "./_mongo.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return sendJson(res, 405, { error: "Método no permitido" });
    }

    if (!isAdmin(req)) {
      return sendJson(res, 401, { error: "No autorizado" });
    }

    const payload = await readBody(req);
    const incoming = Array.isArray(payload) ? payload : payload.products;
    if (!Array.isArray(incoming)) {
      return sendJson(res, 400, { error: "Se esperaba un array de productos" });
    }

    const db = await getDb();
    const products = db.collection("products");
    await products.deleteMany({});
    if (incoming.length) {
      await products.insertMany(incoming.map((product) => ({ ...product, updatedAt: new Date(), createdAt: new Date() })));
    }

    return sendJson(res, 200, { ok: true, count: incoming.length });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Error interno" });
  }
}

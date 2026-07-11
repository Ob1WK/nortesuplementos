import { getDb, isAdmin, readBody, sendJson } from "./_mongo.js";

const collectionName = "products";

function normalizeProduct(input) {
  const incomingImages = Array.isArray(input.images) ? input.images : [];
  const images = [...incomingImages, input.image]
    .filter(Boolean)
    .map((image) => String(image).trim())
    .filter(Boolean)
    .slice(0, 3);

  const id = String(input.id || input.name || crypto.randomUUID())
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id,
    name: String(input.name || "").trim(),
    category: String(input.category || "General").trim(),
    objective: String(input.objective || "Fuerza").trim(),
    flavor: String(input.flavor || "").trim(),
    size: String(input.size || "").trim(),
    price: Number(input.price || 0),
    oldPrice: Number(input.oldPrice || 0),
    available: input.available !== false,
    featured: Boolean(input.featured),
    badge: String(input.badge || "").trim(),
    color: String(input.color || "#d69b2d"),
    description: String(input.description || "").trim(),
    images,
    updatedAt: new Date()
  };
}

export default async function handler(req, res) {
  try {
    const db = await getDb();
    const products = db.collection(collectionName);
    await products.createIndex({ id: 1 }, { unique: true });

    if (req.method === "GET") {
      const docs = await products.find({}, { projection: { _id: 0 } }).sort({ featured: -1, name: 1 }).toArray();
      return sendJson(res, 200, docs);
    }

    if (!isAdmin(req)) {
      return sendJson(res, 401, { error: "No autorizado" });
    }

    if (req.method === "POST") {
      const payload = await readBody(req);
      const product = normalizeProduct(payload);
      const createdAt = new Date();

      if (!product.name) {
        return sendJson(res, 400, { error: "El nombre es obligatorio" });
      }

      await products.updateOne({ id: product.id }, { $set: product, $setOnInsert: { createdAt } }, { upsert: true });
      return sendJson(res, 200, { ...product, createdAt });
    }

    if (req.method === "PUT") {
      const payload = await readBody(req);
      const product = normalizeProduct(payload);

      if (!product.id || !product.name) {
        return sendJson(res, 400, { error: "Producto inválido" });
      }

      await products.updateOne({ id: product.id }, { $set: product }, { upsert: true });
      return sendJson(res, 200, product);
    }

    if (req.method === "DELETE") {
      const id = new URL(req.url, "http://localhost").searchParams.get("id");
      if (!id) return sendJson(res, 400, { error: "Falta id" });

      await products.deleteOne({ id });
      return sendJson(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET,POST,PUT,DELETE");
    return sendJson(res, 405, { error: "Método no permitido" });
  } catch (error) {
    return sendJson(res, 500, { error: error.message || "Error interno" });
  }
}

import { isAdmin, sendJson } from "./_mongo.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Metodo no permitido" });
  }

  if (!isAdmin(req)) {
    return sendJson(res, 401, { error: "Contrasena incorrecta" });
  }

  return sendJson(res, 200, { ok: true });
}

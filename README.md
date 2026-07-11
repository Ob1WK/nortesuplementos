# Norte Suplementos

Tienda ecommerce para Norte Suplementos, preparada para Vercel con panel de administracion y catalogo persistido en MongoDB.

## Variables en Vercel

Configura estas variables en Project Settings > Environment Variables:

```env
MONGODB_URI=mongodb+srv://gabrielanibaldi_db_user:<db_password>@cluster0.uv9atby.mongodb.net/norte_suplementos?retryWrites=true&w=majority&appName=Cluster0
MONGODB_DB=norte_suplementos
ADMIN_TOKEN=una-clave-segura-para-el-admin
VITE_WHATSAPP_NUMBER=5491161962382
```

Reemplaza `<db_password>` por la contrasena real del usuario de MongoDB. La misma `ADMIN_TOKEN` es la contrasena de acceso al panel admin para crear, editar, borrar o importar productos.

El checkout envia el pedido por WhatsApp a `+54 9 11 6196-2382` con los datos del cliente, el detalle del carrito y la indicacion de pago por transferencia.

## Rutas

- `/`: tienda.
- `/productos`, `/categorias`, `/objetivos`, `/packs`: catalogo filtrable.
- `/checkout`: datos del cliente y envio del pedido por WhatsApp.
- `/admin`: panel protegido por `ADMIN_TOKEN`.
- `/api/health`: diagnostico rapido de MongoDB y variables de entorno.

Desde el admin tambien se editan los tres textos de la barra superior: envio gratis, claim central y cuotas/promocion.

## Desarrollo

```bash
npm install
npm run dev
npm run build
```

Para usar las funciones API localmente con MongoDB conviene ejecutar con Vercel CLI (`vercel dev`) y un `.env.local` con las variables anteriores.

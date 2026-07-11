import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  BadgePercent,
  BarChart3,
  Bolt,
  Check,
  ChevronDown,
  CircleUserRound,
  Dumbbell,
  Edit3,
  Filter,
  Flame,
  Goal,
  Handshake,
  HeartPulse,
  Instagram,
  Menu,
  MessageCircle,
  PackageCheck,
  Plus,
  RotateCcw,
  Search,
  Shield,
  ShoppingCart,
  Sparkles,
  Star,
  Target,
  Trash2,
  Truck,
  Upload,
  X
} from "lucide-react";
import "./styles.css";

const STORAGE_CART = "norte-cart-v1";
const STORAGE_ADMIN_TOKEN = "norte-admin-token-v1";
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "5491161962382";

const defaultProducts = [
  {
    id: "whey-protein",
    name: "Whey Protein",
    category: "Proteínas",
    objective: "Fuerza",
    flavor: "Chocolate",
    size: "2 kg",
    price: 69990,
    oldPrice: 79990,
    stock: 18,
    featured: true,
    badge: "Más vendido",
    color: "#d69b2d",
    description: "Proteína premium para recuperación muscular y aporte diario de aminoácidos.",
    image: ""
  },
  {
    id: "mass-gainer",
    name: "Mass Gainer",
    category: "Ganadores",
    objective: "Rendimiento",
    flavor: "Chocolate",
    size: "3 kg",
    price: 89990,
    oldPrice: 99990,
    stock: 12,
    featured: true,
    badge: "Volumen",
    color: "#8a5a2f",
    description: "Calorías, carbohidratos y proteínas para etapas de volumen exigentes.",
    image: ""
  },
  {
    id: "creatina",
    name: "Creatina",
    category: "Creatinas",
    objective: "Energía",
    flavor: "Sin sabor",
    size: "300 g",
    price: 24990,
    oldPrice: 29990,
    stock: 24,
    featured: true,
    badge: "Nuevo",
    color: "#c4c4c4",
    description: "Creatina micronizada para potencia, fuerza y rendimiento sostenido.",
    image: ""
  },
  {
    id: "shaker",
    name: "Shaker Norte",
    category: "Accesorios",
    objective: "Disciplina",
    flavor: "Negro",
    size: "700 ml",
    price: 9990,
    oldPrice: 12990,
    stock: 35,
    featured: true,
    badge: "Combo ideal",
    color: "#d9a01f",
    description: "Shaker resistente con tapa segura para entrenar y llevar tus suplementos.",
    image: ""
  },
  {
    id: "pre-workout",
    name: "Pre-Workout",
    category: "Pre entrenos",
    objective: "Enfoque",
    flavor: "Frutos rojos",
    size: "300 g",
    price: 34990,
    oldPrice: 39990,
    stock: 16,
    featured: true,
    badge: "Energía",
    color: "#b9302a",
    description: "Fórmula para energía, foco y empuje antes de entrenamientos intensos.",
    image: ""
  },
  {
    id: "pack-definicion",
    name: "Pack Definición",
    category: "Packs",
    objective: "Recuperación",
    flavor: "Mixto",
    size: "3 productos",
    price: 109990,
    oldPrice: 128970,
    stock: 8,
    featured: false,
    badge: "Ahorro",
    color: "#2e78a6",
    description: "Whey, creatina y shaker para sostener un plan simple y efectivo.",
    image: ""
  }
];

const objectives = [
  { name: "Fuerza", icon: Dumbbell },
  { name: "Energía", icon: Bolt },
  { name: "Resistencia", icon: Shield },
  { name: "Enfoque", icon: Target },
  { name: "Recuperación", icon: RotateCcw },
  { name: "Rendimiento", icon: BarChart3 },
  { name: "Disciplina", icon: Goal },
  { name: "Confianza", icon: Handshake }
];

const initialForm = {
  id: "",
  name: "",
  category: "Proteínas",
  objective: "Fuerza",
  flavor: "",
  size: "",
  price: 0,
  oldPrice: 0,
  stock: 0,
  featured: false,
  badge: "",
  color: "#d69b2d",
  description: "",
  image: ""
};

function money(value) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function useLocalState(key, fallback) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
}

function getStoredAdminToken() {
  try {
    return sessionStorage.getItem(STORAGE_ADMIN_TOKEN) || "";
  } catch {
    return "";
  }
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const response = await fetch(path, { ...options, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "No se pudo completar la operación");
  }

  return payload;
}

function useProducts() {
  const [products, setProducts] = useState(defaultProducts);
  const [status, setStatus] = useState("Cargando catálogo...");
  const [apiReady, setApiReady] = useState(false);

  const refreshProducts = async () => {
    try {
      setStatus("Cargando catálogo...");
      const remoteProducts = await apiRequest("/api/products");
      setProducts(remoteProducts);
      setApiReady(true);
      setStatus("");
    } catch (error) {
      setProducts(defaultProducts);
      setApiReady(false);
      setStatus("MongoDB todavía no está conectado. Se muestra un catálogo demo.");
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return { products, setProducts, refreshProducts, status, apiReady };
}

function ProductVisual({ product, compact = false }) {
  if (product.image) {
    return <img className="product-photo" src={product.image} alt={product.name} />;
  }

  return (
    <div className={`jar ${compact ? "jar-compact" : ""}`} style={{ "--accent": product.color }}>
      <div className="jar-cap" />
      <div className="jar-body">
        <img src="/logo.png" alt="" />
        <strong>{product.name}</strong>
        <span>{product.size}</span>
      </div>
    </div>
  );
}

function Header({ cartCount, onCartOpen, activeView, setActiveView }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = ["Inicio", "Productos", "Categorías", "Objetivos", "Packs", "Nosotros", "Contacto"];

  const go = (item) => {
    setActiveView(item === "Inicio" ? "shop" : item.toLowerCase());
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="top-strip">
        <span>Envío gratis a partir de $80.000</span>
        <b><Bolt size={18} /> Suplementos de calidad para resultados reales <Bolt size={18} /></b>
        <span>3 cuotas sin interés</span>
      </div>
      <div className="nav-shell">
        <button className="icon-button mobile-only" onClick={() => setMenuOpen(!menuOpen)} aria-label="Abrir menú">
          <Menu size={22} />
        </button>
        <button className="brand" onClick={() => setActiveView("shop")} aria-label="Norte Suplementos">
          <img src="/logo-horizontal.png" alt="Norte Suplementos" />
        </button>
        <nav className={menuOpen ? "open" : ""}>
          {nav.map((item) => (
            <button key={item} onClick={() => go(item)} className={activeView === item.toLowerCase() ? "active" : ""}>
              {item}
              {["Productos", "Categorías", "Objetivos"].includes(item) && <ChevronDown size={14} />}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setActiveView("productos")} aria-label="Buscar">
            <Search size={22} />
          </button>
          <button className="icon-button" onClick={() => setActiveView("admin")} aria-label="Panel de administración">
            <CircleUserRound size={22} />
          </button>
          <button className="icon-button cart-trigger" onClick={onCartOpen} aria-label="Carrito">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ setActiveView }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><Sparkles size={17} /> Línea premium Norte</p>
        <h1>Fuerza que te impulsa. Calidad que te respalda.</h1>
        <p>Suplementos, packs y asesoramiento para entrenar con objetivos claros y productos confiables.</p>
        <div className="hero-actions">
          <button className="primary-button" onClick={() => setActiveView("productos")}>
            Ver productos <Bolt size={19} />
          </button>
          <button className="ghost-button" onClick={() => setActiveView("contacto")}>
            Asesoramiento <MessageCircle size={18} />
          </button>
        </div>
        <div className="trust-row">
          <span><Star size={18} /> Calidad premium</span>
          <span><Check size={18} /> Resultados comprobados</span>
          <span><Truck size={18} /> Envíos a todo el país</span>
        </div>
      </div>
      <div className="hero-products" aria-hidden="true">
        {defaultProducts.slice(0, 4).map((product, index) => (
          <div className={`hero-product hp-${index}`} key={product.id}>
            <ProductVisual product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

function ObjectiveRail({ selectedObjective, setSelectedObjective, setActiveView }) {
  return (
    <section className="objective-rail">
      {objectives.map(({ name, icon: Icon }) => (
        <button
          key={name}
          className={selectedObjective === name ? "selected" : ""}
          onClick={() => {
            setSelectedObjective(selectedObjective === name ? "Todos" : name);
            setActiveView("productos");
          }}
        >
          <span><Icon size={30} /></span>
          <strong>{name}</strong>
          <small>Ver productos</small>
        </button>
      ))}
    </section>
  );
}

function ProductCard({ product, addToCart }) {
  return (
    <article className="product-card">
      {product.badge && <span className="badge">{product.badge}</span>}
      <div className="product-art">
        <ProductVisual product={product} />
      </div>
      <div className="product-info">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <span>{product.size} · {product.flavor}</span>
        <div className="price-row">
          <strong>{money(product.price)}</strong>
          {product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}
        </div>
        <small>3 cuotas sin interés</small>
        <button onClick={() => addToCart(product.id)} disabled={product.stock <= 0}>
          <ShoppingCart size={17} /> {product.stock > 0 ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}

function Storefront({ products, addToCart, selectedObjective, setSelectedObjective, activeView, setActiveView }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState("destacados");

  const categories = useMemo(() => ["Todas", ...new Set(products.map((p) => p.category))], [products]);

  const visibleProducts = useMemo(() => {
    return products
      .filter((product) => category === "Todas" || product.category === category)
      .filter((product) => selectedObjective === "Todos" || product.objective === selectedObjective)
      .filter((product) => `${product.name} ${product.category} ${product.flavor}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "precio-menor") return a.price - b.price;
        if (sort === "precio-mayor") return b.price - a.price;
        if (sort === "stock") return b.stock - a.stock;
        return Number(b.featured) - Number(a.featured);
      });
  }, [products, category, selectedObjective, query, sort]);

  const featured = products.filter((p) => p.featured).slice(0, 5);
  const showFullCatalog = ["productos", "categorías", "objetivos", "packs"].includes(activeView);
  const catalogProducts = activeView === "packs" ? visibleProducts.filter((p) => p.category === "Packs") : visibleProducts;

  return (
    <>
      <Hero setActiveView={setActiveView} />
      <ObjectiveRail
        selectedObjective={selectedObjective}
        setSelectedObjective={setSelectedObjective}
        setActiveView={setActiveView}
      />

      <section className="section-head">
        <div>
          <p className="eyebrow"><Bolt size={16} /> Productos destacados</p>
          <h2>Lo más elegido para entrenar mejor</h2>
        </div>
        <button className="link-button" onClick={() => setActiveView("productos")}>
          Ver todos <ArrowRight size={18} />
        </button>
      </section>

      <section className="product-grid featured-grid">
        {featured.map((product) => (
          <ProductCard key={product.id} product={product} addToCart={addToCart} />
        ))}
        {featured.length === 0 && (
          <div className="empty-catalog">
            <h3>Todavia no hay productos destacados</h3>
            <p>Cargalos desde el panel admin para que aparezcan en la tienda.</p>
          </div>
        )}
      </section>

      <section className="promo-grid">
        <div className="promo promo-athlete">
          <h2>Tu mejor versión empieza hoy</h2>
          <button onClick={() => setActiveView("productos")}>Ver más</button>
        </div>
        <div className="promo">
          <h2>Packs especiales</h2>
          <p>Ahorrá más llevando combos inteligentes.</p>
          <button onClick={() => setActiveView("packs")}>Ver packs</button>
        </div>
        <div className="promo">
          <h2>Asesoramiento personalizado</h2>
          <p>Te ayudamos a elegir lo mejor para vos.</p>
          <button onClick={() => setActiveView("contacto")}>Escribinos</button>
        </div>
        <div className="promo">
          <h2>Envíos a todo el país</h2>
          <p>Rápidos, seguros y con seguimiento.</p>
          <button onClick={() => setActiveView("contacto")}>Más información</button>
        </div>
      </section>

      {showFullCatalog && (
        <section className="catalog-panel">
          <div className="section-head compact">
            <div>
              <p className="eyebrow"><Filter size={16} /> Catálogo</p>
              <h2>Elegí por objetivo, categoría o búsqueda</h2>
            </div>
          </div>
          <div className="filters">
            <label>
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto" />
            </label>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              {categories.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={selectedObjective} onChange={(event) => setSelectedObjective(event.target.value)}>
              <option>Todos</option>
              {objectives.map((item) => <option key={item.name}>{item.name}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="destacados">Destacados</option>
              <option value="precio-menor">Menor precio</option>
              <option value="precio-mayor">Mayor precio</option>
              <option value="stock">Mayor stock</option>
            </select>
          </div>
          <div className="product-grid">
            {catalogProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
            {catalogProducts.length === 0 && (
              <div className="empty-catalog">
                <h3>No hay productos para mostrar</h3>
                <p>Agrega productos desde el admin o cambia los filtros.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function AboutAndContact() {
  return (
    <section className="content-bands">
      <div className="info-band">
        <div>
          <p className="eyebrow"><HeartPulse size={16} /> Nosotros</p>
          <h2>Suplementos Norte acompaña tu progreso con productos claros, atención cercana y selección enfocada en rendimiento.</h2>
        </div>
        <ul>
          <li><PackageCheck size={20} /> Catálogo curado por objetivos.</li>
          <li><Truck size={20} /> Envíos coordinados a todo el país.</li>
          <li><BadgePercent size={20} /> Packs y promociones actualizables desde el admin.</li>
        </ul>
      </div>
      <div className="contact-band">
        <div>
          <p className="eyebrow"><MessageCircle size={16} /> Contacto</p>
          <h2>¿No sabés qué elegir?</h2>
          <p>Mandanos tu objetivo, frecuencia de entrenamiento y presupuesto. Te respondemos con una recomendación concreta.</p>
        </div>
        <div className="contact-actions">
          <a className="primary-button" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
            WhatsApp <MessageCircle size={18} />
          </a>
          <a className="ghost-button" href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram <Instagram size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ open, setOpen, cart, products, setCart }) {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });
  const lines = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.id) }))
    .filter((item) => item.product);
  const total = lines.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const updateQty = (id, delta) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const checkoutText = encodeURIComponent(
    `Hola Norte Suplementos, quiero hacer este pedido:\n\nCliente:\nNombre: ${customer.name}\nTelefono: ${customer.phone}\nDireccion: ${customer.address}\nLocalidad: ${customer.city}\nNotas: ${customer.notes || "-"}\n\nProductos:\n${lines
      .map((item) => `- ${item.product.name} x${item.qty}: ${money(item.product.price * item.qty)}`)
      .join("\n")}\n\nTotal: ${money(total)}\nForma de pago: transferencia bancaria.`
  );

  const submitCheckout = (event) => {
    event.preventDefault();
    if (!lines.length) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${checkoutText}`, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <aside className={`cart-drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-head">
        <h2>Carrito</h2>
        <button className="icon-button" onClick={() => setOpen(false)} aria-label="Cerrar carrito">
          <X size={22} />
        </button>
      </div>
      <div className="cart-lines">
        {lines.length === 0 && <p className="empty">Todavía no agregaste productos.</p>}
        {lines.map(({ product, qty }) => (
          <div className="cart-line" key={product.id}>
            <ProductVisual product={product} compact />
            <div>
              <strong>{product.name}</strong>
              <span>{money(product.price)}</span>
              <div className="qty-control">
                <button onClick={() => updateQty(product.id, -1)}>-</button>
                <b>{qty}</b>
                <button onClick={() => updateQty(product.id, 1)}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <form className="cart-footer" onSubmit={submitCheckout}>
        <div className="checkout-fields">
          <label>Nombre y apellido<input required value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} /></label>
          <label>Telefono<input required value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} /></label>
          <label>Direccion<input required value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} /></label>
          <label>Localidad<input required value={customer.city} onChange={(event) => updateCustomer("city", event.target.value)} /></label>
          <label>Notas<textarea value={customer.notes} onChange={(event) => updateCustomer("notes", event.target.value)} placeholder="Horario, referencias o consulta" /></label>
        </div>
        <div>
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
        <button
          type="submit"
          className={`primary-button ${lines.length === 0 ? "disabled" : ""}`}
          disabled={lines.length === 0}
        >
          Comprar por WhatsApp <MessageCircle size={18} />
        </button>
        <small>Pago unicamente por transferencia. Te enviamos los datos bancarios al confirmar el pedido.</small>
      </form>
    </aside>
  );
}

function AdminGate({ onUnlock }) {
  const [password, setPassword] = useState("");

  const submit = (event) => {
    event.preventDefault();
    sessionStorage.setItem(STORAGE_ADMIN_TOKEN, password);
    onUnlock(password);
  };

  return (
    <main className="admin-page">
      <section className="admin-login">
        <div>
          <p className="eyebrow"><CircleUserRound size={16} /> Admin</p>
          <h1>Ingresar al panel</h1>
          <p>Usa la contrasena configurada como ADMIN_TOKEN en Vercel.</p>
        </div>
        <form onSubmit={submit}>
          <label>
            Contrasena
            <input
              autoFocus
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ADMIN_TOKEN"
            />
          </label>
          <button className="primary-button" type="submit">Entrar</button>
        </form>
      </section>
    </main>
  );
}

function AdminPanel({ products, setProducts, refreshProducts, apiReady, adminToken, onLogout }) {
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const adminHeaders = () => ({ "x-admin-token": adminToken });

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const id = editingId || slugify(form.name) || crypto.randomUUID();
    const next = {
      ...form,
      id,
      price: Number(form.price),
      oldPrice: Number(form.oldPrice),
      stock: Number(form.stock)
    };

    try {
      const saved = await apiRequest("/api/products", {
        method: editingId ? "PUT" : "POST",
        headers: adminHeaders(),
        body: JSON.stringify(next)
      });

      setProducts((items) => {
        const exists = items.some((item) => item.id === saved.id);
        return exists ? items.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...items];
      });
      setEditingId("");
      setForm(initialForm);
      setNotice("Producto guardado en MongoDB.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm(product);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (confirm("Eliminar este producto?")) {
      try {
        await apiRequest(`/api/products?id=${encodeURIComponent(id)}`, {
          method: "DELETE",
          headers: adminHeaders()
        });
        setProducts((items) => items.filter((item) => item.id !== id));
        setNotice("Producto eliminado de MongoDB.");
      } catch (error) {
        setNotice(error.message);
      }
    }
  };

  const exportCatalog = () => {
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "catalogo-norte-suplementos.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const seedCatalog = async (catalog) => {
    setSaving(true);
    setNotice("");
    try {
      await apiRequest("/api/seed", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify(catalog)
      });
      await refreshProducts();
      setNotice("Catalogo sincronizado con MongoDB.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  const importCatalog = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (Array.isArray(parsed)) {
          await seedCatalog(parsed);
        }
      } catch {
        alert("El archivo no parece ser un catalogo valido.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow"><CircleUserRound size={16} /> Panel de admin</p>
          <h1>Gestiona productos, precios, stock, promos e imagenes.</h1>
          <p className="admin-status">{apiReady ? "Conectado a MongoDB." : "Configura MONGODB_URI para conectar la base."}</p>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" onClick={onLogout}>
            Cerrar sesion <X size={18} />
          </button>
          <button className="primary-button" onClick={exportCatalog}>
            Exportar catalogo <Upload size={18} />
          </button>
          <label className="file-button">
            Importar
            <input type="file" accept="application/json" onChange={importCatalog} />
          </label>
        </div>
      </section>

      <section className="admin-layout">
        {notice && <p className="admin-notice">{notice}</p>}

        <form className="product-form" onSubmit={saveProduct}>
          <h2>{editingId ? "Editar producto" : "Nuevo producto"}</h2>
          <label>Nombre<input required value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
          <div className="two-cols">
            <label>Categoria<input value={form.category} onChange={(e) => update("category", e.target.value)} /></label>
            <label>Objetivo<select value={form.objective} onChange={(e) => update("objective", e.target.value)}>{objectives.map((item) => <option key={item.name}>{item.name}</option>)}</select></label>
          </div>
          <div className="two-cols">
            <label>Sabor<input value={form.flavor} onChange={(e) => update("flavor", e.target.value)} /></label>
            <label>Tamano<input value={form.size} onChange={(e) => update("size", e.target.value)} /></label>
          </div>
          <div className="three-cols">
            <label>Precio<input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></label>
            <label>Precio anterior<input type="number" value={form.oldPrice} onChange={(e) => update("oldPrice", e.target.value)} /></label>
            <label>Stock<input type="number" value={form.stock} onChange={(e) => update("stock", e.target.value)} /></label>
          </div>
          <div className="two-cols">
            <label>Etiqueta<input value={form.badge} onChange={(e) => update("badge", e.target.value)} /></label>
            <label>Color<input type="color" value={form.color} onChange={(e) => update("color", e.target.value)} /></label>
          </div>
          <label>URL de imagen<input value={form.image} onChange={(e) => update("image", e.target.value)} placeholder="https://..." /></label>
          <label>Descripcion<textarea value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
          <label className="check-line">
            <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} />
            Mostrar como destacado
          </label>
          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}><Plus size={18} /> Guardar producto</button>
            {editingId && <button className="ghost-button" type="button" onClick={() => { setEditingId(""); setForm(initialForm); }}>Cancelar</button>}
          </div>
        </form>

        <div className="admin-table">
          <div className="table-head">
            <h2>Catalogo actual</h2>
            <span>{products.length} productos</span>
          </div>
          {products.map((product) => (
            <div className="admin-row" key={product.id}>
              <ProductVisual product={product} compact />
              <div>
                <strong>{product.name}</strong>
                <span>{product.category} - {product.stock} en stock - {money(product.price)}</span>
              </div>
              <button className="icon-button" onClick={() => editProduct(product)} aria-label="Editar">
                <Edit3 size={18} />
              </button>
              <button className="icon-button danger" onClick={() => deleteProduct(product.id)} aria-label="Eliminar">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

function App() {
  const { products, setProducts, refreshProducts, status, apiReady } = useProducts();
  const [cart, setCart] = useLocalState(STORAGE_CART, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeView, setActiveView] = useState("shop");
  const [selectedObjective, setSelectedObjective] = useState("Todos");
  const [adminToken, setAdminToken] = useState(getStoredAdminToken);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const addToCart = (id) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === id);
      return existing ? items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)) : [...items, { id, qty: 1 }];
    });
    setCartOpen(true);
  };

  return (
    <div>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} activeView={activeView} setActiveView={setActiveView} />
      {status && <div className="site-status">{status}</div>}
      {activeView === "admin" ? (
        adminToken ? (
          <AdminPanel
            products={products}
            setProducts={setProducts}
            refreshProducts={refreshProducts}
            apiReady={apiReady}
            adminToken={adminToken}
            onLogout={() => {
              sessionStorage.removeItem(STORAGE_ADMIN_TOKEN);
              setAdminToken("");
            }}
          />
        ) : (
          <AdminGate onUnlock={setAdminToken} />
        )
      ) : (
        <main>
          <Storefront
            products={products}
            addToCart={addToCart}
            selectedObjective={selectedObjective}
            setSelectedObjective={setSelectedObjective}
            activeView={activeView}
            setActiveView={setActiveView}
          />
          {["nosotros", "contacto"].includes(activeView) && <AboutAndContact />}
        </main>
      )}
      <footer>
        <img src="/logo-horizontal.png" alt="Norte Suplementos" />
        <span>2026 Norte Suplementos. Tienda preparada para Vercel y MongoDB.</span>
      </footer>
      <CartDrawer open={cartOpen} setOpen={setCartOpen} cart={cart} products={products} setCart={setCart} />
      {cartOpen && <button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

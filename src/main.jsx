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

const defaultSettings = {
  topLeft: "Envío gratis a partir de $80.000",
  topCenter: "Suplementos de calidad para resultados reales",
  topRight: "3 cuotas sin interés"
};

const routeToView = {
  "/": "shop",
  "/productos": "productos",
  "/categorias": "categorias",
  "/packs": "packs",
  "/nosotros": "nosotros",
  "/contacto": "contacto",
  "/admin": "admin",
  "/checkout": "checkout"
};

const viewToRoute = {
  shop: "/",
  productos: "/productos",
  "categorías": "/categorias",
  categorias: "/categorias",
  packs: "/packs",
  nosotros: "/nosotros",
  contacto: "/contacto",
  admin: "/admin",
  checkout: "/checkout"
};

const publicCategories = [
  { name: "Proteínas", slug: "proteinas", icon: Dumbbell },
  { name: "Creatinas", slug: "creatinas", icon: Bolt },
  { name: "Pre-entrenos", slug: "pre-entrenos", icon: Flame }
];

const categoryNames = publicCategories.map((category) => category.name);

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
    available: true,
    featured: true,
    badge: "Más vendido",
    color: "#d69b2d",
    description: "Proteína premium para recuperación muscular y aporte diario de aminoácidos.",
    images: []
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
    available: true,
    featured: true,
    badge: "Volumen",
    color: "#8a5a2f",
    description: "Calorías, carbohidratos y proteínas para etapas de volumen exigentes.",
    images: []
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
    available: true,
    featured: true,
    badge: "Nuevo",
    color: "#c4c4c4",
    description: "Creatina micronizada para potencia, fuerza y rendimiento sostenido.",
    images: []
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
    available: true,
    featured: true,
    badge: "Combo ideal",
    color: "#d9a01f",
    description: "Shaker resistente con tapa segura para entrenar y llevar tus suplementos.",
    images: []
  },
  {
    id: "pre-workout",
    name: "Pre-Workout",
    category: "Pre-entrenos",
    objective: "Enfoque",
    flavor: "Frutos rojos",
    size: "300 g",
    price: 34990,
    oldPrice: 39990,
    available: true,
    featured: true,
    badge: "Energía",
    color: "#b9302a",
    description: "Fórmula para energía, foco y empuje antes de entrenamientos intensos.",
    images: []
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
    available: true,
    featured: false,
    badge: "Ahorro",
    color: "#2e78a6",
    description: "Whey, creatina y shaker para sostener un plan simple y efectivo.",
    images: []
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
  available: true,
  featured: false,
  badge: "",
  color: "#d69b2d",
  description: "",
  images: []
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

function getProductImages(product) {
  return Array.isArray(product.images) && product.images.length
    ? product.images.filter(Boolean).slice(0, 3)
    : product.image
      ? [product.image]
      : [];
}

function getDiscountPercent(product) {
  if (!product.oldPrice || product.oldPrice <= product.price) return 0;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

function normalizeCategory(category = "") {
  const clean = String(category)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (clean.includes("prote")) return "Proteínas";
  if (clean.includes("creat")) return "Creatinas";
  if (clean.includes("pre")) return "Pre-entrenos";
  return categoryNames.includes(category) ? category : "Proteínas";
}

function normalizeClientProduct(product) {
  return {
    ...product,
    category: normalizeCategory(product.category),
    available: product.available !== false,
    images: getProductImages(product)
  };
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
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("Cargando catálogo...");
  const [apiReady, setApiReady] = useState(false);

  const refreshProducts = async () => {
    try {
      setStatus("Cargando catálogo...");
      const remoteProducts = await apiRequest("/api/products");
      setProducts(remoteProducts.map(normalizeClientProduct));
      setApiReady(true);
      setStatus("");
    } catch (error) {
      setProducts([]);
      setApiReady(false);
      setStatus(`MongoDB no conecto: ${error.message}`);
    }
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  return { products, setProducts, refreshProducts, status, apiReady };
}

function useSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [settingsReady, setSettingsReady] = useState(false);

  const refreshSettings = async () => {
    try {
      const remoteSettings = await apiRequest("/api/settings");
      setSettings({ ...defaultSettings, ...remoteSettings });
      setSettingsReady(true);
    } catch {
      setSettings(defaultSettings);
      setSettingsReady(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return { settings, setSettings, refreshSettings, settingsReady };
}

function getCurrentView() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  return routeToView[path] || (getCurrentProductId() ? "product" : "shop");
}

function getCurrentProductId() {
  const path = window.location.pathname.replace(/\/$/, "") || "/";
  if (routeToView[path] || path === "/") return "";
  const parts = path.split("/").filter(Boolean);
  return parts.length === 1 ? parts[0] : "";
}

function ProductVisual({ product, compact = false }) {
  const images = getProductImages(product);
  if (images.length) {
    return <img className="product-photo" src={images[0]} alt={product.name} />;
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

function Header({ cartCount, onCartOpen, activeView, setActiveView, settings }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = ["Inicio", "Productos", "Packs", "Contacto"];

  const go = (item) => {
    const next = item === "Inicio" ? "shop" : item.toLowerCase();
    setActiveView(next);
    setMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="top-strip">
        <span>{settings.topLeft}</span>
        <b><Bolt size={18} /> {settings.topCenter} <Bolt size={18} /></b>
        <span>{settings.topRight}</span>
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
              {["Productos"].includes(item) && <ChevronDown size={14} />}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setActiveView("productos")} aria-label="Buscar">
            <Search size={22} />
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

function Hero() {
  return (
    <section className="hero image-hero" aria-label="Norte Suplementos">
      <img src="/banner.png" alt="Norte Suplementos" />
    </section>
  );
}

function CategoryRail({ selectedCategory, setSelectedCategory, setActiveView }) {
  return (
    <section className="objective-rail">
      {publicCategories.map(({ name, icon: Icon }) => (
        <button
          key={name}
          className={selectedCategory === name ? "selected" : ""}
          onClick={() => {
            setSelectedCategory(selectedCategory === name ? "Todas" : name);
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

function ProductCard({ product, addToCart, openProduct }) {
  const discount = getDiscountPercent(product);
  return (
    <article className="product-card" onClick={() => openProduct?.(product.id)}>
      {product.badge && <span className="badge">{product.badge}</span>}
      {discount > 0 && <span className="discount-badge">-{discount}%</span>}
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
        <small>{discount > 0 ? "Producto en promo" : "Pago por transferencia"}</small>
        <button onClick={(event) => { event.stopPropagation(); addToCart(product.id); }}>
          <ShoppingCart size={17} /> Agregar al carrito
        </button>
      </div>
    </article>
  );
}

function Storefront({ products, addToCart, openProduct, selectedCategory, setSelectedCategory, activeView, setActiveView }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState("destacados");
  const availableProducts = useMemo(() => products.filter((product) => product.available !== false), [products]);

  const categories = useMemo(() => ["Todas", ...new Set(availableProducts.map((p) => p.category))], [availableProducts]);

  const visibleProducts = useMemo(() => {
    return availableProducts
      .filter((product) => category === "Todas" || product.category === category)
      .filter((product) => selectedCategory === "Todas" || product.category === selectedCategory)
      .filter((product) => `${product.name} ${product.category} ${product.flavor}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "precio-menor") return a.price - b.price;
        if (sort === "precio-mayor") return b.price - a.price;
        return Number(b.featured) - Number(a.featured);
      });
  }, [availableProducts, category, selectedCategory, query, sort]);

  const featured = availableProducts.filter((p) => p.featured).slice(0, 5);
  const showFullCatalog = ["productos", "categorias", "packs"].includes(activeView);
  const catalogProducts = activeView === "packs" ? visibleProducts.filter((p) => p.category === "Packs") : visibleProducts;

  return (
    <>
      <Hero />
      <CategoryRail
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
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
          <ProductCard key={product.id} product={product} addToCart={addToCart} openProduct={openProduct} />
        ))}
        {featured.length === 0 && (
          <div className="empty-catalog">
            <h3>Todavia no hay productos destacados</h3>
            <p>Muy pronto vas a encontrar novedades destacadas.</p>
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
              <h2>Elegí por categoría o búsqueda</h2>
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
            <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
              <option>Todas</option>
              {categoryNames.map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="destacados">Destacados</option>
              <option value="precio-menor">Menor precio</option>
              <option value="precio-mayor">Mayor precio</option>
            </select>
          </div>
          <div className="product-grid">
            {catalogProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} openProduct={openProduct} />
            ))}
            {catalogProducts.length === 0 && (
              <div className="empty-catalog">
                <h3>No hay productos para mostrar</h3>
                <p>Probá cambiando los filtros o volvé más tarde.</p>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}

function ProductListing({ products, addToCart, openProduct, selectedCategory, setSelectedCategory, activeView }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todas");
  const [sort, setSort] = useState("destacados");
  const availableProducts = useMemo(() => products.filter((product) => product.available !== false), [products]);
  const categories = useMemo(() => ["Todas", ...categoryNames], []);
  const categoryFilter = selectedCategory !== "Todas" ? selectedCategory : category;
  const forcedCategory = activeView === "packs" ? "Packs" : categoryFilter;

  const visibleProducts = useMemo(() => {
    return availableProducts
      .filter((product) => forcedCategory === "Todas" || product.category === forcedCategory)
      .filter((product) => `${product.name} ${product.category} ${product.flavor}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => {
        if (sort === "precio-menor") return a.price - b.price;
        if (sort === "precio-mayor") return b.price - a.price;
        if (sort === "promo") return getDiscountPercent(b) - getDiscountPercent(a);
        return Number(b.featured) - Number(a.featured);
      });
  }, [availableProducts, forcedCategory, categoryFilter, query, sort]);

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div>
          <p className="eyebrow"><Filter size={16} /> Productos</p>
          <h1>{activeView === "packs" ? "Packs" : "Todos los productos"}</h1>
          <p>Explorá el catálogo, filtrá por categoría y agregá tus suplementos al carrito.</p>
        </div>
      </section>

      <section className="catalog-panel full-catalog">
        <div className="filters">
          <label>
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar producto" />
          </label>
          <select value={category} onChange={(event) => setCategory(event.target.value)} disabled={activeView === "packs"}>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
            <option>Todas</option>
            {categoryNames.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="destacados">Destacados</option>
            <option value="promo">Mayor descuento</option>
            <option value="precio-menor">Menor precio</option>
            <option value="precio-mayor">Mayor precio</option>
          </select>
        </div>

        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} addToCart={addToCart} openProduct={openProduct} />
          ))}
          {visibleProducts.length === 0 && (
            <div className="empty-catalog">
              <h3>{activeView === "packs" ? "Pronto vamos a cargar packs especiales" : "No hay productos disponibles"}</h3>
              <p>{activeView === "packs" ? "Estamos preparando combos para que puedas ahorrar más." : "Probá cambiando los filtros o volvé más tarde."}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProductDetail({ product, addToCart, setActiveView, loading }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const images = getProductImages(product);
  const discount = getDiscountPercent(product);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  if (loading) {
    return (
      <main className="product-detail-page">
        <section className="empty-catalog">
          <h3>Cargando producto</h3>
          <p>Estamos buscando la información del producto.</p>
        </section>
      </main>
    );
  }

  if (!product || product.available === false) {
    return (
      <main className="product-detail-page">
        <section className="empty-catalog">
          <h3>Producto no disponible</h3>
          <p>El producto que buscás no está disponible por el momento.</p>
          <button className="primary-button" onClick={() => setActiveView("productos")}>Ver productos</button>
        </section>
      </main>
    );
  }

  return (
    <main className="product-detail-page">
      <button className="link-button detail-back" onClick={() => setActiveView("productos")}>
        <ArrowRight size={18} /> Volver a productos
      </button>
      <section className="product-detail">
        <div className="detail-gallery">
          <div className="detail-main-image">
            {images.length ? <img src={images[selectedImage]} alt={product.name} /> : <ProductVisual product={product} />}
          </div>
          {images.length > 1 && (
            <div className="detail-thumbs">
              {images.map((image, index) => (
                <button
                  key={`${image.slice(0, 24)}-${index}`}
                  className={selectedImage === index ? "selected" : ""}
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Ver foto ${index + 1}`}
                >
                  <img src={image} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="detail-meta">{product.size}{product.flavor ? ` · ${product.flavor}` : ""}</p>
          <div className="price-row detail-price">
            <strong>{money(product.price)}</strong>
            {product.oldPrice > product.price && <del>{money(product.oldPrice)}</del>}
            {discount > 0 && <span className="discount-badge inline">-{discount}%</span>}
          </div>
          <p className="detail-description">{product.description || "Producto seleccionado para acompañar tu entrenamiento."}</p>
          <button className="primary-button" onClick={() => addToCart(product.id)}>
            <ShoppingCart size={18} /> Agregar al carrito
          </button>
        </div>
      </section>
    </main>
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
          <li><PackageCheck size={20} /> Catálogo curado por categorías.</li>
          <li><Truck size={20} /> Envíos coordinados a todo el país.</li>
          <li><BadgePercent size={20} /> Packs y promociones actualizadas constantemente.</li>
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
          <a className="ghost-button" href="https://www.instagram.com/suplemento.norte/" target="_blank" rel="noreferrer">
            Instagram <Instagram size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}

function CartDrawer({ open, setOpen, cart, products, setCart, goToCheckout }) {
  const lines = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.id) }))
    .filter((item) => item.product && item.product.available !== false);
  const total = lines.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const updateQty = (id, delta) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
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
      <div className="cart-footer">
        <div>
          <span>Total</span>
          <strong>{money(total)}</strong>
        </div>
        <button
          type="button"
          className={`primary-button ${lines.length === 0 ? "disabled" : ""}`}
          disabled={lines.length === 0}
          onClick={() => {
            setOpen(false);
            goToCheckout();
          }}
        >
          Ir al checkout <ArrowRight size={18} />
        </button>
        <small>Pago únicamente por transferencia. Completas tus datos en el checkout.</small>
      </div>
    </aside>
  );
}

function CheckoutPage({ cart, products, setCart, setActiveView }) {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });
  const lines = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.id) }))
    .filter((item) => item.product && item.product.available !== false);
  const total = lines.reduce((sum, item) => sum + item.product.price * item.qty, 0);

  const updateCustomer = (field, value) => {
    setCustomer((current) => ({ ...current, [field]: value }));
  };

  const checkoutText = encodeURIComponent(
    `Hola Norte Suplementos, quiero hacer este pedido:\n\nCliente:\nNombre: ${customer.name}\nTeléfono: ${customer.phone}\nDirección: ${customer.address}\nLocalidad: ${customer.city}\nNotas: ${customer.notes || "-"}\n\nProductos:\n${lines
      .map((item) => `- ${item.product.name} x${item.qty}: ${money(item.product.price * item.qty)}`)
      .join("\n")}\n\nTotal: ${money(total)}\nForma de pago: transferencia bancaria.`
  );

  const updateQty = (id, delta) => {
    setCart((items) =>
      items
        .map((item) => (item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const submitCheckout = (event) => {
    event.preventDefault();
    if (!lines.length) return;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${checkoutText}`, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="checkout-page">
      <section className="checkout-head">
        <div>
          <p className="eyebrow"><ShoppingCart size={16} /> Checkout</p>
          <h1>Finalizar compra</h1>
          <p>Completas tus datos y enviamos el pedido por WhatsApp. El pago es únicamente por transferencia.</p>
        </div>
        <button className="ghost-button" onClick={() => setActiveView("productos")}>
          Seguir comprando <ArrowRight size={18} />
        </button>
      </section>

      <section className="checkout-layout">
        <form className="checkout-form" onSubmit={submitCheckout}>
          <h2>Datos del cliente</h2>
          <label>Nombre y apellido<input required value={customer.name} onChange={(event) => updateCustomer("name", event.target.value)} /></label>
          <label>Teléfono<input required value={customer.phone} onChange={(event) => updateCustomer("phone", event.target.value)} /></label>
          <label>Dirección<input required value={customer.address} onChange={(event) => updateCustomer("address", event.target.value)} /></label>
          <label>Localidad<input required value={customer.city} onChange={(event) => updateCustomer("city", event.target.value)} /></label>
          <label>Notas<textarea value={customer.notes} onChange={(event) => updateCustomer("notes", event.target.value)} placeholder="Horario, referencias o consulta" /></label>
          <button className="primary-button" type="submit" disabled={!lines.length}>
            Enviar pedido por WhatsApp <MessageCircle size={18} />
          </button>
        </form>

        <aside className="checkout-summary">
          <h2>Tu pedido</h2>
          {lines.length === 0 && <p className="empty">Todavia no agregaste productos.</p>}
          {lines.map(({ product, qty }) => (
            <div className="cart-line" key={product.id}>
              <ProductVisual product={product} compact />
              <div>
                <strong>{product.name}</strong>
                <span>{money(product.price)}</span>
                <div className="qty-control">
                  <button type="button" onClick={() => updateQty(product.id, -1)}>-</button>
                  <b>{qty}</b>
                  <button type="button" onClick={() => updateQty(product.id, 1)}>+</button>
                </div>
              </div>
            </div>
          ))}
          <div className="checkout-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
        </aside>
      </section>
    </main>
  );
}

function AdminGate({ onUnlock }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setChecking(true);
    setError("");
    try {
      await apiRequest("/api/auth", {
        method: "POST",
        headers: { "x-admin-token": password },
        body: JSON.stringify({})
      });
      sessionStorage.setItem(STORAGE_ADMIN_TOKEN, password);
      onUnlock(password);
    } catch (authError) {
      setError(authError.message);
    } finally {
      setChecking(false);
    }
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
            Contraseña
            <input
              autoFocus
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ADMIN_TOKEN"
            />
          </label>
          {error && <p className="admin-notice">{error}</p>}
          <button className="primary-button" type="submit" disabled={checking}>Entrar</button>
        </form>
      </section>
    </main>
  );
}

function AdminPanel({ products, setProducts, refreshProducts, apiReady, adminToken, onLogout, settings, setSettings, refreshSettings }) {
  const [form, setForm] = useState(initialForm);
  const [settingsForm, setSettingsForm] = useState(settings);
  const [editingId, setEditingId] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const updateSettings = (field, value) => setSettingsForm((current) => ({ ...current, [field]: value }));

  const adminHeaders = () => ({ "x-admin-token": adminToken });

  const uploadProductImages = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const currentImages = getProductImages(form);
    const availableSlots = Math.max(0, 3 - currentImages.length);
    const selectedFiles = files.slice(0, availableSlots);

    if (!availableSlots) {
      setNotice("Cada producto puede tener hasta 3 fotos.");
      event.target.value = "";
      return;
    }

    for (const file of selectedFiles) {
      if (!file.type.startsWith("image/")) {
        setNotice("Todos los archivos deben ser imágenes.");
        event.target.value = "";
        return;
      }

      if (file.size > 900 * 1024) {
        setNotice("Cada imagen debe pesar menos de 900 KB.");
        event.target.value = "";
        return;
      }
    }

    const newImages = await Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.readAsDataURL(file);
          })
      )
    );

    update("images", [...currentImages, ...newImages].slice(0, 3));
    event.target.value = "";
  };

  const removeProductImage = (index) => {
    update("images", getProductImages(form).filter((_, imageIndex) => imageIndex !== index));
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    const id = editingId || slugify(form.name) || crypto.randomUUID();
    const next = {
      ...form,
      id,
      category: normalizeCategory(form.category),
      objective: normalizeCategory(form.category),
      price: Number(form.price),
      oldPrice: Number(form.oldPrice),
      available: form.available !== false,
      images: getProductImages(form)
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
    setForm({ ...product, available: product.available !== false, images: getProductImages(product) });
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
    link.download = "catálogo-norte-suplementos.json";
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
        alert("El archivo no parece ser un catálogo valido.");
      }
    };
    reader.readAsText(file);
  };

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    try {
      const saved = await apiRequest("/api/settings", {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify(settingsForm)
      });
      setSettings(saved);
      await refreshSettings();
      setNotice("Textos superiores guardados.");
    } catch (error) {
      setNotice(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <div>
          <p className="eyebrow"><CircleUserRound size={16} /> Panel de admin</p>
          <h1>Gestioná productos, precios, disponibilidad, promos e imágenes.</h1>
          <p className="admin-status">{apiReady ? "Conectado a MongoDB." : "Configura MONGODB_URI para conectar la base."}</p>
        </div>
        <div className="admin-actions">
          <button className="ghost-button" onClick={onLogout}>
            Cerrar sesión <X size={18} />
          </button>
          <button className="primary-button" onClick={exportCatalog}>
            Exportar catálogo <Upload size={18} />
          </button>
          <label className="file-button">
            Importar
            <input type="file" accept="application/json" onChange={importCatalog} />
          </label>
        </div>
      </section>

      <section className="admin-layout">
        {notice && <p className="admin-notice">{notice}</p>}

        <form className="settings-form" onSubmit={saveSettings}>
          <h2>Barra superior</h2>
          <label>Texto izquierdo<input value={settingsForm.topLeft || ""} onChange={(e) => updateSettings("topLeft", e.target.value)} /></label>
          <label>Texto central<input value={settingsForm.topCenter || ""} onChange={(e) => updateSettings("topCenter", e.target.value)} /></label>
          <label>Texto derecho<input value={settingsForm.topRight || ""} onChange={(e) => updateSettings("topRight", e.target.value)} /></label>
          <button className="primary-button" type="submit" disabled={saving}>Guardar textos</button>
        </form>

        <form className="product-form" onSubmit={saveProduct}>
          <h2>{editingId ? "Editar producto" : "Nuevo producto"}</h2>
          <label>Nombre<input required value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
          <div className="two-cols">
            <label>Categoría<select value={form.category} onChange={(e) => update("category", e.target.value)}>{categoryNames.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Sabor<input value={form.flavor} onChange={(e) => update("flavor", e.target.value)} /></label>
          </div>
          <div className="two-cols">
            <label>Tamaño<input value={form.size} onChange={(e) => update("size", e.target.value)} /></label>
            <label>Etiqueta<input value={form.badge} onChange={(e) => update("badge", e.target.value)} /></label>
          </div>
          <div className="three-cols">
            <label>Precio<input type="number" value={form.price} onChange={(e) => update("price", e.target.value)} /></label>
            <label>Precio anterior<input type="number" value={form.oldPrice} onChange={(e) => update("oldPrice", e.target.value)} /></label>
            <label>Disponibilidad<select value={form.available === false ? "no" : "yes"} onChange={(e) => update("available", e.target.value === "yes")}><option value="yes">Disponible</option><option value="no">No disponible</option></select></label>
          </div>
          <div className="two-cols">
            <label>Color<input type="color" value={form.color} onChange={(e) => update("color", e.target.value)} /></label>
          </div>
          <div className="image-upload-field">
            <label>Fotos del producto<input type="file" accept="image/*" multiple onChange={uploadProductImages} disabled={getProductImages(form).length >= 3} /></label>
            <small>{getProductImages(form).length}/3 fotos cargadas</small>
            {getProductImages(form).length > 0 && (
              <div className="image-preview-grid">
                {getProductImages(form).map((image, index) => (
                  <div className="image-preview" key={`${image.slice(0, 24)}-${index}`}>
                    <img src={image} alt={`Vista previa ${index + 1}`} />
                    <button className="ghost-button" type="button" onClick={() => removeProductImage(index)}>Quitar</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <label>Descripción<textarea value={form.description} onChange={(e) => update("description", e.target.value)} /></label>
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
                <span>{product.category} - {product.available === false ? "No disponible" : "Disponible"} - {money(product.price)}</span>
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
  const { settings, setSettings, refreshSettings } = useSettings();
  const [cart, setCart] = useLocalState(STORAGE_CART, []);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeViewState, setActiveViewState] = useState(getCurrentView);
  const [activeProductId, setActiveProductId] = useState(getCurrentProductId);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [adminToken, setAdminToken] = useState(getStoredAdminToken);

  useEffect(() => {
    const onPopState = () => {
      setActiveViewState(getCurrentView());
      setActiveProductId(getCurrentProductId());
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const setActiveView = (view) => {
    const nextView = view || "shop";
    const route = viewToRoute[nextView] || "/";
    setActiveViewState(nextView);
    setActiveProductId("");
    if (window.location.pathname !== route) {
      window.history.pushState({}, "", route);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const activeView = activeViewState;
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const activeProduct = products.find((product) => product.id === activeProductId);

  const openProduct = (id) => {
    setActiveProductId(id);
    setActiveViewState("product");
    const route = `/${id}`;
    if (window.location.pathname !== route) {
      window.history.pushState({}, "", route);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addToCart = (id) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === id);
      return existing ? items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)) : [...items, { id, qty: 1 }];
    });
    setCartOpen(true);
  };

  return (
    <div>
      <Header cartCount={cartCount} onCartOpen={() => setCartOpen(true)} activeView={activeView} setActiveView={setActiveView} settings={settings} />
      {activeView === "admin" && status && <div className="site-status">{status}</div>}
      {activeView === "admin" ? (
        adminToken ? (
          <AdminPanel
            products={products}
            setProducts={setProducts}
            refreshProducts={refreshProducts}
            apiReady={apiReady}
            adminToken={adminToken}
            settings={settings}
            setSettings={setSettings}
            refreshSettings={refreshSettings}
            onLogout={() => {
              sessionStorage.removeItem(STORAGE_ADMIN_TOKEN);
              setAdminToken("");
            }}
          />
        ) : (
          <AdminGate onUnlock={setAdminToken} />
        )
      ) : activeView === "checkout" ? (
        <CheckoutPage cart={cart} products={products} setCart={setCart} setActiveView={setActiveView} />
      ) : activeView === "product" ? (
        <ProductDetail product={activeProduct} addToCart={addToCart} setActiveView={setActiveView} loading={products.length === 0 && Boolean(status)} />
      ) : ["productos", "categorias", "packs"].includes(activeView) ? (
        <ProductListing
          products={products}
          addToCart={addToCart}
          openProduct={openProduct}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          activeView={activeView}
        />
      ) : (
        <main>
          <Storefront
            products={products}
            addToCart={addToCart}
            openProduct={openProduct}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
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
      <CartDrawer
        open={cartOpen}
        setOpen={setCartOpen}
        cart={cart}
        products={products}
        setCart={setCart}
        goToCheckout={() => setActiveView("checkout")}
      />
      {cartOpen && <button className="drawer-backdrop" onClick={() => setCartOpen(false)} aria-label="Cerrar carrito" />}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);

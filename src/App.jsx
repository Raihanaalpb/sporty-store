import { useState, useMemo, useRef, useEffect } from "react";

// ====== IDENTITÉ VISUELLE (palette girly / Playfair Display) ======
const COLORS = {
  ink: "#3A2C33",
  paper: "#FCF3F2",
  moss: "#C9647E",
  mossDark: "#A84964",
  citrus: "#E8B4A2",
  chalk: "#A6919A",
  card: "#FFFFFF",
};

// N'oublie pas d'importer la police dans ton index.html (public/index.html) :
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Italiana&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
const DISPLAY_FONT = "'Playfair Display', serif";
const BODY_FONT = "'Inter', system-ui, sans-serif";

// ====== CONFIG CATÉGORIES ======
const CATEGORIES = {
  yoga: { label: "Yoga", subs: ["Sea", "Huly", "A"] },
  bikini: { label: "Bikini", subs: ["Casa", "G", "D"] },
  pretaporter: { label: "Prêt-à-porter", subs: ["Ora", "Vela", "Aeli"] },
};

const SUB_WEIGHTS = {
  Sea: 400,
  Huly: 400,
  Casa: 150,
  G: 150,
  D: 150,
  Ora: 350,
  Vela: 350,
  Aeli: 350,
  A: 300,
};

// ====== PRODUITS RÉELS "A" (dossier /test/al/...) ======
const A_BASE_URL = "https://qhkpehujmkeraupworzb.supabase.co/storage/v1/object/public/test/al";

// ⚠️ Il manque encore les noms exacts des 5 fichiers "Airbrush Better Together Te..."
// (coupés dans la capture) — ajoute-les dans ce tableau dès que tu les as.
const A_PRODUCTS_CONFIG = {
  "ensemble-bra-jupe-tennis": {
    folder: "ensemble bra & jupe tennis",
    sub: "A",
    price: 60,
    colors: ["Blanc", "Noir", "Rose", "Bleu"],
    files: [
      "Airbrush Better Together Tennis Skirt - Paradise _White--0.jpg",
      "Airbrush Better Together Tennis Skirt - Paradise black.jpg",
      "Airbrush Better Together Tennis Skirt - Paradise Pink--0.png",
      "Airbrush Better Together Tennis Skirt - Paradise Pink_--4.jpg",
      "Airbrush Better Together Tennis Skirt - Paradise Pink_White--2 copie.jpg",
      "beu1.JPG",
      "bleu.JPG",
      "noir.JPG",
    ],
  },
};

const A_PRODUCTS = Object.entries(A_PRODUCTS_CONFIG).map(([id, p]) => ({
  id,
  title: "Ensemble bra & jupe tennis",
  cat: "yoga",
  sub: p.sub,
  price: p.price,
  colors: p.colors,
  weightGrams: SUB_WEIGHTS[p.sub],
  images: p.files.map((f) => `${A_BASE_URL}/${encodeURIComponent(p.folder)}/${encodeURIComponent(f)}`),
  imageUrl: p.files.length
    ? `${A_BASE_URL}/${encodeURIComponent(p.folder)}/${encodeURIComponent(p.files[0])}`
    : null,
}));

const ALL_CATS = Object.keys(CATEGORIES);
const SIZES = ["S", "M", "L", "XL"];

// Livraison : 20€ de base jusqu'à 1kg, puis +9€ par kilo supplémentaire
const SHIPPING_BASE = 20;
const SHIPPING_BASE_KG = 1;
const SHIPPING_PER_EXTRA_KG = 9;

// ⚠️ Remplace par ton vrai numéro WhatsApp (indicatif inclus, sans le +)
const WHATSAPP_NUMBER = "33782216309";
// Ton pseudo Revolut
const REVOLUT_USERNAME = "raihanav111";
// Ton client-id PayPal Business
const PAYPAL_CLIENT_ID = "AZ9qRcEfa5o6YuvIi8NH-8k3BDmmFd-ZOKxDZrva5B5G6mLu0_PWFm5rmTKkuuObXAtBfGFcAJbcRAfO";

const CART_STORAGE_KEY = "sporty_store_cart_v1";

// ====== PRODUITS RÉELS "CASA" (bikinis, avec vraies photos Supabase) ======
const CASA_BASE_URL = "https://qhkpehujmkeraupworzb.supabase.co/storage/v1/object/public/test/casa";

// Pour chaque album, liste juste les noms de fichiers (pas l'URL complète).
// Dès que tu as les photos d'un album marqué "files: []", remplis la liste
// et ses vraies photos apparaîtront automatiquement sur le site.
const CASA_ALBUMS = {
  "c-015012": {
    sub: "Casa",
    price: 29,
    files: [
      "IMG_0187.jpeg",
      "IMG_0188.jpeg",
      "IMG_0189.jpeg",
      "IMG_0191.jpeg",
      "IMG_9322.jpeg",
      "IMG_9323.jpeg",
      "IMG_9324.jpeg",
      "IMG_9325.jpeg",
      "IMG_9326.jpeg",
    ],
  },
  "c-025012": {
    sub: "Casa",
    price: 29,
    files: ["IMG_9885.jpeg", "IMG_9886.jpeg", "IMG_9887.jpeg", "IMG_9888.jpeg", "IMG_9889.jpeg", "IMG_9890.jpeg"],
  },
  "c-035012": {
    sub: "Casa",
    price: 29,
    files: ["IMG_6318.jpeg", "IMG_6319.jpeg", "IMG_6320.jpeg", "IMG_6321.jpeg"],
  },
  // ⚠️ En attente : la liste envoyée pour ce produit était identique à celle de c-035012,
  // probablement un copier-coller en trop. Renvoie la vraie liste pour ce produit.
  "c-045512": { sub: "Casa", price: 32, files: [] },
  "c-055512": {
    sub: "Casa",
    price: 32,
    files: ["IMG_6413.jpeg", "IMG_6414.jpeg", "IMG_6415.jpeg", "IMG_6416.jpeg", "IMG_6417.jpeg", "IMG_6418.jpeg", "IMG_6419.jpeg"],
  },
  "c-066512": {
    sub: "Casa",
    price: 32,
    files: ["IMG_7072.jpeg", "IMG_7074.jpeg", "IMG_7075.jpeg"],
  },
  "c-076512": {
    sub: "Casa",
    price: 32,
    files: ["IMG_7076.jpeg", "IMG_7077.jpeg", "IMG_7078.jpeg", "IMG_7079.jpeg", "IMG_7080.jpeg"],
  },
};

const CASA_PRODUCTS = Object.entries(CASA_ALBUMS).map(([albumId, album]) => ({
  id: albumId,
  title: "Bikini " + album.sub + " · " + albumId,
  cat: "bikini",
  sub: album.sub,
  brand: "Casa",
  price: album.price,
  weightGrams: SUB_WEIGHTS[album.sub],
  images: album.files.map((f) => `${CASA_BASE_URL}/${albumId}/${f}`),
  imageUrl: album.files.length ? `${CASA_BASE_URL}/${albumId}/${album.files[0]}` : null,
}));

function formatEUR(n) {
  return Number(n).toFixed(2).replace(".", ",");
}

function computeShipping(totalWeightGrams) {
  const kg = totalWeightGrams / 1000;
  if (kg <= SHIPPING_BASE_KG) return SHIPPING_BASE;
  return SHIPPING_BASE + (kg - SHIPPING_BASE_KG) * SHIPPING_PER_EXTRA_KG;
}

// Génère les produits "factices" restants (Yoga / Prêt-à-porter, en attendant
// leurs vraies photos — Bikini utilise CASA_PRODUCTS, "A" utilise A_PRODUCTS,
// tous deux définis plus haut avec de vraies photos)
function generateProducts() {
  const fakeCats = ALL_CATS.filter((c) => c !== "bikini");
  const fakeProducts = Array.from({ length: 20 }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    const cat = fakeCats[Math.floor(Math.random() * fakeCats.length)];
    const subs = CATEGORIES[cat].subs.filter((s) => s !== "A" && s !== "Casa");
    const sub = subs[Math.floor(Math.random() * subs.length)];
    const price = Math.floor(Math.random() * (89 - 19 + 1)) + 19;
    return {
      id: "f" + n,
      title: sub + " " + n,
      cat,
      sub,
      price,
      weightGrams: SUB_WEIGHTS[sub],
      imageUrl: null, // photos à venir
    };
  });
  return [...CASA_PRODUCTS, ...A_PRODUCTS, ...fakeProducts];
}

function makeKey(productId, size, color) {
  return productId + "::" + size + "::" + (color || "-");
}

function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export default function SportyStoreApp() {
  const [view, setView] = useState("catalogue"); // 'catalogue' | 'panier'
  const [activeCat, setActiveCat] = useState("all");
  const [activeSub, setActiveSub] = useState("all");
  const [cart, setCart] = useState(() => loadCartFromStorage());

  const products = useMemo(() => generateProducts(), []);

  // Persiste le panier (fonctionne une fois déployé sur un vrai domaine — pas dans un aperçu Claude)
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* stockage indisponible, on ignore */
    }
  }, [cart]);

  const subList = useMemo(() => {
    if (activeCat === "all") return Object.values(CATEGORIES).flatMap((c) => c.subs);
    return CATEGORIES[activeCat].subs;
  }, [activeCat]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const mc = activeCat === "all" || p.cat === activeCat;
      const ms = activeSub === "all" || p.sub === activeSub;
      return mc && ms;
    });
  }, [products, activeCat, activeSub]);

  const cartEntries = Object.values(cart);
  const cartCount = cartEntries.reduce((s, i) => s + (i.qty || 1), 0);

  const { subtotal, totalWeightGrams } = useMemo(() => {
    let subtotal = 0;
    let totalWeightGrams = 0;
    cartEntries.forEach((it) => {
      subtotal += it.price * it.qty;
      totalWeightGrams += it.weightGrams * it.qty;
    });
    return { subtotal, totalWeightGrams };
  }, [cart]);

  const shipping = cartEntries.length ? computeShipping(totalWeightGrams) : 0;
  const grandTotal = subtotal + shipping;

  function addToCart(product, size, color) {
    const key = makeKey(product.id, size, color);
    setCart((prev) => {
      const next = { ...prev };
      if (next[key]) {
        next[key] = { ...next[key], qty: next[key].qty + 1 };
      } else {
        next[key] = {
          productId: product.id,
          title: product.title,
          price: product.price,
          weightGrams: product.weightGrams,
          size,
          color: color || null,
          qty: 1,
        };
      }
      return next;
    });
  }

  function changeQty(key, delta) {
    setCart((prev) => {
      const next = { ...prev };
      const newQty = Math.max(1, next[key].qty + delta);
      next[key] = { ...next[key], qty: newQty };
      return next;
    });
  }

  function removeItem(key) {
    setCart((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function clearCart() {
    setCart({});
  }

  function openWhatsapp() {
    if (cartEntries.length === 0) {
      alert("Votre panier est vide.");
      return;
    }
    const lines = ["Bonjour 👋 Je souhaite commander :", ""];
    cartEntries.forEach((it) => {
      lines.push(
        `- ${it.title} | ${it.color ? "Couleur: " + it.color + " | " : ""}Taille: ${it.size} | Quantité: ${it.qty} | ${formatEUR(it.price * it.qty)} €`
      );
    });
    lines.push("");
    lines.push(`Sous-total : ${formatEUR(subtotal)} €`);
    lines.push(`Livraison : ${formatEUR(shipping)} €`);
    lines.push(`Total : ${formatEUR(grandTotal)} €`);
    lines.push("");
    lines.push("Merci !");
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank");
  }

  return (
    <div style={{ background: COLORS.paper, minHeight: "100%", fontFamily: BODY_FONT, color: COLORS.ink }}>
      <div style={{ height: 4, background: `linear-gradient(90deg, ${COLORS.moss} 0%, ${COLORS.citrus} 50%, ${COLORS.moss} 100%)` }} />
      <header style={{ position: "sticky", top: 0, zIndex: 10, background: COLORS.paper, borderBottom: "1px solid rgba(58,44,51,0.12)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div
            style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, fontStyle: "italic", fontSize: 30, letterSpacing: "0.01em", display: "flex", alignItems: "baseline", gap: 8, cursor: "pointer" }}
            onClick={() => setView("catalogue")}
          >
            SPORTY <span style={{ color: COLORS.moss }}>STORE</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: COLORS.ink, borderRadius: 2, padding: "6px 8px 6px 18px" }}>
            <span style={{ color: COLORS.paper, fontSize: 13 }}>Panier</span>
            <span style={{ fontFamily: DISPLAY_FONT, fontWeight: 700, background: COLORS.citrus, color: COLORS.ink, minWidth: 34, height: 34, borderRadius: 2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
              {cartCount}
            </span>
            <button
              onClick={() => setView(view === "catalogue" ? "panier" : "catalogue")}
              style={{ background: COLORS.paper, color: COLORS.ink, border: "none", padding: "9px 16px", borderRadius: 2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
            >
              {view === "catalogue" ? "Voir panier" : "← Catalogue"}
            </button>
          </div>
        </div>
      </header>

      {view === "catalogue" ? (
        <Catalogue
          products={filtered}
          activeCat={activeCat}
          activeSub={activeSub}
          setActiveCat={setActiveCat}
          setActiveSub={setActiveSub}
          addToCart={addToCart}
        />
      ) : (
        <Panier
          cartEntries={cartEntries}
          cart={cart}
          changeQty={changeQty}
          removeItem={removeItem}
          clearCart={clearCart}
          subtotal={subtotal}
          shipping={shipping}
          grandTotal={grandTotal}
          totalWeightGrams={totalWeightGrams}
          openWhatsapp={openWhatsapp}
          setView={setView}
        />
      )}
    </div>
  );
}

// ====== Navigation catégories façon menu déroulant (comme le site) ======
function Catalogue({ products, activeCat, activeSub, setActiveCat, setActiveSub, addToCart }) {
  const [openCat, setOpenCat] = useState(null);
  const [galleryProduct, setGalleryProduct] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenCat(null);
      }
    }
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  function selectCat(cat, sub) {
    setActiveCat(cat);
    setActiveSub(sub);
    setOpenCat(null);
  }

  function resetFilters() {
    setActiveCat("all");
    setActiveSub("all");
    setOpenCat(null);
  }

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ maxWidth: 520, marginBottom: 22 }}>
        <h2 style={{ fontFamily: DISPLAY_FONT, fontSize: 22, letterSpacing: "0.04em", margin: "0 0 6px", color: COLORS.mossDark }}>
          Le catalogue
        </h2>
        <p style={{ margin: 0, color: COLORS.chalk, fontSize: 14, lineHeight: 1.5 }}>
          Choisis une taille, ajoute au panier, on prépare la commande sur WhatsApp — simple et rapide.
        </p>
      </div>

      <div style={{ marginBottom: 26, position: "relative" }} ref={navRef}>
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid rgba(58,44,51,0.14)", flexWrap: "wrap" }}>
          {ALL_CATS.map((catKey) => {
            const cat = CATEGORIES[catKey];
            const isActiveTop = activeCat === catKey;
            const isOpen = openCat === catKey;
            return (
              <div key={catKey} style={{ position: "relative" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    selectCat(catKey, "all");
                    setOpenCat(isOpen ? null : catKey);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "transparent",
                    border: "none",
                    fontFamily: DISPLAY_FONT,
                    fontSize: 16,
                    letterSpacing: "0.02em",
                    color: isActiveTop || isOpen ? COLORS.mossDark : COLORS.ink,
                    padding: "12px 16px",
                    cursor: "pointer",
                    borderBottom: `2px solid ${isActiveTop || isOpen ? COLORS.moss : "transparent"}`,
                  }}
                >
                  {cat.label}
                  <span style={{ fontSize: 10, color: COLORS.moss, display: "inline-block", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s ease" }}>
                    ▾
                  </span>
                </button>

                {isOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      minWidth: 190,
                      background: COLORS.card,
                      borderRadius: 2,
                      boxShadow: "0 16px 32px -16px rgba(58,44,51,0.35)",
                      border: "1px solid rgba(58,44,51,0.08)",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                      zIndex: 15,
                    }}
                  >
                    <button
                      onClick={() => selectCat(catKey, "all")}
                      style={dropdownOptionStyle(isActiveTop && activeSub === "all")}
                    >
                      Tout {cat.label}
                    </button>
                    {cat.subs.map((s) => (
                      <button
                        key={s}
                        onClick={() => selectCat(catKey, s)}
                        style={dropdownOptionStyle(isActiveTop && activeSub === s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {activeCat !== "all" && (
            <button
              onClick={resetFilters}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: COLORS.chalk,
                padding: "12px 10px",
                cursor: "pointer",
                marginLeft: "auto",
                alignSelf: "center",
              }}
            >
              Réinitialiser
            </button>
          )}
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: COLORS.chalk, letterSpacing: "0.03em" }}>
          {products.length} article{products.length > 1 ? "s" : ""}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 20 }}>
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} onOpenGallery={setGalleryProduct} />
        ))}
      </div>

      {galleryProduct && (
        <ProductGallery product={galleryProduct} onClose={() => setGalleryProduct(null)} />
      )}
    </div>
  );
}

function dropdownOptionStyle(active) {
  return {
    textAlign: "left",
    background: active ? COLORS.moss : "transparent",
    border: "none",
    borderRadius: 2,
    padding: "9px 12px",
    fontFamily: BODY_FONT,
    fontSize: 13,
    fontWeight: active ? 600 : 500,
    color: active ? "#fff" : COLORS.ink,
    cursor: "pointer",
  };
}

function ProductCard({ product, onAdd, onOpenGallery }) {
  const [size, setSize] = useState(SIZES[0]);
  const [color, setColor] = useState(product.colors ? product.colors[0] : null);
  const [added, setAdded] = useState(false);
  const hasGallery = product.images && product.images.length > 1;

  function handleAdd() {
    onAdd(product, size, color);
    setAdded(true);
    setTimeout(() => setAdded(false), 900);
  }

  return (
    <div style={{ background: COLORS.card, borderRadius: 2, padding: 14, border: "1px solid rgba(58,44,51,0.06)" }}>
      <div
        onClick={() => hasGallery && onOpenGallery(product)}
        style={{
          position: "relative",
          height: 190,
          width: "100%",
          borderRadius: 2,
          overflow: "hidden",
          background: COLORS.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: hasGallery ? "zoom-in" : "default",
        }}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <span style={{ fontSize: 12, color: COLORS.chalk, fontStyle: "italic" }}>Photos à venir</span>
        )}
        {hasGallery && (
          <span
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              background: "rgba(58,44,51,0.75)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: 2,
            }}
          >
            {product.images.length} photos
          </span>
        )}
      </div>
      <div style={{ marginTop: 12, fontFamily: DISPLAY_FONT, fontSize: 19, letterSpacing: "0.03em" }}>{product.title}</div>
      <span style={{ display: "inline-block", marginTop: 2, fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: COLORS.moss, fontWeight: 600 }}>
        {product.brand ? product.brand : CATEGORIES[product.cat].label}
      </span>
      <div style={{ marginTop: 6, fontWeight: 700, fontSize: 15 }}>{formatEUR(product.price)} €</div>

      {product.colors && (
        <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          {product.colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                border: `1px solid ${color === c ? COLORS.moss : "rgba(58,44,51,0.18)"}`,
                background: color === c ? COLORS.moss : "transparent",
                color: color === c ? "#fff" : COLORS.ink,
                fontWeight: 600,
                fontSize: 11,
                padding: "6px 12px",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
        {SIZES.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            style={{
              border: `1px solid ${size === s ? COLORS.moss : "rgba(58,44,51,0.18)"}`,
              background: size === s ? COLORS.moss : "transparent",
              color: size === s ? "#fff" : COLORS.ink,
              fontWeight: 600,
              fontSize: 12,
              padding: "7px 0",
              width: 38,
              borderRadius: 2,
              cursor: "pointer",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={handleAdd}
        style={{
          marginTop: 12,
          width: "100%",
          background: added ? COLORS.moss : COLORS.citrus,
          color: added ? "#fff" : COLORS.ink,
          border: "none",
          padding: "11px 12px",
          borderRadius: 2,
          fontWeight: 700,
          fontSize: 13,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          cursor: "pointer",
        }}
      >
        {added ? "Ajouté ✓" : "Ajouter au panier"}
      </button>
    </div>
  );
}

// ====== Galerie photo (ouverte au clic sur un produit avec plusieurs photos) ======
function ProductGallery({ product, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(58,44,51,0.85)",
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: COLORS.paper,
          borderRadius: 2,
          maxWidth: 560,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20 }}>{product.title}</div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", fontSize: 22, cursor: "pointer", color: COLORS.ink, lineHeight: 1 }}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        <div style={{ width: "100%", aspectRatio: "1 / 1", background: "#fff", borderRadius: 2, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img
            src={product.images[activeIndex]}
            alt={`${product.title} ${activeIndex + 1}`}
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", paddingBottom: 4 }}>
          {product.images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActiveIndex(i)}
              style={{
                flex: "0 0 auto",
                width: 56,
                height: 56,
                padding: 0,
                borderRadius: 2,
                overflow: "hidden",
                border: i === activeIndex ? `2px solid ${COLORS.moss}` : "1px solid rgba(58,44,51,0.15)",
                cursor: "pointer",
                background: "#fff",
              }}
            >
              <img src={src} alt="" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Panier({ cartEntries, cart, changeQty, removeItem, clearCart, subtotal, shipping, grandTotal, totalWeightGrams, openWhatsapp, setView }) {
  const paypalRef = useRef(null);
  const paypalRendered = useRef(false);

  useEffect(() => {
    if (cartEntries.length === 0) return;
    const existing = document.getElementById("paypal-sdk-script");
    function render() {
      if (paypalRendered.current || !window.paypal || !paypalRef.current) return;
      paypalRendered.current = true;
      paypalRef.current.innerHTML = "";
      window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
          createOrder: (data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { value: Math.max(grandTotal, 1).toFixed(2), currency_code: "EUR" } }],
            }),
          onApprove: (data, actions) =>
            actions.order.capture().then((details) => {
              alert("Paiement PayPal réussi, merci " + details.payer.name.given_name + " !");
              clearCart();
            }),
        })
        .render(paypalRef.current);
    }
    if (existing) {
      render();
    } else {
      const script = document.createElement("script");
      script.id = "paypal-sdk-script";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR`;
      script.onload = render;
      document.body.appendChild(script);
    }
    return () => {
      paypalRendered.current = false;
    };
  }, [cartEntries.length, grandTotal]);

  const revolutHref = cartEntries.length
    ? `https://revolut.me/${REVOLUT_USERNAME}/${grandTotal.toFixed(2)}`
    : "#";

  if (cartEntries.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px" }}>
        <div style={{ background: COLORS.card, borderRadius: 2, padding: "40px 24px", textAlign: "center", color: COLORS.chalk, border: "1px dashed rgba(58,44,51,0.2)" }}>
          Votre panier est vide.
          <br />
          <button
            onClick={() => setView("catalogue")}
            style={{ display: "inline-block", marginTop: 14, background: COLORS.moss, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 2, fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            Voir le catalogue
          </button>
        </div>
      </div>
    );
  }

  const weightKg = totalWeightGrams / 1000;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {Object.entries(cart).map(([key, item]) => (
          <div key={key} style={{ background: COLORS.card, borderRadius: 2, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", border: "1px solid rgba(58,44,51,0.06)" }}>
            <div style={{ minWidth: 200 }}>
              <div style={{ fontFamily: DISPLAY_FONT, fontSize: 20, letterSpacing: "0.03em", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: COLORS.moss, fontWeight: 600 }}>
                {item.color ? `${item.color} · ` : ""}Taille {item.size} · {formatEUR(item.price)} € / unité
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", background: COLORS.paper, borderRadius: 2, border: "1px solid rgba(58,44,51,0.12)" }}>
                <button onClick={() => changeQty(key, -1)} style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>−</button>
                <span style={{ minWidth: 32, textAlign: "center", fontWeight: 700, fontSize: 14 }}>{item.qty}</span>
                <button onClick={() => changeQty(key, 1)} style={{ width: 36, height: 36, border: "none", background: "transparent", fontSize: 16, fontWeight: 700, cursor: "pointer" }}>+</button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, minWidth: 70, textAlign: "right" }}>{formatEUR(item.price * item.qty)} €</div>
              <button onClick={() => removeItem(key)} style={{ background: "none", border: "none", color: "#B0392B", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 24, background: COLORS.ink, borderRadius: 2, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: COLORS.paper, fontSize: 13, opacity: 0.75 }}>Sous-total</span>
          <span style={{ color: COLORS.paper, fontWeight: 700, fontSize: 14 }}>{formatEUR(subtotal)} €</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: COLORS.paper, fontSize: 13, opacity: 0.75 }}>Livraison ({weightKg.toFixed(2).replace(".", ",")} kg)</span>
          <span style={{ color: COLORS.paper, fontWeight: 700, fontSize: 14 }}>{formatEUR(shipping)} €</span>
        </div>
        <div style={{ borderTop: "1px solid rgba(252,243,242,0.18)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: COLORS.paper, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.7 }}>Total</span>
          <span style={{ fontFamily: DISPLAY_FONT, color: COLORS.citrus, fontSize: 32, fontWeight: 700 }}>{formatEUR(grandTotal)} €</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <button onClick={clearCart} style={{ border: "1px solid rgba(58,44,51,0.2)", background: "transparent", color: COLORS.ink, borderRadius: 2, padding: "13px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          Vider
        </button>
        <button onClick={openWhatsapp} style={{ flex: 1, minWidth: 220, background: COLORS.moss, color: "#fff", border: "none", borderRadius: 2, padding: "13px 22px", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Envoyer sur WhatsApp
        </button>
      </div>

      <div style={{ marginTop: 28 }}>
        <h3 style={{ fontFamily: DISPLAY_FONT, fontSize: 18, margin: "0 0 4px", color: COLORS.mossDark }}>Payer en ligne</h3>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: COLORS.chalk, lineHeight: 1.5 }}>
          Paiement sécurisé via PayPal ou Revolut.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
          <div style={{ background: COLORS.card, border: "1px solid rgba(58,44,51,0.08)", borderRadius: 2, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 10 }}>💳 PayPal</div>
            <div ref={paypalRef} style={{ minHeight: 45 }} />
          </div>
          <div style={{ background: COLORS.card, border: "1px solid rgba(58,44,51,0.08)", borderRadius: 2, padding: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", marginBottom: 10 }}>🔵 Revolut (particulier à particulier)</div>
            <a
              href={revolutHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: "#0666EB", color: "#fff", border: "none", padding: 12, borderRadius: 2, fontWeight: 700, fontSize: 14, textDecoration: "none", boxSizing: "border-box" }}
            >
              Payer avec Revolut
            </a>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, color: COLORS.chalk }}>
        Le message WhatsApp indique : produit + taille + quantité + total avec livraison.
      </div>
    </div>
  );
}

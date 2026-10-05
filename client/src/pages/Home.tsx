/**
 * Evergreen Nook / interactive Soft Apothecary storefront.
 * Adds client-side cart interactions, Canvas-based depth ink, product guides, and the typed Nook Beauty AI advisor.
 */
import { motion } from "framer-motion";
import {
  ArrowDownRight,
  ArrowUpRight,
  Bot,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Clock3,
  Droplets,
  ExternalLink,
  Instagram,
  Leaf,
  LoaderCircle,
  Menu,
  MessageCircle,
  Minus,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  Star,
  X,
  Youtube,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AIChatBox, type Message as ChatMessage } from "@/components/AIChatBox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const assets = {
  logo: "/assets/evergreen-nook-logo_817deea5.png",
  hero: "/assets/evergreen-nook-hero-ink_504baca5.png",
  veil: "/assets/evergreen-nook-botanical-veil_0d7a7af5.png",
  ritual: "/assets/evergreen-nook-ritual-still-life_9593aad0.png",
  hairOil: "/assets/evergreen-nook-hair-oil_9cf6c4da.jpg",
  facePack: "/assets/evergreen-nook-nalungu-maavu_8740a18c.jpg",
  instagramQr: "/assets/evergreen-nook-instagram-qr_d425d53a.png",
  youtubeQr: "/assets/evergreen-nook-youtube-qr_758c4102.jpg",
};

const socialUrls = {
  instagram: "https://www.instagram.com/evergreen.nook/",
  youtube: "https://www.youtube.com/@evergreen.nook",
  whatsapp: "https://wa.me/919500232420",
  phone: "tel:+919500232420",
};

const products = [
  {
    id: "hair-oil",
    number: "01",
    eyebrow: "Night ritual",
    name: "Evergreen Nook Natural Hair Oil",
    tagline: "The Ultimate Hair Glow-Up",
    originalPrice: 299,
    price: 249,
    description:
      "Infused with raw botanical extracts and Ayurvedic herbs, this light-weight oil revitalizes scalp health, seals in moisture, and boosts natural shine without grease.",
    image: assets.hairOil,
    alt: "Evergreen Nook natural hair oil with botanical flowers",
    usage: ["Part hair into soft sections and dispense a few drops onto the scalp.", "Massage with relaxed circular motions for two to three minutes.", "Leave overnight, then wash as usual for a slower, shinier hair ritual."],
  },
  {
    id: "face-pack",
    number: "02",
    eyebrow: "Golden reset",
    name: "Herbal Face Pack — Nalungu Maavu",
    tagline: "Your Natural Skin Reset",
    originalPrice: 169,
    price: 140,
    description:
      "Traditional herbal bathing & face pack crafted with wild turmeric, neem, and rose petals. Exfoliates dead skin, evens tone, and gives a radiant natural golden glow.",
    image: assets.facePack,
    alt: "Evergreen Nook Nalungu Maavu herbal face pack with natural ingredients",
    usage: ["Mix a spoonful with rose water or milk until it becomes a smooth paste.", "Apply an even layer, avoiding the eye area, and take ten quiet minutes for yourself.", "Rinse gently with cool water and follow with your preferred moisturiser."],
  },
] as const;

type Product = (typeof products)[number];
type CartState = Record<string, number>;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function InkWash({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`ink-wash ${className}`} viewBox="0 0 520 380" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M94 85C153 21 241 13 304 46c62 32 131 23 160 92 32 76-42 122-92 174-62 65-87 75-163 42-77-33-160-40-178-109C15 178 51 132 94 85Z" fill="currentColor" opacity=".52" />
      <path d="M126 75c54-46 129-47 178-8 45 37 115 49 125 107 10 56-56 71-105 119-48 48-93 70-152 38-64-35-122-38-133-92-12-57 47-120 87-164Z" stroke="#B28946" strokeWidth="1.4" opacity=".72" />
      <circle cx="431" cy="93" r="9" fill="#B28946" opacity=".55" />
      <circle cx="455" cy="117" r="4" fill="#305B48" opacity=".48" />
    </svg>
  );
}

function RitualThread({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`ritual-thread ${className}`} viewBox="0 0 620 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M-13 128C73 99 90 59 150 72c67 15 63 80 134 63 83-20 48-107 147-108 84-1 86 73 197 42" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="151" cy="72" r="4.2" fill="currentColor" />
      <circle cx="431" cy="27" r="3" fill="currentColor" />
    </svg>
  );
}

function InkParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    const context = canvas?.getContext("2d");
    if (!canvas || !parent || !context) return;

    let animationFrame = 0;
    let width = 1;
    let height = 1;
    let particles: Array<{ x: number; y: number; targetX: number; targetY: number; size: number; depth: number; phase: number; gold: boolean }> = [];
    const pointer = { x: 0, y: 0, active: false };
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const createParticle = (index: number) => {
      const seed = Math.random();
      const isHead = seed < 0.16;
      const isTorso = seed >= 0.16 && seed < 0.78;
      const targetX = (isHead ? 0.72 + (Math.random() - 0.5) * 0.12 : isTorso ? 0.71 + (Math.random() - 0.5) * 0.23 : 0.61 + Math.random() * 0.26) * width;
      const targetY = (isHead ? 0.23 + (Math.random() - 0.5) * 0.14 : isTorso ? 0.53 + (Math.random() - 0.5) * 0.34 : 0.72 + Math.random() * 0.14) * height;
      return {
        x: targetX + (Math.random() - 0.5) * width * 0.2,
        y: targetY + (Math.random() - 0.5) * height * 0.17,
        targetX,
        targetY,
        size: 1.1 + Math.random() * 4.8,
        depth: 0.32 + Math.random() * 0.95,
        phase: index * 0.23 + Math.random() * 6,
        gold: index % 7 === 0,
      };
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      particles = Array.from({ length: Math.max(96, Math.min(190, Math.floor(width / 7))) }, (_, index) => createParticle(index));
      pointer.x = width * 0.72;
      pointer.y = height * 0.44;
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const draw = (time: number) => {
      context.clearRect(0, 0, width, height);
      const timeScale = time * 0.00055;
      particles.forEach((particle) => {
        const waveX = Math.cos(timeScale + particle.phase) * 11 * particle.depth;
        const waveY = Math.sin(timeScale * 1.3 + particle.phase) * 8 * particle.depth;
        const pointerDx = pointer.x - particle.x;
        const pointerDy = pointer.y - particle.y;
        const pointerDistance = Math.hypot(pointerDx, pointerDy);
        const pull = pointer.active ? Math.max(0, 1 - pointerDistance / 230) * 0.028 * particle.depth : 0;
        const desiredX = particle.targetX + waveX + pointerDx * pull;
        const desiredY = particle.targetY + waveY + pointerDy * pull;
        particle.x += (desiredX - particle.x) * 0.026;
        particle.y += (desiredY - particle.y) * 0.026;

        const glow = context.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 5.3);
        const color = particle.gold ? "178,137,70" : "45,91,73";
        glow.addColorStop(0, `rgba(${color}, ${0.42 * particle.depth})`);
        glow.addColorStop(0.35, `rgba(${color}, ${0.16 * particle.depth})`);
        glow.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = glow;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * 5.3, 0, Math.PI * 2);
        context.fill();

        context.fillStyle = particle.gold ? "rgba(178,137,70,.68)" : `rgba(45,91,73,${0.42 + particle.depth * 0.25})`;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.size * particle.depth, 0, Math.PI * 2);
        context.fill();
      });
      if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw(0);
    window.addEventListener("resize", resize);
    parent.addEventListener("pointermove", onPointerMove);
    parent.addEventListener("pointerleave", onPointerLeave);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      parent.removeEventListener("pointermove", onPointerMove);
      parent.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="hero-ink-canvas" />;
}

function BrandLogo() {
  return (
    <button type="button" onClick={() => scrollToSection("top")} className="brand-lockup brand-lockup--official group" aria-label="Evergreen Nook home">
      <img className="brand-emblem" src={assets.logo} alt="Official Evergreen Nook leaf and human figure logo" />
      <span className="brand-wordmark">Evergreen <em>Nook</em></span>
    </button>
  );
}

function ProductModule({ product, reverse, quantity, onAdd, onGuide }: { product: Product; reverse?: boolean; quantity: number; onAdd: () => void; onGuide: () => void }) {
  return (
    <motion.article id={product.id} className={`product-module luxury-product-card ${reverse ? "product-module--reverse" : ""}`} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.62, ease: [0.23, 1, 0.32, 1] }}>
      <div className="product-media">
        <img src={product.image} alt={product.alt} />
        <div className="product-media-sheen" />
        <span className="media-stamp">{product.eyebrow}</span>
        <span className="sale-badge">Offer</span>
        <span className="product-media-note">botanical care · made slowly</span>
        <div className="media-orbit media-orbit--one" />
        <div className="media-orbit media-orbit--two" />
      </div>

      <div className="product-copy luxury-product-copy">
        <div className="product-copy-topline"><span>{product.number}</span><span className="copy-rule" /><span>{product.eyebrow}</span></div>
        <h3>{product.name}</h3>
        <p className="product-tagline">{product.tagline}</p>
        <p className="product-description product-description--ai">{product.description}</p>
        <div className="product-purchase-meta product-purchase-meta--offer">
          <div><del>₹{product.originalPrice}</del><strong>₹{product.price}</strong></div>
          <span><Sparkles size={14} /> Offer price · botanical care</span>
        </div>
        <div className="commerce-actions">
          <button type="button" className="add-cart-button" onClick={onAdd}>
            <ShoppingBag size={17} /> {quantity > 0 ? `Added · ${quantity} in cart` : "Add to cart"}
          </button>
          <button type="button" className="usage-button" onClick={onGuide}>How to use <ChevronRight size={15} /></button>
        </div>
      </div>
    </motion.article>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [email, setEmail] = useState("");
  const [cart, setCart] = useState<CartState>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [guideProduct, setGuideProduct] = useState<Product | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState(false);
  const [advisorPending, setAdvisorPending] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 22);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = useMemo(() => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0), [cart]);
  const cartTotal = useMemo(() => products.reduce((sum, product) => sum + (cart[product.id] ?? 0) * product.price, 0), [cart]);
  const selectedGuide = products.find((product) => product.id === guideProduct?.id) ?? null;

  const navigate = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => scrollToSection(id), 50);
  };

  const addToCart = (product: Product) => {
    setCart((current) => ({ ...current, [product.id]: (current[product.id] ?? 0) + 1 }));
    toast(`${product.name} is in your ritual bag.`);
  };

  const adjustQuantity = (product: Product, delta: number) => {
    setCart((current) => {
      const nextQuantity = Math.max(0, (current[product.id] ?? 0) + delta);
      const next = { ...current, [product.id]: nextQuantity };
      if (nextQuantity === 0) delete next[product.id];
      return next;
    });
  };

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return toast("Add your email to receive the next ritual note.");
    toast("You’re on the list. Gentle things are on their way.");
    setEmail("");
  };

  const sendBeautyMessage = (content: string) => {
    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content }];
    setChatMessages(nextMessages);
    const advisorMessages = nextMessages.filter(
      (message): message is { role: "user" | "assistant"; content: string } => message.role !== "system"
    );
    setAdvisorPending(true);
    window.setTimeout(() => {
      const latest = advisorMessages.at(-1)?.content.toLowerCase() ?? "";
      const answer = latest.includes("nalungu") || latest.includes("face")
        ? "For Nalungu Maavu, begin with 1–2 times weekly. Mix a small spoon with rose water or milk, apply a thin layer for 10 minutes, rinse gently, and moisturise. Patch test first and pause if your skin feels irritated."
        : "For the Hair Oil, use a few drops on the scalp 2–3 nights a week. Massage gently for two minutes, leave overnight if comfortable, then wash as usual. Start lightly and adjust to your scalp’s needs.";
      setChatMessages((current) => [...current, { role: "assistant", content: answer }]);
      setAdvisorPending(false);
    }, 520);
  };

  const beginCheckout = () => {
    if (!cartCount) return;
    setCartOpen(false);
    setCheckoutConfirmed(false);
    setCheckoutOpen(true);
  };

  const confirmCheckout = () => {
    setCheckoutPending(true);
    window.setTimeout(() => {
      setCheckoutPending(false);
      setCheckoutConfirmed(true);
      toast("Order request saved in this demo. Connect your backend before taking live payments.");
    }, 650);
  };

  return (
    <main id="top" className="site-shell">
      <header className={`site-header ${scrolled ? "site-header--scrolled" : ""}`}>
        <div className="nav-shell luxury-nav-glass">
          <BrandLogo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            <button type="button" onClick={() => navigate("rituals")}>Rituals</button>
            <button type="button" onClick={() => navigate("community")}>Community</button>
            <button type="button" onClick={() => navigate("notes")}>Journal</button>
          </nav>
          <div className="nav-actions">
            <button type="button" className="cart-toggle" onClick={() => setCartOpen((current) => !current)} aria-label="Open shopping bag" aria-expanded={cartOpen}>
              <ShoppingBag size={18} /> <span className="cart-label">Ritual bag</span>{cartCount > 0 && <b>{cartCount}</b>}
            </button>
            <button type="button" className="nav-cta desktop-cta" onClick={() => navigate("rituals")}>Explore products <ArrowDownRight size={16} /></button>
          </div>
          <button type="button" className="mobile-menu-toggle" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
        {cartOpen && (
          <div className="cart-popover" aria-live="polite">
            <div className="cart-popover-heading"><span>Ritual bag</span><button type="button" onClick={() => setCartOpen(false)} aria-label="Close bag"><X size={15} /></button></div>
            {cartCount === 0 ? <p>Your bag is waiting for a little ritual.</p> : <><div className="cart-lines">{products.filter((product) => cart[product.id]).map((product) => <div key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>₹{product.price}</small></span><div className="cart-stepper"><button type="button" onClick={() => adjustQuantity(product, -1)} aria-label={`Decrease ${product.name}`}><Minus size={12} /></button><b>{cart[product.id]}</b><button type="button" onClick={() => adjustQuantity(product, 1)} aria-label={`Increase ${product.name}`}><Plus size={12} /></button></div></div>)}</div><div className="cart-total"><span>Total</span><strong>₹{cartTotal}</strong></div><button type="button" className="cart-checkout" onClick={beginCheckout}>Review &amp; notify owner <ArrowUpRight size={15} /></button></>}
          </div>
        )}
        {menuOpen && <div className="mobile-nav"><button type="button" onClick={() => navigate("rituals")}>Rituals</button><button type="button" onClick={() => navigate("community")}>Community</button><button type="button" onClick={() => navigate("notes")}>Journal</button><button type="button" onClick={() => navigate("rituals")} className="mobile-nav-cta">Explore products</button></div>}
      </header>

      <section className="hero-section section-wash" aria-labelledby="hero-title">
        <InkParticleField />
        <InkWash className="hero-ink hero-ink--left" />
        <RitualThread className="ritual-thread--hero" />
        <img className="hero-veil" src={assets.veil} alt="" />
        <div className="hero-inner">
          <motion.div className="hero-copy luxury-hero-glass" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1], delay: 0.08 }}>
            <p className="eyebrow"><span /> Interactive botanical ink</p>
            <h1 id="hero-title">Inspired by Nature.<br />Crafted for <i>You.</i></h1>
            <p className="hero-subline">100% Organic &amp; Handcrafted Wellness.<br /><span>Move your cursor through the ink. Let the ritual unfold.</span></p>
            <div className="hero-actions"><button type="button" className="primary-button" onClick={() => navigate("rituals")}>Explore Products <ArrowDownRight size={18} /></button><button type="button" className="hero-text-button" onClick={() => setChatOpen(true)}><Bot size={17} /><span>Ask Nook Expert AI</span></button></div>
          </motion.div>
          <div className="hero-art" aria-hidden="true"><div className="hero-art-backdrop" /><img src={assets.hero} alt="" /><span className="hero-gold-dot hero-gold-dot--one" /><span className="hero-gold-dot hero-gold-dot--two" /><span className="hero-caption">responsive canvas ink ritual</span></div>
        </div>
        <div className="hero-footer-note"><Sparkles size={15} /> Move through the ink</div>
      </section>

      <section id="our-story" className="manifesto-section section-wash" aria-labelledby="manifesto-title">
        <InkWash className="manifesto-ink" /><RitualThread className="ritual-thread--manifesto" />
        <div className="section-frame manifesto-grid">
          <div className="manifesto-side-note"><span className="side-note-line" /><span>01 — Our ethic</span></div>
          <motion.div className="manifesto-copy" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.4 }} transition={{ duration: 0.58, ease: [0.23, 1, 0.32, 1] }}><p className="eyebrow"><span /> Plant-powered, deeply personal</p><h2 id="manifesto-title">Your glow<br />has <i>roots.</i></h2><p>Evergreen Nook is an invitation to let beauty feel like a pause. We make plant-led rituals for the minute after the day has quietened — less routine, more return.</p></motion.div>
          <div className="values-row" aria-label="Brand values"><div><Droplets size={20} /><span>Earth-kind<br />formulas</span></div><div><Sparkles size={20} /><span>Made for your<br />softest era</span></div><div><Leaf size={20} /><span>Slow, considered<br />care</span></div></div>
        </div>
      </section>

      <section id="rituals" className="rituals-section section-wash" aria-labelledby="rituals-title">
        <img className="rituals-veil" src={assets.veil} alt="" /><InkWash className="rituals-ink" /><RitualThread className="ritual-thread--rituals" />
        <div className="section-frame"><div className="section-heading"><div><p className="eyebrow"><span /> The ritual edit</p><h2 id="rituals-title">Two ways to<br /><i>come back to you.</i></h2></div><p className="heading-aside">A considered product edit with intimate steps, botanical textures, and space to return to yourself.</p></div><div className="product-stack"><ProductModule product={products[0]} quantity={cart[products[0].id] ?? 0} onAdd={() => addToCart(products[0])} onGuide={() => setGuideProduct(products[0])} /><ProductModule product={products[1]} reverse quantity={cart[products[1].id] ?? 0} onAdd={() => addToCart(products[1])} onGuide={() => setGuideProduct(products[1])} /></div></div>
      </section>

      <section className="ingredient-section section-wash" aria-labelledby="ingredient-title">
        <InkWash className="ingredient-ink" /><RitualThread className="ritual-thread--ingredients" />
        <div className="section-frame ingredient-layout"><motion.div className="ingredient-media" initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.58, ease: [0.23, 1, 0.32, 1] }}><img src={assets.ritual} alt="Herbal powder, rose water, neem and flowers in a natural skincare ritual" /><div className="ingredient-note"><span>pure plant wisdom</span><ArrowUpRight size={15} /></div></motion.div><motion.div className="ingredient-copy" initial={{ opacity: 0, x: 18 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.35 }} transition={{ duration: 0.58, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}><p className="eyebrow"><span /> In the blend</p><h2 id="ingredient-title">Only what feels<br /><i>good to keep close.</i></h2><p>Herbal blends with a purpose: sensorial botanicals selected to make the simple act of application feel more considered.</p><div className="ingredient-tags"><span>Neem leaf</span><span>Rose water</span><span>Turmeric</span><span>Cold-pressed oils</span></div><button type="button" className="text-link" onClick={() => setChatOpen(true)}>Ask Nook AI about ingredients <ArrowUpRight size={16} strokeWidth={1.8} /></button></motion.div></div>
      </section>

      <section id="community" className="community-section section-wash" aria-labelledby="community-title">
        <InkWash className="community-ink" /><RitualThread className="ritual-thread--community" />
        <div className="section-frame"><div className="community-heading"><div><p className="eyebrow"><span /> Meet us beyond the ritual</p><h2 id="community-title">Connect With<br /><i>Our Community.</i></h2></div><p>Scan a code, follow the leaf trail, and keep the calm little rituals close wherever you scroll.</p></div><div className="social-gallery"><a href={socialUrls.instagram} target="_blank" rel="noreferrer" className="qr-card qr-card--instagram"><span className="qr-card-top"><Instagram size={19} /> Instagram <ExternalLink size={14} /></span><img src={assets.instagramQr} alt="Instagram QR code for @EVERGREEN.NOOK" /><div><strong>@EVERGREEN.NOOK</strong><small>Follow our small-batch ritual notes</small></div></a><a href={socialUrls.youtube} target="_blank" rel="noreferrer" className="qr-card qr-card--youtube"><span className="qr-card-top"><Youtube size={19} /> YouTube <ExternalLink size={14} /></span><img src={assets.youtubeQr} alt="Official Evergreen Nook YouTube channel QR code" /><div><strong>Evergreen Nook on YouTube</strong><small>Watch the ritual, one mindful moment at a time</small></div></a></div></div>
      </section>

      <section id="notes" className="notes-section section-wash" aria-labelledby="notes-title"><InkWash className="notes-ink" /><RitualThread className="ritual-thread--notes" /><div className="section-frame notes-layout"><div><p className="eyebrow eyebrow--light"><span /> Nook notes</p><h2 id="notes-title">A little beauty<br />note, now and then.</h2></div><div className="notes-form-wrap"><p>Quiet rituals, botanical inspiration, and early peeks at what we are crafting next.</p><form onSubmit={handleSubscribe} className="notes-form"><label className="sr-only" htmlFor="email">Email address</label><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Your email address" /><button type="submit" aria-label="Subscribe to Evergreen Nook notes"><ArrowUpRight size={19} /></button></form><small>By subscribing, you agree to receive Nook notes. Unsubscribe whenever you need.</small></div></div></section>

      <footer className="site-footer"><div className="section-frame footer-top"><div><BrandLogo /><p>Natural beauty, made softer.</p></div><div className="footer-links"><div><span className="footer-label">Explore</span><button type="button" onClick={() => navigate("rituals")}>Rituals</button><button type="button" onClick={() => setChatOpen(true)}>Nook Expert AI</button></div><div><span className="footer-label">Keep close</span><a href={socialUrls.instagram} target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a><a href={socialUrls.youtube} target="_blank" rel="noreferrer"><Youtube size={15} /> YouTube</a></div><div><span className="footer-label">Support</span><a href={socialUrls.phone}>+91 9500232420</a><a href={socialUrls.whatsapp} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp</a></div></div></div><div className="section-frame footer-bottom"><span>© 2026 Evergreen Nook. All rights reserved.</span><span className="credit-line">Made by <a href="mailto:mohammedirsathm@gmail.com">Mohammed Irsath M</a></span></div></footer>

      <Dialog open={Boolean(selectedGuide)} onOpenChange={(open) => !open && setGuideProduct(null)}>
        <DialogContent className="ritual-guide-dialog">
          {selectedGuide && <><DialogHeader><p className="eyebrow"><span /> Step by step</p><DialogTitle>{selectedGuide.name}</DialogTitle><DialogDescription>{selectedGuide.tagline} — a ritual made to feel easy, unhurried, and yours.</DialogDescription></DialogHeader><ol className="guide-list">{selectedGuide.usage.map((step, index) => <li key={step}><span>{index + 1}</span><p>{step}</p></li>)}</ol><div className="guide-note"><Clock3 size={16} /><span>Patch test before first use. Discontinue use if irritation occurs.</span></div></>}
        </DialogContent>
      </Dialog>

      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="nook-ai-dialog" showCloseButton={false}>
          <DialogTitle className="sr-only">Nook Expert AI hair and skincare advisor</DialogTitle>
          <div className="nook-ai-dialog-header"><div><span className="ai-orb"><Bot size={18} /></span><div><p>Nook Expert AI</p><small>Hair &amp; skincare consultant</small></div></div><button type="button" onClick={() => setChatOpen(false)} aria-label="Close Nook Expert AI"><X size={18} /></button></div>
          <div className="expert-ai-text-intro"><span className="expert-ai-kicker"><Sparkles size={13} /> Personal ritual guidance</span><p>Write a little about your hair, scalp, or skin and receive a calm, tailored Evergreen Nook routine.</p></div>
          <AIChatBox messages={chatMessages} onSendMessage={sendBeautyMessage} isLoading={advisorPending} height="390px" placeholder="Describe your hair or skin ritual..." emptyStateMessage="Begin with a few words about your hair, scalp, or skin." suggestedPrompts={["How often should I use Nalungu Maavu?", "What's the best routine for my Hair Oil?"]} className="nook-ai-box" />
          <p className="ai-disclaimer">Nook Expert AI shares general cosmetic-care guidance, not medical advice. For discomfort, irritation, or ongoing concerns, speak with a qualified professional.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="checkout-dialog">
          <DialogHeader><p className="eyebrow"><span /> Concierge checkout</p><DialogTitle>Confirm your ritual order</DialogTitle><DialogDescription>We’ll alert the Evergreen Nook owner directly through the store dashboard when your order request is confirmed.</DialogDescription></DialogHeader>
          <div className="checkout-summary">{products.filter((product) => cart[product.id]).map((product) => <div key={product.id}><img src={product.image} alt="" /><span>{product.name}<small>{cart[product.id]} × ₹{product.price}</small></span><strong>₹{product.price * (cart[product.id] ?? 0)}</strong></div>)}<div className="checkout-grand-total"><span>Total</span><strong>₹{cartTotal}</strong></div></div>
          {!checkoutConfirmed ? <button type="button" className="checkout-confirm-button" onClick={confirmCheckout} disabled={checkoutPending}>{checkoutPending ? <><LoaderCircle className="animate-spin" size={16} /> Preparing order…</> : <><ReceiptText size={16} /> Confirm &amp; alert owner</>}</button> : <div className="checkout-success"><CircleCheck size={19} /><span><b>Demo order prepared.</b> Connect a backend to send this request to your dashboard.</span></div>}
        </DialogContent>
      </Dialog>

      <button type="button" className="nook-ai-fab" onClick={() => setChatOpen(true)} aria-label="Open Nook Expert AI hair and skincare advisor"><span className="nook-ai-fab-icon"><Bot size={20} /></span><span><b>Nook Expert</b><small>Text Hair &amp; Skincare Advisor</small></span><Sparkles className="nook-ai-spark" size={14} /></button>
    </main>
  );
}

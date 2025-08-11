"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

/* ---------- UI Primitives ---------- */
const Container = ({ className = "", children }: any) => (
  <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
);
const Card = ({ className = "", children }: any) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ title, subtitle, right, className = "" }: any) => (
  <div className={`flex items-start justify-between gap-4 p-5 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
    {right}
  </div>
);
const CardBody = ({ className = "", children }: any) => <div className={`p-5 ${className}`}>{children}</div>;
const Button = ({ children, className = "", variant = "primary", ...props }: any) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50";
  const variants: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900/20",
    secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-300",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700 focus:ring-slate-300",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-600/20",
    outline: "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-300",
    success: "bg-emerald-600 text-white hover:bg-emerald-500 focus:ring-emerald-600/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className = "", ...props }: any) => (
  <input
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Select = ({ className = "", children, ...props }: any) => (
  <select
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  >
    {children}
  </select>
);
const Textarea = ({ className = "", ...props }: any) => (
  <textarea
    className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 ${className}`}
    {...props}
  />
);
const Badge = ({ children, className = "" }: any) => (
  <span
    className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 ${className}`}
  >
    {children}
  </span>
);
const Divider = () => <div className="h-px w-full bg-slate-200" />;
const Modal = ({ open, onClose, title, children, wide = false }: any) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-900/50" onClick={onClose} />
      <div
        className={`relative z-10 max-h-[90vh] overflow-auto rounded-2xl bg-white shadow-2xl ${
          wide ? "w-[1080px]" : "w-[720px]"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-slate-100" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-600">
              <path
                fill="currentColor"
                d="M6.4 4.98 4.98 6.4 10.59 12l-5.6 5.6L6.4 19.98 12 14.41l5.6 5.57 1.41-1.41L13.41 12l5.6-5.6L17.6 4.98 12 10.59z"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

/* ---------- Utils & Store ---------- */
const uid = () => Math.random().toString(36).slice(2);
const currency = (n: any) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(Number(n || 0));

const LS_KEY = "invoice_saas_v7";
const getStore = (): any => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
};
const setStore = (obj: any) => localStorage.setItem(LS_KEY, JSON.stringify(obj));

function useAuth() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const s = getStore();
    if (s.currentUser) setUser(s.currentUser);
  }, []);
  const signup = (email: string, password: string) => {
    const s = getStore();
    if (!s.users) s.users = {};
    if (s.users[email]) throw new Error("Este correo ya está registrado.");
    s.users[email] = { email, password, invoices: [], plan: { name: "free", remaining: 3, max: 3 } };
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const login = (email: string, password: string) => {
    const s = getStore();
    if (!s.users || !s.users[email]) throw new Error("Usuario no encontrado.");
    if (s.users[email].password !== password) throw new Error("Contraseña incorrecta.");
    s.currentUser = { email };
    setStore(s);
    setUser({ email });
  };
  const logout = () => {
    const s = getStore();
    delete s.currentUser;
    setStore(s);
    setUser(null);
  };
  const getUserData = () => {
    const s = getStore();
    return s.users?.[user?.email] || null;
  };
  const setUserData = (updater: any) => {
    const s = getStore();
    if (!user) return;
    const data = s.users?.[user.email];
    s.users[user.email] = typeof updater === "function" ? updater(data) : updater;
    setStore(s);
  };
  return { user, signup, login, logout, getUserData, setUserData };
}

/* ---------- Templates ---------- */
/** Cada template ahora tiene: id, name, vibe, colors, y variant (layout distinto) */
const TEMPLATES = [
  { id: "minimal", name: "Minimal", vibe: "Sobrio", colors: ["#0f172a", "#1f2937", "#334155"], variant: "leftTag" },
  { id: "classic", name: "Clásica", vibe: "Formal", colors: ["#4338ca", "#3730a3", "#312e81"], variant: "topBar" },
  { id: "modern", name: "Moderna", vibe: "Actual", colors: ["#059669", "#047857", "#065f46"], variant: "sidebar" },
  { id: "elegant", name: "Elegante", vibe: "Premium", colors: ["#e11d48", "#be123c", "#9f1239"], variant: "splitHeader" },
  { id: "tech", name: "Tech", vibe: "Start‑up", colors: ["#0891b2", "#0e7490", "#155e75"], variant: "chip" },
  { id: "bold", name: "Bold", vibe: "Destacado", colors: ["#f59e0b", "#d97706", "#b45309"], variant: "bigTotal" },
  { id: "mono", name: "Monocromo", vibe: "Minimal extremo", colors: ["#0a0a0a", "#262626", "#525252"], variant: "monoFrame" },
  { id: "art", name: "Artístico", vibe: "Creativo", colors: ["#c026d3", "#a21caf", "#86198f"], variant: "angled" },
  { id: "paper", name: "Papel", vibe: "Clásico moderno", colors: ["#65a30d", "#4d7c0f", "#3f6212"], variant: "stamp" },
  { id: "blueprint", name: "Blueprint", vibe: "Ingeniería", colors: ["#1d4ed8", "#1e40af", "#1e3a8a"], variant: "gridLines" },
] as const;
type TemplateId = typeof TEMPLATES[number]["id"];
type TemplateVariant = typeof TEMPLATES[number]["variant"];

const DEFAULT_SAMPLE: any = {
  number: "0001",
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
  purchaseOrder: "PO-2025-001",
  paymentMethod: "Transferencia",
  bankIban: "ES12 3456 7890 1234 5678 9012",
  issuer: {
    name: "Tu Empresa S.L.",
    nif: "B12345678",
    address: "Calle Mayor 1, Madrid",
    email: "facturas@empresa.com",
    phone: "+34 600 000 000",
  },
  client: { name: "Cliente Demo", nif: "00000000A", address: "C/ Falsa 123, Barcelona", email: "cliente@demo.com" },
  items: [
    { id: uid(), description: "Servicio profesional", qty: 1, price: 300 },
    { id: uid(), description: "Soporte", qty: 2, price: 50 },
  ],
  notes: "Gracias por su confianza.",
  terms: "Pago a 7 días. Recargo por demora 1%.",
  logo: null,
  color: TEMPLATES[0].colors[0],
  discount: { mode: "percent", value: 0 },
  taxRate: 21,
  templateId: "minimal" as TemplateId,
};

/* ---------- Header ---------- */
function Header({ onGoto, user, onOpenContact }: any) {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-slate-900 text-white grid place-items-center font-bold">F</div>
            <span className="hidden text-sm font-semibold text-slate-900 sm:block">FacturaKit</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onGoto("home")} className="hidden sm:inline-flex">
              Inicio
            </Button>
            <Button variant="ghost" onClick={() => onGoto("templates")} className="hidden sm:inline-flex">
              Plantillas
            </Button>
            <Button variant="ghost" onClick={onOpenContact} className="hidden sm:inline-flex">
              Contacto
            </Button>
            {user ? (
              <Button onClick={() => onGoto("dashboard")}>Panel</Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => onGoto("login")}>
                  Entrar
                </Button>
                <Button onClick={() => onGoto("signup")}>Crear cuenta</Button>
              </>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}

/* ---------- New HOME (estilo landing con secciones) ---------- */
function Home({ onGoto }: any) {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-b from-slate-50 to-white">
        <Container className="py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <Badge>3 facturas gratis</Badge>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Crea facturas profesionales en minutos
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                10 plantillas únicas, editor en vivo, descuentos, impuestos, logo y colores. Exporta a <b>PDF</b> o{" "}
                <b>HTML</b>.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button onClick={() => onGoto("templates")} variant="success">
                  Empezar gratis
                </Button>
                <Button variant="secondary" onClick={() => onGoto("templates")}>
                  Ver plantillas
                </Button>
              </div>
              <div className="mt-6 flex items-center gap-4 text-sm text-slate-600">
                <Stars /> <span>+1.200 usuarios felices</span> <span className="hidden sm:inline">•</span>{" "}
                <span className="hidden sm:inline">Sin tarjeta para empezar</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <TemplateThumb invoice={DEFAULT_SAMPLE} variant="splitHeader" accent="#0f172a" />
            </div>
          </div>
        </Container>
      </section>

      {/* MARCAS */}
      <section>
        <Container className="py-10">
          <p className="text-center text-sm uppercase tracking-wide text-slate-500">Usado por freelancers y pymes</p>
          <div className="mt-4 grid grid-cols-2 place-items-center gap-6 opacity-80 sm:grid-cols-4">
            {["Dribbble", "Figma", "Shopify", "Notion"].map((m) => (
              <div key={m} className="text-slate-400">{m}</div>
            ))}
          </div>
        </Container>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="bg-slate-50">
        <Container className="py-14">
          <h2 className="text-center text-2xl font-bold text-slate-900">¿Cómo funciona?</h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-3">
            <Step n={1} t="Elige una plantilla" d="Clásicas, modernas o artísticas. Previsualiza en vivo." />
            <Step n={2} t="Rellena tus datos" d="Emisor, cliente, conceptos, impuestos y descuentos." />
            <Step n={3} t="Descarga" d="Exporta a PDF o HTML. Guarda en tu panel." />
          </div>
        </Container>
      </section>

      {/* GRID DE PLANTILLAS */}
      <section>
        <Container className="py-14">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Plantillas destacadas</h2>
            <Button variant="ghost" onClick={() => onGoto("templates")}>Ver todas</Button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.slice(0, 6).map((t) => (
              <Card key={t.id}>
                <CardHeader title={t.name} subtitle={t.vibe} right={<Badge>Preview</Badge>} />
                <CardBody>
                  <TemplateThumb
                    invoice={{ ...DEFAULT_SAMPLE, templateId: t.id, color: t.colors[0] }}
                    variant={t.variant}
                    accent={t.colors[0]}
                  />
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => onGoto("templates")}>Usar esta</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* BENEFICIOS */}
      <section className="bg-white">
        <Container className="py-14">
          <div className="grid gap-6 sm:grid-cols-3">
            <Benefit t="Diseños únicos" d="10 layouts distintos, no sólo cambios de color." />
            <Benefit t="Editor en vivo" d="Ve la factura mientras rellenas los datos." />
            <Benefit t="Exportar PDF/HTML" d="Un clic y listo para enviar o imprimir." />
          </div>
        </Container>
      </section>

      {/* TESTIMONIOS */}
      <section className="bg-slate-50">
        <Container className="py-14">
          <h2 className="text-2xl font-bold text-slate-900">Lo que dicen</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            {[
              { n: "Alicia Romero", r: "Me ahorra horas cada mes. Súper fácil." },
              { n: "Javi P.", r: "Las plantillas se ven premium y mis clientes lo notan." },
              { n: "Noa M.", r: "PDF en un click y organizado en el panel." },
            ].map((x) => (
              <Card key={x.n}>
                <CardBody>
                  <div className="mb-2 flex items-center gap-2"><Avatar name={x.n} /><Stars /></div>
                  <p className="text-slate-700">“{x.r}”</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section>
        <Container className="py-16 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Empieza gratis hoy</h2>
          <p className="mt-2 text-slate-600">3 facturas gratis. Sin tarjeta. Cancela cuando quieras.</p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="success" onClick={() => onGoto("templates")}>Crear mi factura</Button>
            <Button variant="secondary" onClick={() => onGoto("templates")}>Ver plantillas</Button>
          </div>
        </Container>
      </section>
    </>
  );
}
const Step = ({ n, t, d }: any) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5">
    <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">{n}</div>
    <div className="text-sm font-semibold text-slate-900">{t}</div>
    <div className="text-sm text-slate-600">{d}</div>
  </div>
);
const Benefit = ({ t, d }: any) => (
  <div className="rounded-2xl border border-slate-200 p-5">
    <div className="text-sm font-semibold text-slate-900">{t}</div>
    <div className="text-sm text-slate-600">{d}</div>
  </div>
);
const Stars = () => (
  <div className="flex items-center gap-0.5 text-amber-500">
    {Array.from({ length: 5 }).map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" className="h-4 w-4 fill-current"><path d="m10 15.27 5.18 3.04-1.64-5.81 4.46-3.86-5.86-.5L10 2 7.86 8.14l-5.86.5 4.46 3.86-1.64 5.81L10 15.27z"/></svg>
    ))}
  </div>
);
const Avatar = ({ name = "" }: any) => {
  const initials = name.split(" ").filter(Boolean).map((p: string) => p[0].toUpperCase()).slice(0, 2).join("");
  return <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-sm font-semibold text-slate-700 shadow-inner">{initials || "?"}</div>;
};

/* ---------- Templates List + REAL previews ---------- */
function Templates({ onPick, onPreviewTemplate }: any) {
  return (
    <Container className="py-12">
      <h2 className="text-2xl font-bold text-slate-900">Elige una plantilla</h2>
      <p className="mt-2 text-slate-600">Clásicas, modernas y artísticas. Cada una con layout distinto.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <Card key={t.id}>
            <CardHeader title={`${t.name}`} subtitle={t.vibe} right={<Badge>Demo</Badge>} />
            <CardBody>
              <TemplateThumb
                invoice={{ ...DEFAULT_SAMPLE, templateId: t.id, color: t.colors[0] }}
                variant={t.variant}
                accent={t.colors[0]}
              />
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex gap-1">
                  {t.colors.map((c) => (
                    <span key={c} className="h-4 w-4 rounded-full ring-1 ring-slate-200" style={{ background: c }} />
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => onPreviewTemplate(t)}>
                    Ver ejemplo
                  </Button>
                  <Button onClick={() => onPick(t)}>Usar</Button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </Container>
  );
}

/* ---------- Builder (igual, sólo usa InvoiceDoc/variant) ---------- */
function Builder({ template, initial, onBack, onProceed, auth }: any) {
  const [inv, setInv] = useState<any>(() => ({
    ...(initial || DEFAULT_SAMPLE),
    templateId: template?.id || DEFAULT_SAMPLE.templateId,
    color: template?.colors?.[0] || DEFAULT_SAMPLE.color,
  }));
  const change = (patch: any) => setInv((x: any) => ({ ...x, ...patch }));
  const updateIssuer = (k: string, v: any) => change({ issuer: { ...inv.issuer, [k]: v } });
  const updateClient = (k: string, v: any) => change({ client: { ...inv.client, [k]: v } });
  const updateItem = (id: string, patch: any) =>
    change({ items: inv.items.map((it: any) => (it.id === id ? { ...it, ...patch } : it)) });
  const addItem = () => change({ items: [...inv.items, { id: uid(), description: "Nuevo concepto", qty: 1, price: 0 }] });
  const removeItem = (id: string) => change({ items: inv.items.filter((it: any) => it.id !== id) });
  const onLogo = (e: any) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => change({ logo: reader.result });
    reader.readAsDataURL(f);
  };
  const totals = useMemo(() => calcTotals(inv.items, inv.discount, inv.taxRate), [inv.items, inv.discount, inv.taxRate]);

  return (
    <Container className="py-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={onBack}>
          Volver
        </Button>
        <Badge>Plantilla: {template?.name}</Badge>
        {/* selector de plantilla en caliente */}
        <Select
          className="w-auto"
          value={inv.templateId}
          onChange={(e: any) => {
            const t = TEMPLATES.find((x) => x.id === e.target.value)!;
            change({ templateId: t.id, color: t.colors[0] });
          }}
        >
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader title="Datos de la factura" subtitle="Completa todos los campos necesarios" />
          <CardBody className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Nº factura</label>
                <Input value={inv.number} onChange={(e) => change({ number: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Fecha</label>
                <Input type="date" value={inv.date} onChange={(e) => change({ date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Vencimiento</label>
                <Input type="date" value={inv.dueDate} onChange={(e) => change({ dueDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Pedido/PO</label>
                <Input value={inv.purchaseOrder} onChange={(e) => change({ purchaseOrder: e.target.value })} />
              </div>
            </div>

            <Card className="border-slate-200">
              <CardHeader title="Emisor" />
              <CardBody className="grid grid-cols-2 gap-3">
                <Input placeholder="Nombre" value={inv.issuer.name} onChange={(e) => updateIssuer("name", e.target.value)} />
                <Input placeholder="NIF/CIF" value={inv.issuer.nif} onChange={(e) => updateIssuer("nif", e.target.value)} />
                <Input placeholder="Dirección" value={inv.issuer.address} onChange={(e) => updateIssuer("address", e.target.value)} />
                <Input placeholder="Email" value={inv.issuer.email} onChange={(e) => updateIssuer("email", e.target.value)} />
                <Input placeholder="Teléfono" value={inv.issuer.phone} onChange={(e) => updateIssuer("phone", e.target.value)} />
                <div>
                  <label className="text-xs font-medium text-slate-600">Logo</label>
                  <Input type="file" accept="image/*" onChange={onLogo} />
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Cliente" />
              <CardBody className="grid grid-cols-2 gap-3">
                <Input placeholder="Nombre" value={inv.client.name} onChange={(e) => updateClient("name", e.target.value)} />
                <Input placeholder="NIF" value={inv.client.nif} onChange={(e) => updateClient("nif", e.target.value)} />
                <Input placeholder="Dirección" value={inv.client.address} onChange={(e) => updateClient("address", e.target.value)} />
                <Input placeholder="Email" value={inv.client.email} onChange={(e) => updateClient("email", e.target.value)} />
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Conceptos" right={<Button variant="secondary" onClick={() => change({ items: [...inv.items, { id: uid(), description: "Nuevo concepto", qty: 1, price: 0 }] })}>Añadir</Button>} />
              <CardBody className="space-y-3">
                {inv.items.map((it: any) => (
                  <div key={it.id} className="grid grid-cols-12 items-center gap-2">
                    <Input className="col-span-6" value={it.description} onChange={(e) => updateItem(it.id, { description: e.target.value })} />
                    <Input className="col-span-2" type="number" min="0" step="1" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} />
                    <Input className="col-span-3" type="number" min="0" step="0.01" value={it.price} onChange={(e) => updateItem(it.id, { price: Number(e.target.value) })} />
                    <button className="col-span-1 rounded-lg p-2 text-rose-600 hover:bg-rose-50" onClick={() => change({ items: inv.items.filter((x: any) => x.id !== it.id) })} aria-label="Eliminar">×</button>
                  </div>
                ))}
              </CardBody>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Impuestos (%)</label>
                <Input type="number" min="0" step="0.1" value={inv.taxRate} onChange={(e) => change({ taxRate: Number(e.target.value) })} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Select value={inv.discount.mode} onChange={(e) => change({ discount: { ...inv.discount, mode: e.target.value } })}>
                  <option value="percent">Descuento %</option>
                  <option value="amount">Descuento €</option>
                </Select>
                <Input type="number" min="0" step="0.01" value={inv.discount.value} onChange={(e) => change({ discount: { ...inv.discount, value: Number(e.target.value) } })} />
              </div>
            </div>

            {/* Paletas extendidas (según plantilla) */}
            <div>
              <label className="text-xs font-medium text-slate-600">Color de acento</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {extendPalette(template?.colors || []).map((c) => (
                  <button
                    key={c}
                    className={`h-8 w-8 rounded-full ring-2 ${inv.color === c ? "ring-slate-900" : "ring-transparent"}`}
                    style={{ background: c }}
                    onClick={() => change({ color: c })}
                    type="button"
                    title={c}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={onBack}>
                Atrás
              </Button>
              <Button onClick={() => onProceed(inv)}>Descargar factura</Button>
            </div>
          </CardBody>
        </Card>

        {/* Preview */}
        <div className="space-y-3">
          <Card>
            <CardHeader title="Previsualización" subtitle="Actualiza en tiempo real" />
            <CardBody>
              <InvoiceDoc invoice={inv} accentColor={inv.color} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Totales" />
            <CardBody>
              <TotalsView totals={totals} />
            </CardBody>
          </Card>
        </div>
      </div>
    </Container>
  );
}

/* ---------- Totals ---------- */
const calcTotals = (items: any[], discount: any = { mode: "percent", value: 0 }, taxRate = 21) => {
  const subtotal = items.reduce((s, it) => s + Number(it.qty || 0) * Number(it.price || 0), 0);
  const discountValue = discount.mode === "percent" ? (subtotal * (discount.value || 0)) / 100 : (discount.value || 0);
  const base = Math.max(0, subtotal - discountValue);
  const taxes = (base * Number(taxRate || 0)) / 100;
  return { subtotal, discount: discountValue, base, taxes, total: base + taxes };
};
const TotalsView = ({ totals }: any) => (
  <div className="space-y-1 text-sm">
    <div className="flex justify-between">
      <span className="text-slate-600">Subtotal</span>
      <span className="font-medium">{currency(totals.subtotal)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">Descuento</span>
      <span className="font-medium">-{currency(totals.discount)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">Base imponible</span>
      <span className="font-medium">{currency(totals.base)}</span>
    </div>
    <div className="flex justify-between">
      <span className="text-slate-600">IVA</span>
      <span className="font-medium">{currency(totals.taxes)}</span>
    </div>
    <Divider />
    <div className="flex justify-between text-base font-semibold">
      <span>Total</span>
      <span>{currency(totals.total)}</span>
    </div>
  </div>
);

/* ---------- TemplateThumb (miniatura real) ---------- */
function TemplateThumb({
  invoice,
  variant,
  accent,
}: {
  invoice: any;
  variant: TemplateVariant;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="scale-[0.62] origin-top-left">
        {renderInvoiceLayout(invoice, accent, variant, true /* compact mode */)}
      </div>
    </div>
  );
}

/* ---------- InvoiceDoc con 10 layouts distintos ---------- */
function InvoiceDoc({ invoice }: any) {
  const t = TEMPLATES.find((x) => x.id === (invoice.templateId as TemplateId))!;
  const accent = invoice.color || t.colors[0];
  return renderInvoiceLayout(invoice, accent, t.variant, false);
}

/** Renderizador de layouts. `compact` = miniatura para cards */
function renderInvoiceLayout(invoice: any, accent: string, variant: TemplateVariant, compact = false) {
  const items = invoice.items || [];
  const totals = calcTotals(items, invoice.discount, invoice.taxRate);
  const baseCls = "rounded-2xl border border-slate-200 p-6";
  const heading = (
    <>
      <h2 className="text-xl font-bold text-slate-900">#{invoice.number}</h2>
      <p className="text-sm text-slate-600">
        Fecha: {invoice.date} · Vencimiento: {invoice.dueDate}
      </p>
      {invoice.purchaseOrder && <p className="text-xs text-slate-500">PO: {invoice.purchaseOrder}</p>}
    </>
  );
  const issuer = (
    <div className="text-right">
      {invoice.logo && <img src={invoice.logo as string} alt="logo" className="ml-auto mb-2 h-10 object-contain" />}
      <h3 className="text-sm font-semibold text-slate-900">{invoice.issuer?.name}</h3>
      <p className="text-xs text-slate-600">{invoice.issuer?.nif}</p>
      <p className="text-xs text-slate-600">{invoice.issuer?.address}</p>
      <p className="text-xs text-slate-600">
        {invoice.issuer?.email} · {invoice.issuer?.phone}
      </p>
    </div>
  );
  const table = (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-slate-600">
            <th className="w-2/3">Descripción</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it: any) => (
            <tr key={it.id}>
              <td>{it.description}</td>
              <td>{it.qty}</td>
              <td>{currency(it.price)}</td>
              <td>{currency(Number(it.qty) * Number(it.price))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const totalsBox = (
    <div className="mt-6 ml-auto w-full max-w-xs text-sm">
      <div className="flex justify-between">
        <span className="text-slate-600">Subtotal</span>
        <span className="font-medium">{currency(totals.subtotal)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Descuento</span>
        <span className="font-medium">-{currency(totals.discount)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Base</span>
        <span className="font-medium">{currency(totals.base)}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">IVA ({invoice.taxRate}%)</span>
        <span className="font-medium">{currency(totals.taxes)}</span>
      </div>
      <Divider />
      <div className="flex justify-between text-base font-semibold">
        <span>Total</span>
        <span style={{ color: accent }}>{currency(totals.total)}</span>
      </div>
    </div>
  );
  const billedTo = (
    <div className="grid gap-2 text-sm md:grid-cols-2">
      <div>
        <p className="font-semibold text-slate-900">Facturar a</p>
        <p className="text-slate-700">{invoice.client?.name}</p>
        <p className="text-slate-500">{invoice.client?.nif}</p>
        <p className="text-slate-500">{invoice.client?.address}</p>
        <p className="text-slate-500">{invoice.client?.email}</p>
      </div>
      <div>
        <p className="font-semibold text-slate-900">Pago</p>
        <p className="text-slate-700">{invoice.paymentMethod}</p>
        <p className="text-slate-500">{invoice.bankIban}</p>
      </div>
    </div>
  );

  // --- 10 variantes reales ---
  switch (variant) {
    case "leftTag":
      return (
        <div className={baseCls}>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-block rounded-full px-2 py-0.5 text-xs text-white" style={{ background: accent }}>
                Factura
              </div>
              {heading}
            </div>
            {issuer}
          </div>
          <div className="mt-6">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "topBar":
      return (
        <div className={baseCls}>
          <div className="h-2 w-full rounded-full" style={{ background: accent }} />
          <div className="mt-4 flex items-start justify-between gap-6">
            {heading}
            {issuer}
          </div>
          <div className="mt-4">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "sidebar":
      return (
        <div className="rounded-2xl border border-slate-200">
          <div className="grid grid-cols-8">
            <div className="col-span-2 rounded-l-2xl p-6 text-white" style={{ background: accent }}>
              <div className="text-xs opacity-80">FACTURA</div>
              <div className="mt-2 text-lg font-bold">#{invoice.number}</div>
              <div className="mt-4 text-xs opacity-90">
                <div>{invoice.date}</div>
                <div>Vence: {invoice.dueDate}</div>
              </div>
            </div>
            <div className="col-span-6 p-6">
              <div className="flex items-start justify-between gap-6">{issuer}</div>
              <div className="mt-4">{billedTo}</div>
              {table}
              {totalsBox}
            </div>
          </div>
        </div>
      );

    case "splitHeader":
      return (
        <div className={baseCls}>
          <div className="grid gap-6 md:grid-cols-2">
            <div>{heading}</div>
            <div className="md:text-right">
              <div className="inline-flex items-center rounded-full px-3 py-1 text-xs text-white" style={{ background: accent }}>
                Factura · {invoice.number}
              </div>
              <div className="mt-3">{issuer}</div>
            </div>
          </div>
          <div className="mt-6">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "chip":
      return (
        <div className={baseCls}>
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg px-2 py-1 text-xs text-white" style={{ background: accent }}>
                FACTURA
              </span>
              <span className="text-sm text-slate-600">#{invoice.number}</span>
            </div>
            {issuer}
          </div>
          <div className="mt-6">{heading}</div>
          <div className="mt-4">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "bigTotal":
      return (
        <div className={baseCls}>
          <div className="flex items-start justify-between gap-6">
            {heading}
            <div className="text-right">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-3xl font-extrabold" style={{ color: accent }}>
                {currency(totals.total)}
              </div>
            </div>
          </div>
          <div className="mt-4">{issuer}</div>
          <div className="mt-4">{billedTo}</div>
          {table}
        </div>
      );

    case "monoFrame":
      return (
        <div className="rounded-2xl border-2 border-slate-900 p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-xs font-bold tracking-wider">FACTURA</div>
              {heading}
            </div>
            {issuer}
          </div>
          <div className="mt-6">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "angled":
      return (
        <div className={baseCls}>
          <div className="relative overflow-hidden rounded-xl border border-slate-200 p-4">
            <div className="absolute -right-6 -top-6 h-24 w-24 rotate-45" style={{ background: accent }} />
            <div className="relative flex items-start justify-between gap-6">
              {heading}
              {issuer}
            </div>
          </div>
          <div className="mt-6">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "stamp":
      return (
        <div className={baseCls}>
          <div className="flex items-center justify-between">
            {heading}
            <div
              className="rounded-full border-2 px-3 py-1 text-xs font-semibold"
              style={{ borderColor: accent, color: accent }}
            >
              PAGAR
            </div>
          </div>
          <div className="mt-4">{issuer}</div>
          <div className="mt-4">{billedTo}</div>
          {table}
          {totalsBox}
        </div>
      );

    case "gridLines":
      return (
        <div className="rounded-2xl border border-slate-200 p-6">
          <div
            className="rounded-xl border p-4"
            style={{
              backgroundImage:
                "linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg,#e2e8f0 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <div className="text-xs font-semibold" style={{ color: accent }}>
                  FACTURA
                </div>
                {heading}
              </div>
              {issuer}
            </div>
            <div className="mt-6">{billedTo}</div>
            {table}
            {totalsBox}
          </div>
        </div>
      );
  }
}

/* ---------- Helpers ---------- */
function extendPalette(base: string[]) {
  // Genera variaciones claras/oscura simples
  const lighten = (hex: string, amt = 0.12) => {
    const n = (h: string) => Math.max(0, Math.min(255, Math.round(parseInt(h, 16) * (1 + amt))));
    const r = n(hex.slice(1, 3)).toString(16).padStart(2, "0");
    const g = n(hex.slice(3, 5)).toString(16).padStart(2, "0");
    const b = n(hex.slice(5, 7)).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  };
  const darken = (hex: string, amt = 0.12) => {
    const n = (h: string) => Math.max(0, Math.min(255, Math.round(parseInt(h, 16) * (1 - amt))));
    const r = n(hex.slice(1, 3)).toString(16).padStart(2, "0");
    const g = n(hex.slice(3, 5)).toString(16).padStart(2, "0");
    const b = n(hex.slice(5, 7)).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  };
  const more = base.flatMap((c) => [lighten(c, 0.18), c, darken(c, 0.18)]);
  // quitar duplicados
  return Array.from(new Set(more));
}

/* ---------- (Resto de tu app: Auth, Dashboard, Preview/Download) ---------- */
/* -- Recorto por espacio: te he dejado las secciones esenciales que cambian.
   Si pegaste antes mi versión V7.2-fixed, el resto del archivo (AuthGateModal,
   Dashboard, Account, Preview, exportPDF/HTML, Footer, etc.) lo puedes mantener igual.
   Sólo asegúrate de reemplazar:
   - Home
   - TEMPLATES
   - Templates (grid)
   - TemplateThumb
   - InvoiceDoc + renderInvoiceLayout
   - Builder (selector en caliente + paletas extendidas)
*/

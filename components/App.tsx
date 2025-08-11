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
  { id: "tech", name: "Tech", vibe: "Start‑up", colors: ["#08]()

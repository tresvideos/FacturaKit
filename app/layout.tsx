import "./globals.css";
export const metadata = { title: "Facturas V7.2", description: "SaaS de facturas con plantillas y export PDF/HTML" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="es"><body className="bg-white text-slate-900">{children}</body></html>);
}

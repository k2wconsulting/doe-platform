import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";
import Providers from "./providers";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "PCT Ai - Formulation Copilot",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-900">
        <Providers>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex overflow-hidden relative">
                {children}
            </main>
          </div>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white border dark:border-slate-700 rounded-lg shadow-lg',
              duration: 4000,
            }}
          />
        </Providers>
      </body>
    </html>
  );
}

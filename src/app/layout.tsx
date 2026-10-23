import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { NotesDrawer } from "@/components/notes-drawer";

export const metadata: Metadata = {
  title: "Embedded Dev Tracker | Personal Engineering Suite",
  description:
    "Personal development lifecycle, daily engineering tasks, phase checklists, technical notes, and product release gates.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <body className="h-full bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex overflow-hidden">
        <Providers>
          <div className="flex w-full h-full">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
              <Topbar />
              <main className="flex-1 overflow-y-auto min-w-0 bg-slate-50 dark:bg-[#090d16]">
                {children}
              </main>
            </div>
            <NotesDrawer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

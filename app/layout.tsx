import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ThemeProvider from "@/app/components/ThemeProvider";
import "./globals.css";

// Runs synchronously in <head> during HTML parsing — before first paint — so
// the saved theme is applied with no flash of the wrong theme. Reads the same
// localStorage "theme" key as ThemeProvider; "system"/absent resolves to the
// OS preference. Keep in sync with ThemeProvider (THEME_STORAGE_KEY).
const NO_FLASH_THEME_SCRIPT = `(function(){try{var c=localStorage.getItem('theme');var t=(c==='light'||c==='dark')?c:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Doc Workspace",
  description: "A personal Markdown document manager that runs in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

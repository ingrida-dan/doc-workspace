import type { Metadata } from "next";
import { Fraunces, Geist_Mono, Inter } from "next/font/google";
import ThemeProvider from "@/app/components/ThemeProvider";
import "./globals.css";

// Runs synchronously in <head> during HTML parsing — before first paint — so
// the saved theme is applied with no flash of the wrong theme. Reads the same
// localStorage "theme" key as ThemeProvider; "system"/absent resolves to the
// OS preference. Keep in sync with ThemeProvider (THEME_STORAGE_KEY).
const NO_FLASH_THEME_SCRIPT = `(function(){var t;try{t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}catch(e){t='light';}try{var c=localStorage.getItem('theme');if(c==='light'||c==='dark')t=c;}catch(e){}document.documentElement.setAttribute('data-theme',t);})();`;

// Inter for UI/body, Fraunces for display/headings, Geist Mono for code.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
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
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
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

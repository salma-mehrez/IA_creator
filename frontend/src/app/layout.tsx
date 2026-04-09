import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";

const plusJakartaSans = Plus_Jakarta_Sans({
 variable:"--font-heading",
 subsets: ["latin"],
 weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
 variable:"--font-sans",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title:"TubeAI Creator | Boost your YouTube channel with AI",
 description:"Next-generation AI platform for YouTube creators: Analysis, Topic Generation, Scripts and Planning.",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
  <html
   lang="fr"
   className={`${plusJakartaSans.variable} ${inter.variable} h-full antialiased`}
   suppressHydrationWarning
  >
   <head>
    {/* Anti-FOUC: apply theme before first paint */}
    <script
     dangerouslySetInnerHTML={{
      __html:`
       try {
        var t = localStorage.getItem('tubeai-theme');
        if (!t) t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        if (t === 'dark') document.documentElement.classList.add('dark');
       } catch(e) {}
     `,
     }}
    />
   </head>
   <body className="min-h-full flex flex-col bg-background text-foreground">
    <ThemeProvider>
     <LanguageProvider>{children}</LanguageProvider>
    </ThemeProvider>
   </body>
  </html>
 );
}

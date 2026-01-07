import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/context/auth-context";
import { StoreProvider } from "@/context/store-context";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ypies Tech Store",
  description: "Your one-stop shop for computers and tech in South Africa",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen bg-background font-sans antialiased")} suppressHydrationWarning>
        <AuthProvider>
          <StoreProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

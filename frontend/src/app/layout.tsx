import type { Metadata } from "next";
import "./globals.css";
import { ReactLenis } from "@/utils/lenis";
import { AppWagmiProvider } from "@/connection";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "HostIT",
  description: "Manage your event seamlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overflowY: "scroll" }} suppressHydrationWarning>
      <AppWagmiProvider>
        <ReactLenis root>
          <body className={`bg-[#131939] antialiased text-text`} suppressHydrationWarning>
            <Toaster richColors closeButton position="top-right" />
            {children}
          </body>
        </ReactLenis>
      </AppWagmiProvider>
    </html>
  );
}

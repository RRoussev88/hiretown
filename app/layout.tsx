import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "antd/dist/reset.css";
import { Footer, Navbar } from "components";
import { AuthProvider } from "context/AuthContext";
import { GlobalProvider } from "context/GlobalContext";
import "styles/globals.css";
import { TrpcClientProvider } from "trpc";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TrpcClientProvider>
      <html data-theme="bumblebee">
        <head></head>
        <body>
          <GlobalProvider>
            <AuthProvider>
              <Navbar />
              <main className="bg-base-200 flex-auto shrink-0">{children}</main>
              <Analytics />
              <SpeedInsights />
            </AuthProvider>
          </GlobalProvider>
          <Footer />
        </body>
      </html>
    </TrpcClientProvider>
  );
}

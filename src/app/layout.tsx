import type { Metadata } from "next";
import AuthProvider from "@/components/auth/AuthProvider";
import CallProvider from "@/components/call/CallProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Quantum Quiz AI",
  description: "Learn JavaScript through AI-guided interactive coding challenges",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <CallProvider>
            {children}
          </CallProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

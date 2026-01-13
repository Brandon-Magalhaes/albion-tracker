import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Albion API",
  description: "Albion API is a RESTful API that provides data about the Albion Online game.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
  cz-shortcut-listen="true" className="bg-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}

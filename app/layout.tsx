import type { Metadata } from "next";
import "./globals.css";

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
  cz-shortcut-listen="true" >
        {children}
      </body>
    </html>
  );
}

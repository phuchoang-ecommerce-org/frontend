import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WebVitalsReporter } from "./web-vitals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Enterprise Commerce Platform",
  description: "ECP storefront",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <WebVitalsReporter />
        {children}
      </body>
    </html>
  );
}

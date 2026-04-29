import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RootLayout as AppRootLayout } from "@/components/layout/RootLayout";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Acadivo — Smart Education Platform",
    template: "%s | Acadivo",
  },
  description: "Acadivo EdTech platform for modern education in Pakistan",
  keywords: ["education", "school", "pakistan", "edtech", "acadivo"],
  authors: [{ name: "Acadivo" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppRootLayout>{children}</AppRootLayout>
      </body>
    </html>
  );
}

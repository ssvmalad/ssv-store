import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Saraswati Sangeet Vadhyalaya — Premium Indian Musical Instruments",
  description: "Shop premium handcrafted Indian musical instruments — Tabla, Harmonium, Sitar, Dholak & more. Repair services, custom orders & nationwide delivery from Malad, Mumbai.",
  keywords: "Indian musical instruments, tabla, harmonium, sitar, dholak, music shop Mumbai, instrument repair",
  openGraph: {
    title: "Saraswati Sangeet Vadhyalaya",
    description: "Premium handcrafted Indian musical instruments since generations. Shop, repair & custom orders.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

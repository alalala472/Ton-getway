import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ton/Guftro AI Gateway", description: "Mobile-first AI API Gateway" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }

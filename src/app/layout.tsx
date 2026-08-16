import "./globals.css";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import Provider from "@/provider/Provider";
import Navigation from "@/components/Navigation";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rag Chatbot",
  description: "Rag based chat",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <Provider>
      <html
        lang="en"
        className={cn(
          "dark h-full antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <body className="flex min-h-full flex-col font-sans">
          <Navigation />
          {children}
        </body>
      </html>
    </Provider>
  );
}

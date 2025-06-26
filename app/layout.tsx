import "@/styles/globals.css";
import { Metadata } from "next";
import { Maven_Pro } from "next/font/google";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  title: "Coaching for Growth at Versuni",
  description: "Welcome to your AI-powered coaching session.",
  openGraph: {
    title: "Coaching for Growth at Versuni",
    description: "Welcome to your AI-powered coaching session.",
    images: [
      {
        url: "/versuni-logo.png",
        width: 1200,
        height: 630,
        alt: "Versuni Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coaching for Growth at Versuni",
    description: "Welcome to your AI-powered coaching session.",
    images: ["/versuni-logo.png"],
  },
  icons: {
    icon: "/versuni-logo.png",
    shortcut: "/versuni-logo.png",
    apple: "/versuni-logo.png",
  },
  metadataBase: new URL("https://jouw-app.up.railway.app"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${mavenPro.variable} font-sans`}
      lang="en"
    >
      <head />
      <body className="min-h-screen bg-white text-black">
        <main className="relative flex flex-col gap-6 min-h-screen w-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}

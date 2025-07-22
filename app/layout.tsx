import "@/styles/globals.css";
import { Metadata } from "next";
import { Maven_Pro } from "next/font/google";

const mavenPro = Maven_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-maven-pro",
});

export const metadata: Metadata = {
  title: "Meet Alex Carter",
  description: "Welcome to your AI-powered training session.",
  openGraph: {
    title: "Meet Alex Carter",
    description: "Welcome to your AI-powered training session.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meet Alex Carter",
    description: "Welcome to your AI-powered training session.",
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
      <head>
        {/* Removed viewport meta tag to prevent zooming */}
      </head>
      <body className="min-h-screen bg-white text-black text-2xl overflow-x-hidden">
        <main className="relative flex flex-col gap-6 min-h-screen w-screen bg-white">
          {children}
        </main>
      </body>
    </html>
  );
}

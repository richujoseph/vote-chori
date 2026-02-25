import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "SJCET Vote — Online Election System",
  description: "Secure online election platform for St. Joseph's College of Engineering and Technology, Palai",
  keywords: ["SJCET", "election", "voting", "student council"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

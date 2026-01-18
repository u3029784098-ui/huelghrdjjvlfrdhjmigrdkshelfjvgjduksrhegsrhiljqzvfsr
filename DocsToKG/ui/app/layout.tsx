// import type { Metadata } from "next";
// import { Inter } from "next/font/google";
// import "./globals.css";
// import AuthProvider from "../components/AuthProvider";
// const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "DocsToKG Application",
//   description: "Document to Knowledge Graph Conversion Platform",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <AuthProvider>
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }


import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DocsToKG Application",
  description: "Document to Knowledge Graph Conversion Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
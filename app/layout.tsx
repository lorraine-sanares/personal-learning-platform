import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Learning Platform",
  description: "Personal knowledge base with spaced repetition",
};

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/ingest", label: "Ingest" },
  { href: "/backlog", label: "Backlog" },
  { href: "/review", label: "Review" },
  { href: "/digest", label: "Digest" },
  { href: "/explore", label: "Explore" },
  { href: "/perspectives", label: "Perspectives" },
  { href: "/settings", label: "Settings" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <nav className="sidebar">
            <h1 className="app-title">Learning Platform</h1>
            <ul>
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <main className="content">{children}</main>
        </div>
      </body>
    </html>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/collection",
    label: "Collection",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-5 h-5"
      >
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/groups",
    label: "Groupes",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-5 h-5"
      >
        <circle cx="8.5" cy="7.5" r="3" />
        <circle cx="15.5" cy="7.5" r="3" />
        <path d="M2 20c0-3 2.91-5.5 6.5-5.5" />
        <path d="M10 20c0-3 2.91-5.5 6.5-5.5S23 17 23 20" />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Stats",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-5 h-5"
      >
        <path d="M3 20V13M9 20V7M15 20V10M21 20V3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profil",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        className="w-5 h-5"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function Navbar() {
  const path = usePathname();
  const isAuth = path.startsWith("/auth");
  if (isAuth) return null;

  return (
    <>
      {/* Desktop top nav */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-void/96 backdrop-blur-sm border-b border-white/[0.06] px-8 h-16 items-center justify-between">
        <Link href="/collection" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-lime rounded-md flex items-center justify-center shrink-0">
            <span className="font-title font-bold text-void text-sm leading-none">
              P
            </span>
          </div>
          <span className="font-title font-bold text-text text-lg uppercase">
            Panini <span className="text-lime">WC26</span>
          </span>
        </Link>
        <ul className="flex gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-title font-semibold  uppercase transition-colors block ${
                    active ? "text-lime" : "text-text/35 hover:text-text/70"
                  }`}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-lime rounded-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-void/98 backdrop-blur-md border-t border-white/[0.06]">
        <ul className="flex h-16 items-stretch">
          {NAV_ITEMS.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <li key={item.href} className="flex-1 relative">
                {active && (
                  <span className="absolute top-0 left-4 right-4 h-px bg-lime rounded-full" />
                )}
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center h-full gap-1.5 transition-colors ${
                    active ? "text-lime" : "text-text/28"
                  }`}
                >
                  {item.icon}
                  <span className="text-[9px] font-title font-semibold  uppercase leading-none">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

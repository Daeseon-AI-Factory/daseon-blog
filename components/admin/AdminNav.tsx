"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clsx } from "clsx";

const items = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/distribution", label: "Distribution" },
  { href: "/admin/site", label: "Site" },
  { href: "/admin/analytics", label: "Analytics" },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <nav className="flex items-center gap-4 text-sm text-ink-muted">
      {items.map((item) => {
        const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx("hover:text-ink", active && "text-ink underline underline-offset-4")}
          >
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="ml-2 border-l border-paper-line pl-4 text-ink-subtle hover:text-ink"
      >
        Sign out
      </button>
    </nav>
  );
}

import React, { useCallback, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export type LinkItem = { to: string; label: string };

export const LINKS: LinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/contributors", label: "Contributors" },
  { to: "/services", label: "Services" },
  { to: "/login", label: "Login" },
];

const NavLinks: React.FC<{ className?: string }> = React.memo(
  ({ className = "" }) => {
    const { pathname } = useLocation();
    const links = useMemo(() => LINKS, []);

    const isActive = useCallback(
      (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to)),
      [pathname]
    );

    return (
      <nav
        aria-label="Primary navigation"
        className={`hidden md:flex items-center gap-4 ${className}`}
      >
        {links.map((l) => {
          const active = isActive(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-current={active ? "page" : undefined}
              className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-karibaNavy dark:text-karibaSand"
                  : "text-gray-700 dark:text-gray-200 hover:text-karibaTeal"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/30`}
            >
              {l.label}
              <span
                aria-hidden
                className={`absolute left-1/2 transform -translate-x-1/2 -bottom-1 h-[3px] rounded-full bg-gradient-to-r from-karibaTeal to-karibaCoral transition-all duration-300 ${
                  active ? "w-10" : "w-0 group-hover:w-8"
                }`}
              />
            </Link>
          );
        })}
      </nav>
    );
  }
);
NavLinks.displayName = "NavLinks";
export default NavLinks;

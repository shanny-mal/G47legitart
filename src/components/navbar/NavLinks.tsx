import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

export type LinkItem = { to: string; label: string };

const LINKS: LinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/issues", label: "Issues" },
  { to: "/contributors", label: "Contributors" },
  { to: "/services", label: "Services" },
  { to: "/login", label: "Login" },
];

const NavLinks: React.FC<{ className?: string }> = React.memo(
  ({ className = "" }) => {
    const { pathname } = useLocation();
    const links = useMemo(() => LINKS, []);

    const isActive = (to: string) =>
      to === "/" ? pathname === "/" : pathname.startsWith(to);

    return (
      <div className={`hidden md:flex items-center space-x-6 ${className}`}>
        {links.map((l) => {
          const active = isActive(l.to);
          return (
            <Link
              key={l.to}
              to={l.to}
              aria-current={active ? "page" : undefined}
              className={`group relative px-1 py-1 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "text-karibaTeal"
                  : "text-gray-800 dark:text-gray-100 hover:text-karibaTeal"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/40 rounded`}
            >
              {l.label}
              <span
                className={`absolute left-0 -bottom-1 h-[2px] bg-karibaTeal transition-all duration-300 ${
                  active ? "w-full" : "w-0 group-hover:w-full"
                }`}
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    );
  }
);

NavLinks.displayName = "NavLinks";
export default NavLinks;
export { LINKS };

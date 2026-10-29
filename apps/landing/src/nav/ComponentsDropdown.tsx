import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const COMPONENT_LINKS = [
  { label: "ENS Registration", href: "#ens-registration" },
  { label: "ENS Renewal", href: "#ens-renewal" },
  { label: "ENS Records", href: "#ens-records" },
  { label: "Select Records", href: "#select-records" },
  { label: "Offchain Subnames", href: "#offchain-subname" },
  { label: "Onchain Subnames", href: "#subname-mint" },
  { label: "Subname Renewal", href: "#subname-renewal" },
];

export function ComponentsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="nav-dropdown">
      <button
        className={`nav-link nav-dropdown-trigger${open ? " active" : ""}`}
        onClick={() => setOpen(o => !o)}
      >
        Components
        <ChevronDown
          size={12}
          className={`nav-dropdown-chevron${open ? " open" : ""}`}
        />
      </button>
      {open && (
        <div className="nav-dropdown-menu">
          {COMPONENT_LINKS.map(item => (
            <a
              key={item.href}
              className="nav-dropdown-item"
              href={item.href}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

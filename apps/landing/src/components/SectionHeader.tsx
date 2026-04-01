import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import shurikenSvg from "../assets/shuriken.svg";

type SectionIcon = LucideIcon | string;

export function SectionHeader({
  icon,
  name,
  title,
  desc,
}: {
  icon: SectionIcon;
  name: string;
  title: string;
  desc: string;
}) {
  const isImg = typeof icon === "string";
  const isShuriken = icon === shurikenSvg;
  const Icon = isImg ? null : icon as LucideIcon;
  const badgeRef = useRef<HTMLDivElement>(null);
  const [spin, setSpin] = useState(false);

  useEffect(() => {
    if (!isShuriken) return;
    const el = badgeRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSpin(entry.isIntersecting);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isShuriken]);

  return (
    <>
      <div className="agent-qs-header">
        <div
          ref={badgeRef}
          className={`agent-qs-badge${isImg ? " agent-qs-badge-img" : ""}`}
        >
          {isImg
            ? <img src={icon as string} alt="" className={`section-icon-img${spin ? " section-icon-spin" : ""}`} />
            : Icon && <Icon size={13} strokeWidth={2.5} />
          }
          {name}
        </div>
        <h2 className="agent-qs-title">{title}</h2>
        <p className="agent-qs-subtitle">{desc}</p>
      </div>
    </>
  );
}

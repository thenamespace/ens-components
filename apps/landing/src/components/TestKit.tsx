import React from "react";

export function TestKit({
  children,
  note,
  network = "Sepolia",
}: {
  children: React.ReactNode;
  note?: React.ReactNode;
  network?: string;
}) {
  return (
    <div className="test-kit">
      <div className="test-kit-header">
        <span className="test-kit-title">Test kit</span>
        <span className="test-kit-network">{network}</span>
      </div>
      <ol className="test-kit-steps">{children}</ol>
      {note && <p className="test-kit-note">{note}</p>}
    </div>
  );
}

export function TestStep({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <li className="test-kit-step">
      <span className="test-kit-step-title">{title}</span>
      {children && <div className="test-kit-step-body">{children}</div>}
    </li>
  );
}

export function Chip({
  active,
  onClick,
  children,
  meta,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  meta?: string;
}) {
  return (
    <button type="button" className={`test-chip${active ? " active" : ""}`} onClick={onClick}>
      <span>{children}</span>
      {meta && <span className="test-chip-meta">{meta}</span>}
    </button>
  );
}

export function KitButton({
  onClick,
  disabled,
  children,
  href,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  href?: string;
}) {
  if (href)
    return (
      <a className="test-kit-btn" href={href} target={href.startsWith("#") ? undefined : "_blank"} rel="noreferrer">
        {children}
      </a>
    );
  return (
    <button type="button" className="test-kit-btn" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function OrynHeader() {
  return (
    <header className="border-b border-line bg-cream/80 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 py-5 flex items-center justify-between">
        <Link to="/" className="serif text-2xl tracking-tight text-ink">Oryn<span className="text-accent">.</span></Link>
        <div className="flex items-center gap-6 text-xs uppercase tracking-[0.18em] text-ink-muted">
          <span className="hidden sm:inline">AI-Engineered</span>
          <span className="hidden md:inline">Made for India</span>
          <span className="text-ink">100% Free Analysis</span>
        </div>
      </div>
    </header>
  );
}

export function OrynFooter() {
  return (
    <footer className="border-t border-line mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col md:flex-row justify-between gap-4 text-xs uppercase tracking-[0.18em] text-ink-muted">
        <span className="serif text-lg normal-case tracking-tight text-ink">Oryn<span className="text-accent">.</span></span>
        <span>Protein, Reimagined · India · {new Date().getFullYear()}</span>
      </div>
    </footer>
  );
}

export function OrynBotanical({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="0.6">
      <circle cx="100" cy="100" r="72" opacity="0.35" />
      <circle cx="100" cy="100" r="56" opacity="0.5" />
      <circle cx="100" cy="100" r="38" opacity="0.7" />
      <path d="M100 30 C 130 60, 130 140, 100 170 C 70 140, 70 60, 100 30 Z" opacity="0.9" />
      <path d="M40 100 C 70 70, 130 70, 160 100 C 130 130, 70 130, 40 100 Z" opacity="0.9" />
      <line x1="100" y1="20" x2="100" y2="180" opacity="0.4" />
      <line x1="20" y1="100" x2="180" y2="100" opacity="0.4" />
    </svg>
  );
}

export function ScreenFrame({ children, progress }: { children: ReactNode; progress?: { current: number; total: number; label?: string } }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {progress && (
        <div className="fixed top-0 inset-x-0 z-50">
          <div className="h-1 bg-cream-deep">
            <div
              className="h-full bg-accent transition-all duration-500 ease-out"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <div className="mx-auto max-w-6xl px-6 py-3 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-ink-muted">
            <span className="serif text-base normal-case tracking-tight text-ink">Oryn<span className="text-accent">.</span></span>
            <span>{progress.label ?? `Metric ${progress.current} of ${progress.total}`}</span>
          </div>
        </div>
      )}
      <main className="flex-1">{children}</main>
    </div>
  );
}

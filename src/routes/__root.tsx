import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="oryn-chip mb-6">ORYN · 404</p>
        <h1 className="serif text-6xl text-ink">Off the map.</h1>
        <p className="mt-4 text-sm text-ink-muted">
          The screen you're looking for doesn't exist in the Oryn architecture.
        </p>
        <div className="mt-8">
          <Link to="/" className="oryn-btn">Return home</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4">
      <div className="max-w-md text-center">
        <p className="oryn-chip mb-6">ORYN · SYSTEM</p>
        <h1 className="serif text-4xl text-ink">Signal interrupted.</h1>
        <p className="mt-4 text-sm text-ink-muted">
          Something went wrong on our side. Recalibrate and try again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button onClick={() => { router.invalidate(); reset(); }} className="oryn-btn">
            Try again
          </button>
          <a href="/" className="oryn-btn oryn-btn-accent">Go home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Oryn — Find the plant protein that fits you. In 60 seconds." },
      { name: "description", content: "India's first AI protein-matching engine. Cross-referenced against the entire Indian market. 100% free analysis." },
      { name: "author", content: "Oryn" },
      { property: "og:title", content: "Oryn — Find the plant protein that fits you. In 60 seconds." },
      { property: "og:description", content: "India's first AI protein-matching engine. Cross-referenced against the entire Indian market. 100% free analysis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Oryn — Find the plant protein that fits you. In 60 seconds." },
      { name: "twitter:description", content: "India's first AI protein-matching engine. Cross-referenced against the entire Indian market. 100% free analysis." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5b2e63ca-46bf-4766-a34a-5d3865dae70e" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/5b2e63ca-46bf-4766-a34a-5d3865dae70e" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500&family=Inter:wght@300;400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

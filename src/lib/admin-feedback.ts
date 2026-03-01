import { NextResponse } from "next/server";

type QueryPrimitive = string | number | boolean;
type QueryValue = QueryPrimitive | null | undefined;
type QueryInput = Record<string, QueryValue>;

type RedirectOptions = {
  ok?: string;
  err?: string;
  query?: QueryInput;
  status?: 303 | 302 | 307 | 308;
};

function withQuery(pathname: string, query: QueryInput = {}): string {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(query)) {
    if (raw === null || raw === undefined) continue;
    const value = String(raw).trim();
    if (!value) continue;
    params.set(key, value);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

export function redirectWithFeedback(req: Request, pathname: string, options: RedirectOptions = {}) {
  const query: QueryInput = { ...(options.query ?? {}) };
  if (options.err) {
    query.err = options.err;
  } else if (options.ok) {
    query.ok = options.ok;
  }
  const target = withQuery(pathname, query);
  return NextResponse.redirect(new URL(target, req.url), { status: options.status ?? 303 });
}

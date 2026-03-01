// This layout is intentionally empty to avoid applying the admin session guard and
// sidebar to the login page. By defining a layout at this level, Next.js
// overrides the parent `src/app/admin/layout.tsx` for the login route only.
// See https://nextjs.org/docs/app/building-your-application/routing/layouts#nested-layouts
// for details about nested layouts.

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Simply render the children. This ensures the login page uses the global
  // application layout (src/app/layout.tsx) but not the admin layout which
  // requires an active session. Without this override, visiting `/admin/login`
  // would be wrapped by the admin layout and cause an infinite redirect loop.
  return <>{children}</>;
}
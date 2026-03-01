import clsx from "clsx";

export function WhatsAppCta({
  waMe,
  text,
  className,
  message,
}: {
  waMe: string;
  text: string;
  className?: string;
  message?: string;
}) {
  const msg = message ? `?text=${encodeURIComponent(message)}` : "";
  return (
    <a
      href={`https://wa.me/${waMe}${msg}`}
      target="_blank"
      rel="noreferrer"
      className={clsx(
        // Primary CTA styling: larger padding, dark background, white text and subtle shadow
        "inline-flex items-center justify-center rounded-lg bg-brand-700 px-5 py-3 text-base font-semibold text-white shadow hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500",
        className
      )}
    >
      {text}
    </a>
  );
}

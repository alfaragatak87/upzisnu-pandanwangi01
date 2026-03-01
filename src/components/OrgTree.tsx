import Image from "next/image";

export type OrgItem = {
  id: string;
  positionTitle: string;
  name: string;
  photoPath: string | null;
  whatsapp: string | null;
  parentId: string | null;
};

type Node = OrgItem & { children: Node[] };

function buildTree(items: OrgItem[]): Node[] {
  const map = new Map<string, Node>();
  for (const i of items) map.set(i.id, { ...i, children: [] });
  const roots: Node[] = [];
  for (const n of map.values()) {
    if (n.parentId && map.has(n.parentId)) map.get(n.parentId)!.children.push(n);
    else roots.push(n);
  }
  return roots;
}

function toWaLink(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return `https://wa.me/62${digits.slice(1)}`;
  if (digits.startsWith("62")) return `https://wa.me/${digits}`;
  return `https://wa.me/${digits}`;
}

function Card({ item, level }: { item: OrgItem; level: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-brand-200 hover:shadow-md">
      <div className="mb-2 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
        Level {level + 1}
      </div>
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
          <Image src={item.photoPath ?? "/brand/avatar-placeholder.png"} alt={item.name} fill className="object-cover" />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-brand-900">{item.positionTitle}</div>
          <div className="text-sm text-slate-800">{item.name}</div>
          {item.whatsapp ? (
            <a
              href={toWaLink(item.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              WA {item.whatsapp}
            </a>
          ) : (
            <div className="mt-1 text-xs text-slate-400">WA belum diisi</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, level = 0 }: { node: Node; level?: number }) {
  return (
    <div className="space-y-3">
      <Card item={node} level={level} />
      {node.children.length > 0 && (
        <div className="relative ml-4 border-l-2 border-brand-100 pl-5 sm:ml-6 sm:pl-6">
          <div className="space-y-3">
            {node.children.map((c) => (
              <div key={c.id} className="relative">
                <span className="absolute -left-6 top-5 h-0.5 w-5 bg-brand-100 sm:-left-7 sm:w-6" />
                <TreeNode node={c} level={level + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function OrgTree({ items }: { items: OrgItem[] }) {
  const roots = buildTree(items);
  return (
    <div className="space-y-6">
      {roots.map((r) => (
        <TreeNode key={r.id} node={r} />
      ))}
    </div>
  );
}

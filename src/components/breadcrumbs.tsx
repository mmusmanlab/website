import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const trail = [{ label: "Home", href: "/" }, ...items];
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://mmusmanlab.vercel.app${item.href}` } : {}),
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          {trail.map((item, index) => (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && <span aria-hidden="true">/</span>}
              {index === trail.length - 1 || !item.href
                ? <span aria-current={index === trail.length - 1 ? "page" : undefined}>{item.label}</span>
                : <Link className="hover:text-primary" href={item.href}>{item.label}</Link>}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
    </>
  );
}
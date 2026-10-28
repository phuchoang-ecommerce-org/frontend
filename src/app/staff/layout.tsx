import type { ReactNode } from "react";
import { notFound, redirect } from "next/navigation";
import { StaffNav } from "@/components/layout";
import { getSession } from "@/lib/session";
import { canReadInventory, canWriteCatalog } from "@/lib/session/roles";

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  const roles = session.account.roles;
  const links = [
    ...(canWriteCatalog(roles) ? [{ label: "Catalog", href: "/staff/catalog" }] : []),
    ...(canReadInventory(roles) ? [{ label: "Inventory", href: "/staff/inventory" }] : []),
  ];
  if (!links.length) notFound();
  return (
    <>
      <StaffNav links={links} />
      {children}
    </>
  );
}

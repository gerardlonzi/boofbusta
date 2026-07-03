import { unstable_cache } from "next/cache";
import { getCurrentUser } from "@/lib/auth/session";
import { getCategories } from "@/services/category.service";
import { SiteHeader } from "./site-header";

const getCachedCategories = unstable_cache(
  async () => getCategories(),
  ["site-nav-categories"],
  { revalidate: 300, tags: ["categories"] }
);

export async function Header() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCachedCategories()]);

  return (
    <SiteHeader
      user={user ? { firstName: user.firstName, role: user.role } : null}
      categories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      }))}
    />
  );
}

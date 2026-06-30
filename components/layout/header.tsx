import { getCurrentUser } from "@/lib/auth/session";

import { getCategories } from "@/services/category.service";

import { SiteHeader } from "./site-header";



export async function Header() {

  const [user, categories] = await Promise.all([

    getCurrentUser(),

    getCategories(),

  ]);



  return (

    <SiteHeader

      user={

        user

          ? { firstName: user.firstName, role: user.role }

          : null

      }

      categories={categories.map((c) => ({

        id: c.id,

        name: c.name,

        slug: c.slug,

      }))}

    />

  );

}


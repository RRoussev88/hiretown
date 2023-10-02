import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

import { UserBusiness, UserRole } from "types";
import { BACKEND_URL, DataCollections } from "utils";

export async function middleware(request: NextRequest) {
  const pbClient = new PocketBase(BACKEND_URL);

  pbClient.authStore.loadFromCookie(request.headers.get("cookie") ?? "");

  if (!pbClient.authStore.isValid) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const userId = pbClient.authStore.model?.id;

  const userRoles: UserRole[] = await pbClient
    .collection(DataCollections.USER_ROLES)
    .getFullList(1, {
      filter: `user="${userId}"&&(role.name="ADMIN"||role.name="SUPER ADMIN")`,
    });
  // If the user is Admin - allow him to continue without anymore checks
  if (userRoles.length) {
    return NextResponse.next();
  }

  const spltPathname = request.nextUrl.pathname.split("/");
  if (
    request.nextUrl.pathname.startsWith("/businesses/") &&
    spltPathname.length > 3
  ) {
    const businessId = spltPathname[2];

    // Check if the current user has the required permissions to edit this business
    const permissions: UserBusiness[] = await pbClient
      .collection(DataCollections.USER_BUSINESSES)
      .getFullList(1, {
        filter: `user="${userId}"&&business="${businessId}"`,
      });

    if (!permissions) {
      return NextResponse.redirect(
        new URL(`/businesses/${businessId}`, request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/businesses", "/businesses/:id/:path+"],
};

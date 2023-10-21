import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

import { UserBusiness, UserRole } from "types";
import { BACKEND_URL, DataCollections } from "utils";

export async function middleware(request: NextRequest) {
  const pbClient = new PocketBase(BACKEND_URL);

  pbClient.authStore.loadFromCookie(request.headers.get("cookie") ?? "");

  const userId = pbClient.authStore.model?.id;

  if (pbClient.authStore.isValid) {
    try {
      const userRoles: UserRole[] = await pbClient
        .collection(DataCollections.USER_ROLES)
        .getFullList(1, {
          filter: `user="${userId}"&&(role.name="ADMIN"||role.name="SUPER ADMIN")`,
        });
      // If the user is Admin - allow him to continue without anymore checks
      if (userRoles.length) {
        return NextResponse.next();
      }
    } catch {}
  } else if (request.nextUrl.pathname.startsWith("/profile/")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const spltPathname = request.nextUrl.pathname.split("/");
  if (
    spltPathname.length > 4 &&
    request.nextUrl.pathname.startsWith("/profile/activity/businesses/")
  ) {
    const businessId = spltPathname[4];
    const businessResponse = NextResponse.redirect(
      new URL(`/businesses/${businessId}`, request.url)
    );
    // Check if the current user has the required permissions to edit this business
    try {
      const permissions: UserBusiness[] = await pbClient
        .collection(DataCollections.USER_BUSINESSES)
        .getFullList(1, {
          filter: `user="${userId}"&&business="${businessId}"`,
        });

      if (!permissions.length) {
        return businessResponse;
      }
    } catch (error) {
      return businessResponse;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/businesses", "/businesses/:id/:path+"],
};

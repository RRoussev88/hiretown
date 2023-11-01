import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

import { BACKEND_URL } from "utils";

export async function middleware(request: NextRequest) {
  const pbClient = new PocketBase(BACKEND_URL);

  pbClient.authStore.loadFromCookie(request.headers.get("cookie") ?? "");

  const userId = pbClient.authStore.model?.id;

  const requestInit = {
    headers: {
      Authorization: pbClient.authStore.token,
      "Content-Type": "application/json",
    },
  };

  if (pbClient.authStore.isValid) {
    try {
      const filter = encodeURIComponent(
        `(user="${userId}" && (role.name="ADMIN"||role.name="SUPER ADMIN"))`
      );
      const res = await fetch(
        `${BACKEND_URL}/api/collections/userRoles/records?filter=${filter}`,
        requestInit
      );
      const data = await res.json();

      // If the user is Admin - allow him to continue without anymore checks
      if (data.items?.length) {
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
    console.log("user: ", userId);
    console.log("businessId: ", businessId);

    try {
      // Check if the current user has the required permissions to edit this business
      const filter = encodeURIComponent(
        `(user="${userId}" && business="${businessId}")`
      );
      const res = await fetch(
        `${BACKEND_URL}/api/collections/userBusinesses/records?filter=${filter}`,
        requestInit
      );
      const data = await res.json();
      console.log("busiesses data: ", data);

      if (!data.items?.length) {
        console.log("Second /businesses/:id redirect");
        return businessResponse;
      }
    } catch (error) {
      console.log(`USER_BUSINESSES Error ${error}`);
      console.log(`Redirect /businesses/${businessId} userId=${userId}`);
      return businessResponse;
    }
  }
  console.log("Last next()");
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/businesses", "/businesses/:id/:path+"],
};

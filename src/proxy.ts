import { NextResponse } from "next/server";

// Tenant resolution (organization subdomain/host → request context) lands in Phase 1.
// Phase 0 only scaffolds the file so later phases don't need to introduce it from scratch.
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

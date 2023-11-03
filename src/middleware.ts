import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = new URL(req.url);
  if (url.protocol === "http:" || url.hostname.startsWith("www.")) {
    if (req.url.includes("notebook")) {
      const httpsUrl = `https://${url.host}${url.pathname}${url.search}${url.hash}`;
      console.log(httpsUrl, "httpsUrl");
      return NextResponse.redirect(httpsUrl, {
        status: 301,
        headers: {
          ...req.headers,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

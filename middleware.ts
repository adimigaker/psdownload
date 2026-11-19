import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyBasicAuth, getAuthChallenge } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /dash routes
  if (pathname.startsWith("/dash")) {
    const authHeader = request.headers.get("authorization");
    
    if (!verifyBasicAuth(authHeader)) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: {
          "WWW-Authenticate": getAuthChallenge(),
        },
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dash/:path*"],
};
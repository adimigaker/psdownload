import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protect all /dash routes
  if (pathname.startsWith("/dash")) {
    const authHeader = request.headers.get("authorization");
    
    // Simple auth check without Buffer (Edge compatible)
    const expectedUser = process.env.DASH_USER;
    const expectedPass = process.env.DASH_PASS;
    
    if (!expectedUser || !expectedPass) {
      console.error("Dashboard credentials not configured");
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="PSDownload Dashboard"' },
      });
    }
    
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="PSDownload Dashboard"' },
      });
    }
    
    // Decode base64 without Buffer (Edge compatible)
    const base64Credentials = authHeader.split(" ")[1];
    let credentials: string;
    try {
      // Use atob() which is available in Edge Runtime
      credentials = atob(base64Credentials);
    } catch {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="PSDownload Dashboard"' },
      });
    }
    
    const [username, password] = credentials.split(":");
    
    if (username !== expectedUser || password !== expectedPass) {
      return new NextResponse("Authentication required", {
        status: 401,
        headers: { "WWW-Authenticate": 'Basic realm="PSDownload Dashboard"' },
      });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/dash/:path*"],
};
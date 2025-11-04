import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// List of routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/', '/api/auth'];

// List of routes that require a selected company
const companyRequiredRoutes = ['/dashboard'];

// List of routes where company selection is not needed
const companyExcludedRoutes = ['/companies', '/api/companies'];

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const token = request.cookies.get('next-auth.session-token')?.value || 
               request.cookies.get('__Secure-next-auth.session-token')?.value;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current route requires a company to be selected
  const isCompanyRequired = companyRequiredRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current route is excluded from company selection check
  const isCompanyExcluded = companyExcludedRoutes.some(route => pathname.startsWith(route));

  // If it's a public route, allow access
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    // Verify the JWT token
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || '');
    await jwtVerify(token, secret);
    
    // If user is trying to access the root, redirect to companies page
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/companies', request.url));
    }
    
    // If company is required but not selected, and not on an excluded route
    const selectedCompanyId = request.cookies.get('selectedCompanyId')?.value;
    if (isCompanyRequired && !selectedCompanyId && !isCompanyExcluded) {
      return NextResponse.redirect(new URL('/companies', request.url));
    }
    
    // If user is on the companies page but has a selected company, redirect to dashboard
    if (pathname === '/companies' && selectedCompanyId && !searchParams.get('force')) {
      return NextResponse.redirect(new URL(`/dashboard?companyId=${selectedCompanyId}`, request.url));
    }
    
    // Continue to the requested page
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    // If token is invalid, clear the auth cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('next-auth.session-token');
    response.cookies.delete('__Secure-next-auth.session-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes) - except /api/auth
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api/(?!auth).*).*)',
  ],
};

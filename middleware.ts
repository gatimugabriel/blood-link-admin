import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Define protected and auth routes
    const isAuthRoute = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up');
    const isProtectedRoute = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/blood-requests') ||
        pathname.startsWith('/donations') ||
        pathname.startsWith('/analytics') ||
        pathname.startsWith('/facilities') ||
        pathname.startsWith('/reports') ||
        pathname.startsWith('/settings') ||
        pathname.startsWith('/help') ||
        pathname.startsWith('/search') ||
        pathname.startsWith('/data-library');

    if (isAuthRoute && accessToken) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isProtectedRoute && !accessToken) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (pathname === '/') {
        if (accessToken) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        } else {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
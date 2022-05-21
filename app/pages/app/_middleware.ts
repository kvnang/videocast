import { NextRequest, NextResponse } from 'next/server';
// The sole purpose of this middleware is to reduce the number
// of situations in which the user sees a flash of content
// before being redirected to the IDP to authenticate.
// It DOES NOT verify the auth session in any way.
// It ONLY checks to see if the appSession cookie exists.
// As of nextjs-auth0@1.7.0 the "appSession" cookie name is not configurable so it is hard-coded below
export function middleware(req: NextRequest) {
  const appSessionCookieExists = !!req.cookies.appSession;
  const { pathname, href } = req.nextUrl;
  if (appSessionCookieExists || pathname.startsWith('/api/')) {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.cookie('appSession', 'demo');

  return res;
  // return NextResponse.redirect(
  //   `${process.env.AUTH0_BASE_URL}/api/auth/login?returnTo=${href}`
  // );
}

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/spaces(.*)',
  '/library(.*)',
  '/api/generations(.*)',
  '/api/chat(.*)',
  '/api/me(.*)',
  '/api/billing(.*)',
  '/api/feedback(.*)',
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|webp|avif|gif|ico)$).*)',
  ],
};

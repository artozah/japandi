<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Auth gates

- **Route access** is protected by Clerk middleware in `src/proxy.ts` — let it issue the redirect.
- **Action-triggered gates** (button clicks while browsing — save, download, buy, like) use `useClerk().openSignIn({ forceRedirectUrl })` from `@clerk/nextjs`. Do not redirect with `window.location.assign('/sign-in')` — it drops client state and feels jarring in the SPA flow.

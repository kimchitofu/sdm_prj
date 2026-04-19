```markdown
Firebase migration notes

This project was migrated from NextAuth + Prisma to Firebase Auth + Firestore so it can be deployed from GitHub (static hosting).

## Deployment
- Static deploys use Firebase Hosting
- GitHub deploy integration is set up with Firebase Hosting GitHub Actions (recommended for CI-driven deploys)

## GitHub setup
- Run `firebase init hosting` locally to create a `firebase.json` and configure the `public` output (or commit a repo `firebase.json` already configured to serve the `out/` static export).
- Run `firebase init hosting:github` to set up the GitHub Actions workflow that will deploy on push to `main` (or whichever branch you choose). Commit the generated workflow files into the repo.

## Required GitHub secrets
- FIREBASE_TOKEN (created via `firebase login:ci`) — GitHub Actions will use this to authenticate firebase-tools
- Any `NEXT_PUBLIC_FIREBASE_*` values that the app needs at build time, e.g.:
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID

## Notes
- Old NextAuth/Prisma server routes were removed or disabled. Authentication should now use the Firebase client SDK.
- Firestore stores user profiles and application data (user docs under `users/{uid}` with a `role` field). See `firestore.rules` for an initial policy.
- The app was refactored so client-side pages use the Firebase JS SDK for Auth + Firestore reads/writes. Server-only code (NextAuth + Prisma) has been stubbed out to avoid server runtime dependencies.

If you want, I can:
- Remove Prisma and NextAuth packages entirely from `package.json` and update lockfiles.
- Add or finalize a `firebase.json` hosting configuration committed to the repo.
- Improve the GitHub Actions workflow or update the existing GitLab CI pipeline to GitHub Actions if you prefer a GitHub-first workflow.

```
Summary of changes to migrate from NextAuth + Prisma (SQLite/Mongo) to Firebase Auth + Firestore

Files changed/added and why:

- package.json
  - Replaced server-side NextAuth dependency with `firebase` client SDK so auth is handled client-side.
  - Left Prisma packages in place to avoid wide churn; removing them is optional after verification.

- (deleted) /Working/app/api/auth/[...nextauth]/route.ts
  - Removed NextAuth server route. Authentication is now handled client-side with Firebase Authentication.

- (deleted) /Working/app/api/auth/register/route.ts
  - Removed server-side registration route; registration now uses Firebase client API and Firestore.

- (deleted) /Working/lib/auth.ts
  - Removed NextAuth options and PrismaAdapter configuration (server-side). Not needed with Firebase Auth.

- (deleted) /Working/lib/prisma.ts
  - Removed Prisma client wrapper; we will no longer rely on a local DB file or Prisma client in the client-side architecture.

- /Working/lib/firebase.ts (added)
  - New Firebase initializer. Exports `auth` and `db` for use throughout the app. Reads configuration from NEXT_PUBLIC_* env vars so GitLab CI can inject them at build time.

- /Working/components/providers/session-provider.tsx (updated)
  - Replaced NextAuth <SessionProvider> with a minimal Firebase-based `AuthProvider` and `useAuth` hook. This maintains the global auth context for UI components.

- /Working/app/auth/register/page.tsx (updated)
  - Registration flow now calls `createUserWithEmailAndPassword` (Firebase Auth) and stores profile data into Firestore (`users` collection). Removed server POST to `/api/auth/register` and NextAuth sign-in.

- /Working/app/auth/sign-in/page.tsx (updated)
  - Sign-in flow now calls `signInWithEmailAndPassword` from Firebase Auth and redirects to `/dashboard` on success.

- /.gitlab-ci.yml (added)
  - CI pipeline that installs dependencies, builds the Next.js app and deploys to Firebase Hosting. It only runs the build and deploy stages on `main` and expects `FIREBASE_PROJECT_ID`, `FIREBASE_TOKEN`, and NEXT_PUBLIC_* Firebase config variables to be set in GitLab CI variables.

Why these changes:
- Firebase Hosting is static by default; the original app relied on server-side NextAuth and Prisma which require a Node server and a database file/connection (SQLite or Mongo). Moving auth and profile storage to client-side Firebase Auth + Firestore removes the server-only dependencies and the need to include local DB files in the deployment.

Notes and next steps:
- CI variables to set in GitLab:
  - FIREBASE_PROJECT_ID: your Firebase project id
  - FIREBASE_TOKEN: a CI token generated via `firebase login:ci`
  - NEXT_PUBLIC_FIREBASE_API_KEY
  - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
  - NEXT_PUBLIC_FIREBASE_PROJECT_ID
  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
  - NEXT_PUBLIC_FIREBASE_APP_ID

- Run `npm install` locally to add the `firebase` package and verify the app builds.
- After a successful build, run `npx firebase init hosting` locally once to set up your hosting config, or provide the `firebase.json` in the repo configured for your project.
- This migration intentionally keeps UI components and routes intact; most behavior should remain the same, only auth/backend now use Firebase.

If you want, I can:
- Remove Prisma and NextAuth packages entirely from `package.json` and update lockfiles.
- Add a minimal `firebase.json` hosting config and `public` settings for the project.
- Implement Firestore security rules and an optional Cloud Function if server-side operations are required later.

*** End of changelog

# Club Roster

Internal, no-login work tracker for the club. Anyone can see and edit anyone's tasks. 

## Stack

- Frontend: React + Vite, deployed to Vercel as a static site.
- Data: Firebase Firestore (open read/write rules — internal & trusted only).
- Reminders: a Vercel Serverless Function ([api/send-reminders.js](api/send-reminders.js)) on a Vercel Cron schedule — emails assignees 1 day before a task's due date. Fully free (Vercel Hobby cron + Firestore free tier); no Firebase Blaze plan needed.

## 1. Create the Firebase project

1. Go to the [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. In the new project, go to **Build → Firestore Database → Create database** (start in production mode — the rules below open it up).
3. Go to **Project settings → General → Your apps → Add app → Web**, register the app, and copy the `firebaseConfig` values.
4. Copy `.env.example` to `.env` and paste the values in:

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

5. Edit [.firebaserc](.firebaserc) and replace `REPLACE_WITH_YOUR_FIREBASE_PROJECT_ID` with your Firebase project ID.
6. Install the Firebase CLI if you don't have it (`npm install -g firebase-tools`), then `firebase login` and deploy the open Firestore rules:

   ```
   firebase deploy --only firestore:rules
   ```

## 2. Run the frontend locally

```
npm install
npm run dev
```

## 3. Deploy the frontend to Vercel

```
npm install -g vercel   # if you don't have it
vercel
```

When prompted, or in the Vercel project's **Settings → Environment Variables**, add the same `VITE_FIREBASE_*` variables from your `.env`. [vercel.json](vercel.json) already rewrites all routes to `index.html` so client-side routing (`/member/:id`) works.

## 4. Set up the reminder email (Vercel Cron — free, no Blaze plan)

[api/send-reminders.js](api/send-reminders.js) is a serverless function that finds tasks due tomorrow (not Done, not already reminded) and emails each assignee. [vercel.json](vercel.json) schedules it daily at `30 2 * * *` UTC (8:00 AM `Asia/Kolkata`) via [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs) — free on the Hobby plan for once-a-day schedules, and only activates on **Production** deployments.

1. Get a Gmail **app password**: Google Account → Security → turn on 2-Step Verification → [App passwords](https://myaccount.google.com/apppasswords) → create one, copy the 16-character value.
2. In the Vercel project's **Settings → Environment Variables**, add:
   - `EMAIL_USER` — the full Gmail address
   - `EMAIL_PASS` — the app password (no spaces)
   - `CRON_SECRET` — any random string you generate yourself (e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — works the same in PowerShell, bash, or any shell since it just calls Node). Vercel automatically sends it as a bearer token on its own cron calls, and the function uses it to reject any other caller.
   - The same `VITE_FIREBASE_*` variables from step 3, if not already added (the function reads them too, to reach Firestore).
3. Redeploy (`vercel --prod`) so the cron schedule and new env vars take effect.

Prefer SendGrid instead of Gmail? Swap the `nodemailer.createTransport` call in `api/send-reminders.js` for SendGrid's transport and store `SENDGRID_API_KEY` as an env var instead.

To test it manually before waiting for the schedule:

```
curl -H "Authorization: Bearer <your CRON_SECRET>" https://<your-app>.vercel.app/api/send-reminders
```

## Project structure

```
src/
  firebase.js         Firebase app + Firestore init
  config.js           Logo path & club name
  lib/
    firestore.js      Firestore reads/writes (members, tasks)
    status.js         Status constants, brand colors, overdue logic
  components/
    Navbar.jsx, Loader.jsx, TaskItem.jsx
  pages/
    Home.jsx          Member list with pending/assigned/done counts
    MemberPage.jsx     Member's tasks, sorted by due date, add/edit/delete
api/
  send-reminders.js   Vercel Cron function — daily reminder emails
firestore.rules        Open read/write rules (no auth)
```

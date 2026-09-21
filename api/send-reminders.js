import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore/lite'
import nodemailer from 'nodemailer'

// firestore/lite is a one-shot REST client (no realtime listeners, no
// persistent connection) — the right fit for a serverless function that
// runs once, queries, writes, and exits.
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

function tomorrowStr() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default async function handler(req, res) {
  // Vercel sends this header automatically for its own Cron invocations
  // when CRON_SECRET is set — blocks anyone else from hitting this URL.
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const app = initializeApp(firebaseConfig)
  const db = getFirestore(app)

  const dueDate = tomorrowStr()
  const snap = await getDocs(
    query(
      collection(db, 'tasks'),
      where('dueDate', '==', dueDate),
      where('reminderSent', '==', false),
    ),
  )

  const dueTasks = snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((t) => t.status !== 'Done')

  if (dueTasks.length === 0) {
    return res.status(200).json({ sent: 0 })
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  })

  const memberEmailCache = new Map()
  let sent = 0

  for (const task of dueTasks) {
    if (!memberEmailCache.has(task.assigneeId)) {
      const memberSnap = await getDoc(doc(db, 'members', task.assigneeId))
      memberEmailCache.set(
        task.assigneeId,
        memberSnap.exists() ? memberSnap.data().email : null,
      )
    }
    const email = memberEmailCache.get(task.assigneeId)
    if (!email) continue

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Reminder: "${task.title}" is due tomorrow`,
      text: `Hi ${task.assigneeName},\n\n"${task.title}" is due tomorrow (${task.dueDate}).\n${
        task.description ? `\n${task.description}\n` : ''
      }`,
    })

    await updateDoc(doc(db, 'tasks', task.id), { reminderSent: true })
    sent++
  }

  return res.status(200).json({ sent })
}

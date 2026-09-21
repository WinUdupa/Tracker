import {
  collection,
  query,
  orderBy,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

const membersCol = collection(db, 'members')
const tasksCol = collection(db, 'tasks')

export function subscribeMembers(callback) {
  const q = query(membersCol, orderBy('name'))
  return onSnapshot(q, (snap) => {
    const members = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    // Case-insensitive sort — Firestore's orderBy is byte-order (uppercase
    // before lowercase), which misorders mixed-case names.
    members.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
    callback(members)
  })
}

export function subscribeAllTasks(callback) {
  return onSnapshot(tasksCol, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export function subscribeTasksForMember(memberId, callback) {
  const q = query(tasksCol, where('assigneeId', '==', memberId), orderBy('dueDate', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function addTask({ title, description, assigneeId, assigneeName, dueDate, status }) {
  await addDoc(tasksCol, {
    title,
    description: description || '',
    assigneeId,
    assigneeName,
    dueDate,
    status,
    createdAt: serverTimestamp(),
    reminderSent: false,
  })
}

export async function updateTask(taskId, fields) {
  const payload = { ...fields }
  // If the due date moves, the reminder should be eligible to send again.
  if ('dueDate' in payload) payload.reminderSent = false
  await updateDoc(doc(db, 'tasks', taskId), payload)
}

export async function deleteTask(taskId) {
  await deleteDoc(doc(db, 'tasks', taskId))
}

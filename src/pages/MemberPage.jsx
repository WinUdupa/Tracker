import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TaskItem from '../components/TaskItem'
import { addTask, deleteTask, subscribeTasksForMember, updateTask } from '../lib/firestore'
import { STATUS } from '../lib/status'
import './MemberPage.css'

export default function MemberPage({ members }) {
  const { id } = useParams()
  const member = members.find((m) => m.id === id)
  const [tasks, setTasks] = useState([])
  const [loadingTasks, setLoadingTasks] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setLoadingTasks(true)
    const unsubscribe = subscribeTasksForMember(id, (list) => {
      setTasks(list)
      setLoadingTasks(false)
    })
    return unsubscribe
  }, [id])

  if (!member) {
    return (
      <div className="member-page">
        <p>Member not found.</p>
        <Link to="/">&larr; Back to members</Link>
      </div>
    )
  }

  async function handleAdd(e) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    setSaving(true)
    try {
      await addTask({
        title: title.trim(),
        description: description.trim(),
        assigneeId: member.id,
        assigneeName: member.name,
        dueDate,
        status: STATUS.NOT_STARTED,
      })
      setTitle('')
      setDescription('')
      setDueDate('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="member-page">
      <Link to="/" className="back-link">
        &larr; All members
      </Link>
      <h1>{member.name}</h1>

      <form className="add-task-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
        <div className="add-task-row">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <button type="submit" disabled={saving}>
            Add task
          </button>
        </div>
      </form>

      {!loadingTasks && tasks.length === 0 && <p className="empty">No tasks yet.</p>}

      <ul className="task-list">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={(fields) => updateTask(task.id, fields)}
            onDelete={() => deleteTask(task.id)}
          />
        ))}
      </ul>
    </div>
  )
}

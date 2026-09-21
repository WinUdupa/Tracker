import { useState } from 'react'
import { STATUS_ORDER, STATUS_COLOR, isOverdue } from '../lib/status'
import './TaskItem.css'

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [dueDate, setDueDate] = useState(task.dueDate)
  const overdue = isOverdue(task)

  function save(e) {
    e.preventDefault()
    if (!title.trim() || !dueDate) return
    onUpdate({ title: title.trim(), description: description.trim(), dueDate })
    setEditing(false)
  }

  function cancel() {
    setTitle(task.title)
    setDescription(task.description || '')
    setDueDate(task.dueDate)
    setEditing(false)
  }

  if (editing) {
    return (
      <li className="task-item">
        <form className="task-edit-form" onSubmit={save}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
          <div className="task-edit-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={cancel}>
              Cancel
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className={`task-item${overdue ? ' overdue' : ''}`}>
      <div className="task-main">
        <div className="task-text">
          <p className="task-title">{task.title}</p>
          {task.description && <p className="task-desc">{task.description}</p>}
          <p className="task-due">
            Due {task.dueDate}
            {overdue && <span className="overdue-dot" aria-label="Overdue" />}
          </p>
        </div>
        <select
          className="status-select"
          value={task.status}
          style={{ '--status-color': STATUS_COLOR[task.status] }}
          onChange={(e) => onUpdate({ status: e.target.value })}
        >
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="task-actions">
        <button type="button" onClick={() => setEditing(true)}>
          Edit
        </button>
        <button type="button" onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  )
}

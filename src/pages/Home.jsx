import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { subscribeAllTasks } from '../lib/firestore'
import { STATUS } from '../lib/status'
import './Home.css'

export default function Home({ members }) {
  const [tasks, setTasks] = useState([])

  useEffect(() => subscribeAllTasks(setTasks), [])

  const countsFor = (memberId) => {
    const memberTasks = tasks.filter((t) => t.assigneeId === memberId)
    return {
      pending: memberTasks.filter((t) => t.status === STATUS.NOT_STARTED).length,
      assigned: memberTasks.filter((t) => t.status === STATUS.IN_PROGRESS).length,
      done: memberTasks.filter((t) => t.status === STATUS.DONE).length,
    }
  }

  return (
    <div className="home">
      <ul className="member-list">
        {members.map((member) => {
          const counts = countsFor(member.id)
          return (
            <li key={member.id} className="member-row">
              <Link to={`/member/${member.id}`} className="member-link">
                <span className="member-name">{member.name}</span>
                <span className="counts">
                  <span className="count-badge pending" title="Pending">
                    {counts.pending}
                  </span>
                  <span className="count-badge assigned" title="In progress">
                    {counts.assigned}
                  </span>
                  <span className="count-badge done" title="Done">
                    {counts.done}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
        {members.length === 0 && <li className="empty">No members yet.</li>}
      </ul>
    </div>
  )
}

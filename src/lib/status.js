export const STATUS = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
}

export const STATUS_ORDER = [STATUS.NOT_STARTED, STATUS.IN_PROGRESS, STATUS.DONE]

// Brand palette mapping — see CLAUDE.md "Status colors".
export const STATUS_COLOR = {
  [STATUS.NOT_STARTED]: '#1851f3',
  [STATUS.IN_PROGRESS]: '#ffad0f',
  [STATUS.DONE]: '#1fe148',
}

export const OVERDUE_COLOR = '#ff0f0f'

export function todayStr() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function isOverdue(task) {
  return task.status !== STATUS.DONE && task.dueDate < todayStr()
}

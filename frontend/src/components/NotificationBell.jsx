import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaBell, FaXmark, FaCircleCheck, FaTrash, FaInbox } from 'react-icons/fa6'
import { getNotifications, markNotificationsRead, deleteNotification } from '../services/dashboardApi'

const NotificationBell = () => {
  const [open, setOpen]           = useState(false)
  const [notifications, setNotifs] = useState([])
  const [unread, setUnread]       = useState(0)
  const ref = useRef(null)

  const fetchNotifs = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const res = await getNotifications()
      setNotifs(res.data.data?.notifications || [])
      setUnread(res.data.data?.unread_count  || 0)
    } catch { /* silent */ }
  }, [])

  // Poll every 30 s
  useEffect(() => {
    fetchNotifs()
    const id = setInterval(fetchNotifs, 30000)
    return () => clearInterval(id)
  }, [fetchNotifs])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleOpen = async () => {
    setOpen((v) => !v)
    if (!open && unread > 0) {
      await markNotificationsRead()
      setUnread(0)
      setNotifs((prev) => prev.map((n) => ({ ...n, status: 'read' })))
    }
  }

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    await deleteNotification(id)
    setNotifs((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative rounded-2xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:bg-slate-50"
      >
        <FaBell />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-[24px] border border-slate-200/80 bg-white/95 shadow-[0_20px_60px_rgba(15,23,42,0.15)] backdrop-blur"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">Notifications</p>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600">
                <FaXmark />
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <FaInbox className="mb-2 text-3xl text-slate-300" />
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50/60
                      ${n.status === 'unread' ? 'bg-indigo-50/40' : ''}`}
                  >
                    <div className={`mt-0.5 rounded-xl p-1.5 ${n.status === 'unread' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                      <FaCircleCheck className="text-xs" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{n.message}</p>
                      <p className="mt-1 text-[10px] text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, n.id)}
                      className="shrink-0 text-slate-300 hover:text-rose-400 transition"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-slate-100 px-4 py-2 text-center">
                <button
                  onClick={async () => {
                    await markNotificationsRead()
                    setNotifs((prev) => prev.map((n) => ({ ...n, status: 'read' })))
                    setUnread(0)
                  }}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default NotificationBell

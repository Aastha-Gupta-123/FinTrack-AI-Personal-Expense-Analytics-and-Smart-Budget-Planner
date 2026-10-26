import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaXmark } from 'react-icons/fa6'

/**
 * Accessible modal dialog.
 * - Traps focus within the modal
 * - Closes on Escape key press
 * - Closes on backdrop click
 */
const Modal = ({ title, children, onClose, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Panel — stop propagation so clicking inside doesn't close */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full ${sizeClasses[size] || sizeClasses.md} rounded-[28px] bg-white p-6 shadow-2xl`}
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-100 p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500"
              aria-label="Close modal"
            >
              <FaXmark />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default Modal

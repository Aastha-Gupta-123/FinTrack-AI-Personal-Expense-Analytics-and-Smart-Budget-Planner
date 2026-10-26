import { motion } from 'framer-motion'

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-slate-700 shadow-sm transition ${className}`}
    {...props}
  >
    {children}
  </motion.button>
)

export default function Buttons() {
  return null
}

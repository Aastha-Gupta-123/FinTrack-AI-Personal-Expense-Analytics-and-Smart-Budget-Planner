import { motion } from 'framer-motion'

export const ChartCard = ({ title, children, subtitle }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.01 }}
    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)]"
  >
    <div className="mb-4 flex items-center justify-between">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {subtitle ? <span className="text-sm text-slate-500">{subtitle}</span> : null}
    </div>
    <div className="rounded-2xl bg-slate-50 p-4">{children}</div>
  </motion.div>
)

export default function ChartCards() {
  return null
}

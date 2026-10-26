export const InputField = ({ label, type = 'text', placeholder, value, onChange }) => (
  <label className="block text-sm font-medium text-slate-700">
    <span className="mb-2 block">{label}</span>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white"
    />
  </label>
)

export const SelectField = ({ label, children }) => (
  <label className="block text-sm font-medium text-slate-700">
    <span className="mb-2 block">{label}</span>
    <select className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white">
      {children}
    </select>
  </label>
)

export default function Forms() {
  return null
}

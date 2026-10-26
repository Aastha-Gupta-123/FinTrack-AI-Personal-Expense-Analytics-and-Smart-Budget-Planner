const EmptyState = ({ title, description, action }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
    <p className="mt-2 text-sm text-slate-500">{description}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
)

export default EmptyState

export const DataTable = ({ headers, rows, emptyMessage = 'No records available.' }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 text-left text-sm font-semibold text-slate-600">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 bg-white">
        {rows.length > 0 ? (
          rows.map((row, index) => (
            <tr key={index} className="hover:bg-slate-50">
              {Object.values(row).map((value, valueIndex) => (
                <td key={valueIndex} className="px-4 py-3 text-sm text-slate-600">
                  {value}
                </td>
              ))}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={headers.length} className="px-4 py-6 text-center text-sm text-slate-500">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

export default function Tables() {
  return null
}

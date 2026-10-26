import { FaMagnifyingGlass } from 'react-icons/fa6'

export const SearchBar = ({ placeholder = 'Search...' }) => (
  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
    <FaMagnifyingGlass className="text-slate-400" />
    <input
      type="text"
      placeholder={placeholder}
      className="w-full bg-transparent text-sm outline-none"
    />
  </label>
)

export default SearchBar

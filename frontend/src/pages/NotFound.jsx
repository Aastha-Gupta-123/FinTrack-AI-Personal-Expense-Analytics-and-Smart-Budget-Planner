import { Link } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa6'
import { PrimaryButton } from '../components/Buttons'

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-2 py-10">
      <div className="w-full max-w-2xl rounded-[32px] border border-slate-200/80 bg-white/80 p-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">404</p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for may have moved or no longer exists.</p>
        <Link to="/" className="mt-6 inline-flex">
          <PrimaryButton className="flex items-center gap-2">
            <FaArrowLeft /> Back to Home
          </PrimaryButton>
        </Link>
      </div>
    </div>
  )
}

export default NotFound

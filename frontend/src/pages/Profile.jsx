import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FaCircleUser, FaPenToSquare, FaCamera, FaTrash,
  FaShieldHalved, FaWallet, FaArrowTrendUp, FaPiggyBank,
  FaTriangleExclamation, FaCircleCheck, FaXmark, FaEye, FaEyeSlash,
} from 'react-icons/fa6'
import { motion as m } from 'framer-motion'
import Loader from '../components/Loader'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import { useAuth } from '../context/AuthContext'
import {
  getProfile, updateProfile,
  uploadProfilePicture, deleteProfilePicture, changePassword,
} from '../services/dashboardApi'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '')

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
    className={`fixed right-6 top-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-medium text-white shadow-xl
      ${type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}
  >
    {type === 'error' ? <FaTriangleExclamation /> : <FaCircleCheck />}
    {message}
    <button onClick={onClose}><FaXmark /></button>
  </motion.div>
)

// ─── Password field ───────────────────────────────────────────────────────────
const PwField = ({ label, name, value, onChange }) => {
  const [show, setShow] = useState(false)
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          {show ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
    </div>
  )
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
      className="w-full max-w-md rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-2xl"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaXmark /></button>
      </div>
      {children}
    </motion.div>
  </motion.div>
)

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon: Icon, accent }) => (
  <motion.div whileHover={{ y: -4 }}
    className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur"
  >
    <div className={`mb-3 inline-flex rounded-2xl bg-gradient-to-br ${accent} p-3 text-white`}>
      <Icon className="text-lg" />
    </div>
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="mt-1 text-2xl font-semibold text-slate-900">{value}</h3>
  </motion.div>
)

// ─── Main Page ────────────────────────────────────────────────────────────────
const Profile = () => {
  const { updateUserName } = useAuth()
  const fileRef   = useRef(null)
  const [user, setUser]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [toast, setToast]       = useState(null)
  const [showEdit, setShowEdit] = useState(false)
  const [showPw, setShowPw]     = useState(false)
  const [saving, setSaving]     = useState(false)

  const [editForm, setEditForm] = useState({ full_name: '', email: '', phone: '' })
  const [pwForm, setPwForm]     = useState({ current_password: '', new_password: '', confirm_password: '' })

  const notify = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProfile = useCallback(async () => {
    try {
      const res = await getProfile()
      const u = res.data.data.user
      setUser(u)
      setEditForm({ full_name: u.full_name, email: u.email, phone: u.phone })
      updateUserName(u.full_name)
    } catch {
      notify('Failed to load profile', 'error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // ── Edit profile ────────────────────────────────────────────────────────────
  const handleEditSubmit = async () => {
    setSaving(true)
    try {
      const res = await updateProfile(editForm)
      setUser(res.data.data.user)
      updateUserName(res.data.data.user.full_name)
      setShowEdit(false)
      notify('Profile updated successfully')
    } catch (err) {
      notify(err?.response?.data?.message || 'Update failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Change password ─────────────────────────────────────────────────────────
  const handlePwSubmit = async () => {
    setSaving(true)
    try {
      await changePassword(pwForm)
      setShowPw(false)
      setPwForm({ current_password: '', new_password: '', confirm_password: '' })
      notify('Password changed successfully')
    } catch (err) {
      notify(err?.response?.data?.message || 'Password change failed', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── Avatar upload ───────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('profile_image', file)
    try {
      const res = await uploadProfilePicture(fd)
      setUser(res.data.data.user)
      notify('Profile picture updated')
    } catch (err) {
      notify(err?.response?.data?.message || 'Upload failed', 'error')
    }
  }

  const handleDeleteAvatar = async () => {
    try {
      const res = await deleteProfilePicture()
      setUser(res.data.data.user)
      notify('Profile picture removed')
    } catch {
      notify('Failed to remove picture', 'error')
    }
  }

  if (loading) return <Loader />

  const avatarUrl = user?.profile_image
    ? `${API_BASE}/uploads/${user.profile_image}`
    : null

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en', { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* ── Header card ──────────────────────────────────────────────────────── */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          {/* Avatar + name */}
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar"
                  className="h-20 w-20 rounded-[20px] object-cover ring-4 ring-indigo-100" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-indigo-600 to-cyan-500 text-4xl text-white">
                  <FaCircleUser />
                </div>
              )}
              {/* Camera overlay */}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 rounded-xl bg-indigo-600 p-1.5 text-white shadow-lg transition hover:bg-indigo-700"
              >
                <FaCamera className="text-xs" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-sm font-medium text-indigo-600">Profile</p>
              <h2 className="text-2xl font-semibold text-slate-900">{user?.full_name}</h2>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <p className="mt-1 text-xs text-slate-400">Member since {joinedDate}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            {user?.profile_image && (
              <SecondaryButton onClick={handleDeleteAvatar} className="flex items-center gap-2 text-sm text-rose-500">
                <FaTrash /> Remove Photo
              </SecondaryButton>
            )}
            <SecondaryButton onClick={() => setShowPw(true)} className="flex items-center gap-2 text-sm">
              <FaShieldHalved /> Change Password
            </SecondaryButton>
            <PrimaryButton onClick={() => setShowEdit(true)} className="flex items-center gap-2 text-sm">
              <FaPenToSquare /> Edit Profile
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* ── Financial summary ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Income"   value={`$${(user?.total_income   ?? 0).toFixed(2)}`} icon={FaWallet}       accent="from-indigo-500 to-violet-500" />
        <StatCard title="Total Expenses" value={`$${(user?.total_expenses ?? 0).toFixed(2)}`} icon={FaArrowTrendUp} accent="from-amber-500 to-orange-500" />
        <StatCard title="Total Savings"  value={`$${(user?.total_savings  ?? 0).toFixed(2)}`} icon={FaPiggyBank}    accent="from-emerald-500 to-green-500" />
      </div>

      {/* ── Personal information ──────────────────────────────────────────────── */}
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Personal Information</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            { label: 'Full Name',     value: user?.full_name },
            { label: 'Email Address', value: user?.email },
            { label: 'Phone Number',  value: user?.phone },
            { label: 'Member Since',  value: joinedDate },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase">{label}</p>
              <p className="mt-1 font-semibold text-slate-900">{value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Edit Profile Modal ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEdit && (
          <Modal title="Edit Profile" onClose={() => setShowEdit(false)}>
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text' },
                { label: 'Email',     key: 'email',     type: 'email' },
                { label: 'Phone',     key: 'phone',     type: 'tel' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
                  <input
                    type={type}
                    value={editForm[key]}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <PrimaryButton onClick={handleEditSubmit} disabled={saving} className="flex-1">
                  {saving ? 'Saving…' : 'Save Changes'}
                </PrimaryButton>
                <SecondaryButton onClick={() => setShowEdit(false)} className="flex-1">Cancel</SecondaryButton>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ── Change Password Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showPw && (
          <Modal title="Change Password" onClose={() => setShowPw(false)}>
            <div className="space-y-4">
              <PwField label="Current Password"  name="current_password"  value={pwForm.current_password}  onChange={(e) => setPwForm((f) => ({ ...f, current_password:  e.target.value }))} />
              <PwField label="New Password"       name="new_password"      value={pwForm.new_password}      onChange={(e) => setPwForm((f) => ({ ...f, new_password:      e.target.value }))} />
              <PwField label="Confirm Password"   name="confirm_password"  value={pwForm.confirm_password}  onChange={(e) => setPwForm((f) => ({ ...f, confirm_password:  e.target.value }))} />
              <p className="text-xs text-slate-400">Password must be at least 8 characters.</p>
              <div className="flex gap-3 pt-2">
                <PrimaryButton onClick={handlePwSubmit} disabled={saving} className="flex-1">
                  {saving ? 'Updating…' : 'Update Password'}
                </PrimaryButton>
                <SecondaryButton onClick={() => setShowPw(false)} className="flex-1">Cancel</SecondaryButton>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Profile

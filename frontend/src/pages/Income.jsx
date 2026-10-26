import { useEffect, useState, useCallback } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { FaMagnifyingGlass, FaPenToSquare, FaPlus, FaTrash } from 'react-icons/fa6'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import Loader from '../components/Loader'
import Modal from '../components/Modal'
import { createIncome, deleteIncome, getIncomes, updateIncome } from '../services/dashboardApi'

const sources = ['Salary', 'Freelancing', 'Business', 'Investments', 'Rental Income', 'Bonus', 'Scholarship', 'Gift', 'Other']

const Income = () => {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage] = useState(8)
  const [form, setForm] = useState({ title: '', description: '', amount: '', source: '', income_date: '' })
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchIncomes = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getIncomes({ page, per_page: perPage, search, source, date, sort: 'date_desc' })
      setIncomes(response.data.data.incomes || [])
      setTotal(response.data.data.total || 0)
    } catch {
      toast.error('Unable to load income records')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, source, date])

  useEffect(() => {
    fetchIncomes()
  }, [fetchIncomes])

  const openCreate = () => {
    setEditingId(null)
    setForm({ title: '', description: '', amount: '', source: '', income_date: '' })
    setShowModal(true)
  }

  const openEdit = (income) => {
    setEditingId(income.id)
    setForm({ title: income.title, description: income.description || '', amount: income.amount, source: income.source || '', income_date: income.income_date || '' })
    setShowModal(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await updateIncome(editingId, form)
        toast.success('Income updated')
      } else {
        await createIncome(form)
        toast.success('Income added')
      }
      setShowModal(false)
      await fetchIncomes()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (id) => {
    setPendingDeleteId(id)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    try {
      await deleteIncome(pendingDeleteId)
      toast.success('Income deleted')
      setShowDeleteModal(false)
      await fetchIncomes()
    } catch (error) {
      toast.error('Unable to delete income')
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Income</p>
            <h2 className="text-2xl font-semibold text-slate-900">Monitor every income stream</h2>
          </div>
          <PrimaryButton onClick={openCreate} className="flex items-center gap-2"><FaPlus /> Add Income</PrimaryButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaMagnifyingGlass className="text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search income" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={source} onChange={(e) => { setSource(e.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <option value="">All sources</option>
          {sources.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600" />
      </div>

      {loading ? <Loader /> : (
        <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Source</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {incomes.length > 0 ? incomes.map((income) => (
                <tr key={income.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{income.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{income.source}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">${income.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{income.income_date}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(income)} className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><FaPenToSquare /></button>
                      <button onClick={() => confirmDelete(income.id)} className="rounded-xl bg-rose-50 p-2 text-rose-600"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">No income records found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {incomes.length} of {total} records</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} className="rounded-2xl border px-3 py-2 text-sm disabled:opacity-50">Previous</button>
          <button disabled={page >= pageCount} onClick={() => setPage((prev) => prev + 1)} className="rounded-2xl border px-3 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Income' : 'Add Income'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
              <label className="block text-sm font-medium text-slate-700">Amount<input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" rows="3" /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Source<select required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2"><option value="">Select</option>{sources.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              <label className="block text-sm font-medium text-slate-700">Income Date<input required type="date" value={form.income_date} onChange={(e) => setForm({ ...form, income_date: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Update Income' : 'Add Income'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete Income" onClose={() => setShowDeleteModal(false)}>
          <p className="text-sm text-slate-600">Are you sure you want to delete this income entry?</p>
          <div className="mt-4 flex justify-end gap-3">
            <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleDelete}>Delete</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Income

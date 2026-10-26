import { useEffect, useState, useCallback } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'
import { FaPlus, FaPenToSquare, FaTrash, FaMagnifyingGlass } from 'react-icons/fa6'
import { PrimaryButton, SecondaryButton } from '../components/Buttons'
import Modal from '../components/Modal'
import Loader from '../components/Loader'
import { DataTable } from '../components/Tables'
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../services/dashboardApi'

const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Healthcare', 'Education', 'Bills', 'Travel', 'Investment', 'Others']
const paymentMethods = ['Cash', 'Card', 'Bank Transfer', 'UPI']

const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [date, setDate] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [perPage] = useState(8)
  const [form, setForm] = useState({ title: '', description: '', amount: '', category_name: '', payment_method: 'Cash', expense_date: '' })
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getExpenses({ page, per_page: perPage, search, category, date, sort: 'date_desc' })
      setExpenses(response.data.data.expenses || [])
      setTotal(response.data.data.total || 0)
    } catch {
      toast.error('Unable to load expenses')
    } finally {
      setLoading(false)
    }
  }, [page, perPage, search, category, date])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const openCreateModal = () => {
    setEditingId(null)
    setForm({ title: '', description: '', amount: '', category_name: '', payment_method: 'Cash', expense_date: '' })
    setShowModal(true)
  }

  const openEditModal = (expense) => {
    setEditingId(expense.id)
    setForm({ title: expense.title, description: expense.description || '', amount: expense.amount, category_name: expense.category_name || '', payment_method: expense.payment_method || 'Cash', expense_date: expense.expense_date || '' })
    setShowModal(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    try {
      if (editingId) {
        await updateExpense(editingId, form)
        toast.success('Expense updated')
      } else {
        await createExpense(form)
        toast.success('Expense added')
      }
      setShowModal(false)
      await fetchExpenses()
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
      await deleteExpense(pendingDeleteId)
      toast.success('Expense deleted')
      setShowDeleteModal(false)
      await fetchExpenses()
    } catch (error) {
      toast.error('Unable to delete expense')
    }
  }

  const pageCount = Math.max(1, Math.ceil(total / perPage))

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      <div className="rounded-[32px] border border-slate-200/80 bg-white/80 p-6 shadow-[0_10px_40px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-indigo-600">Expenses</p>
            <h2 className="text-2xl font-semibold text-slate-900">Track every expense with clarity</h2>
          </div>
          <PrimaryButton onClick={openCreateModal} className="flex items-center gap-2"><FaPlus /> Add Expense</PrimaryButton>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <label className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <FaMagnifyingGlass className="text-slate-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search expenses" className="w-full bg-transparent text-sm outline-none" />
        </label>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          <option value="">All categories</option>
          {categories.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
        <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setPage(1) }} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600" />
      </div>

      {loading ? <Loader /> : (
        <div className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.06)]">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {expenses.length > 0 ? expenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700">{expense.title}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{expense.category_name}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">${expense.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">{expense.expense_date}</td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(expense)} className="rounded-xl bg-indigo-50 p-2 text-indigo-600"><FaPenToSquare /></button>
                      <button onClick={() => confirmDelete(expense.id)} className="rounded-xl bg-rose-50 p-2 text-rose-600"><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan="5" className="px-4 py-6 text-center text-sm text-slate-500">No expenses found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">Showing {expenses.length} of {total} expenses</p>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((prev) => prev - 1)} className="rounded-2xl border px-3 py-2 text-sm disabled:opacity-50">Previous</button>
          <button disabled={page >= pageCount} onClick={() => setPage((prev) => prev + 1)} className="rounded-2xl border px-3 py-2 text-sm disabled:opacity-50">Next</button>
        </div>
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Expense' : 'Add Expense'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
              <label className="block text-sm font-medium text-slate-700">Amount<input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" rows="3" /></label>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">Category<select required value={form.category_name} onChange={(e) => setForm({ ...form, category_name: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2"><option value="">Select</option>{categories.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
              <label className="block text-sm font-medium text-slate-700">Payment Method<select value={form.payment_method} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2">{paymentMethods.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
            </div>
            <label className="block text-sm font-medium text-slate-700">Expense Date<input required type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="mt-2 w-full rounded-2xl border px-3 py-2" /></label>
            <div className="flex justify-end gap-3 pt-2">
              <SecondaryButton type="button" onClick={() => setShowModal(false)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={submitting}>{submitting ? 'Saving...' : editingId ? 'Update Expense' : 'Add Expense'}</PrimaryButton>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal title="Delete Expense" onClose={() => setShowDeleteModal(false)}>
          <p className="text-sm text-slate-600">Are you sure you want to delete this expense?</p>
          <div className="mt-4 flex justify-end gap-3">
            <SecondaryButton onClick={() => setShowDeleteModal(false)}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleDelete}>Delete</PrimaryButton>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default Expenses

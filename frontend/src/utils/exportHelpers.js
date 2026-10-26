import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

/**
 * Export report data as a PDF file.
 * @param {object} report  - report data object from API
 * @param {string} title   - document title
 */
export function exportPDF(report, title = 'FinTrack AI Report') {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(18)
  doc.setTextColor(79, 70, 229)
  doc.text('FinTrack AI', 14, 18)
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text(title, 14, 26)
  doc.text(`Period: ${report.period || 'N/A'}`, 14, 33)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40)

  // Summary table
  autoTable(doc, {
    startY: 48,
    head: [['Metric', 'Value']],
    body: [
      ['Total Income',    `$${(report.total_income   ?? 0).toFixed(2)}`],
      ['Total Expenses',  `$${(report.total_expenses ?? 0).toFixed(2)}`],
      ['Total Savings',   `$${(report.total_savings  ?? 0).toFixed(2)}`],
      ['Savings %',       `${(report.savings_percentage ?? 0).toFixed(1)}%`],
      ['Transactions',    String(report.transaction_count ?? 0)],
      ...(report.remaining_budget != null
        ? [['Remaining Budget', `$${report.remaining_budget.toFixed(2)}`]]
        : []),
      ...(report.budget_utilization != null
        ? [['Budget Utilization', `${report.budget_utilization.toFixed(1)}%`]]
        : []),
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [79, 70, 229] },
  })

  // Transactions table
  if (report.transactions?.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [['Date', 'Title', 'Type', 'Category', 'Amount']],
      body: report.transactions.map((t) => [
        t.date, t.title, t.type, t.category, `$${t.amount.toFixed(2)}`,
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] },
    })
  }

  doc.save(`${title.replace(/\s+/g, '_')}.pdf`)
}

/**
 * Export report transactions as a CSV file.
 * @param {object} report - report data object from API
 * @param {string} filename - output filename without extension
 */
export function exportCSV(report, filename = 'fintrack_report') {
  const rows = [
    ['FinTrack AI Report'],
    [`Period: ${report.period || 'N/A'}`],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['Summary'],
    ['Total Income',   `$${(report.total_income   ?? 0).toFixed(2)}`],
    ['Total Expenses', `$${(report.total_expenses ?? 0).toFixed(2)}`],
    ['Total Savings',  `$${(report.total_savings  ?? 0).toFixed(2)}`],
    ['Savings %',      `${(report.savings_percentage ?? 0).toFixed(1)}%`],
    ['Transactions',   String(report.transaction_count ?? 0)],
    [],
    ['Transactions'],
    ['Date', 'Title', 'Type', 'Category', 'Amount'],
    ...(report.transactions || []).map((t) => [
      t.date, t.title, t.type, t.category, t.amount.toFixed(2),
    ]),
  ]

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

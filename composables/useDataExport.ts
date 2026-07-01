export const useDataExport = () => {
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = (data: Record<string, unknown>[], filename = 'export.csv') => {
    if (!data.length) return
    const headers = Object.keys(data[0])
    const escape = (v: unknown) => {
      const s = v == null ? '' : String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    }
    const rows = [
      headers.join(','),
      ...data.map(row => headers.map(h => escape(row[h])).join(',')),
    ]
    downloadBlob(new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' }), filename)
  }

  const exportJSON = (data: unknown, filename = 'export.json') => {
    const json = JSON.stringify(data, null, 2)
    downloadBlob(new Blob([json], { type: 'application/json' }), filename)
  }

  return { exportCSV, exportJSON }
}

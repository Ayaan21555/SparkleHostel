import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle, Loader2 } from 'lucide-react'
import { useUploadStudents, generateStudentCSVTemplate } from '@/hooks/useUsers'
import { toast } from 'react-hot-toast'

export function WardenPortal() {
  const [uploading, setUploading] = useState(false)
  const uploadStudents = useUploadStudents()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      try {
        // Parse CSV rows
        const lines = content.trim().split('\n').filter(Boolean)
        const header = lines[0].toLowerCase().split(',').map(h => h.trim())
        const nameIdx = header.indexOf('name')
        const emailIdx = header.indexOf('email')
        const roomIdx = header.indexOf('room_number')
        const semIdx = header.indexOf('semester')

        if (nameIdx === -1 || emailIdx === -1) {
          throw new Error('CSV must have "name" and "email" columns')
        }

        const students = lines.slice(1).map(line => {
          const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
          return {
            name: cols[nameIdx] || '',
            email: cols[emailIdx] || '',
            room_number: roomIdx >= 0 ? cols[roomIdx] : '',
            semester: semIdx >= 0 ? cols[semIdx] : undefined,
          }
        }).filter(s => s.name && s.email)

        if (students.length === 0) throw new Error('No valid student records found')

        // Convert back to CSV string for the edge function
        const csvString = [
          'name,email,room_number,semester',
          ...students.map(s => `${s.name},${s.email},${s.room_number || ''},${s.semester || ''}`)
        ].join('\n')

        await uploadStudents.mutateAsync(csvString)
        toast.success(`Successfully uploaded ${students.length} students!`)
      } catch (error: any) {
        toast.error(error.message || 'Upload failed')
      } finally {
        setUploading(false)
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const csv = generateStudentCSVTemplate()
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'students_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <section className="space-y-6">
        <h3 className="text-2xl font-serif font-bold italic flex items-center gap-3">
          <Upload className="w-6 h-6 text-primary" />
          Admin: Data Management
        </h3>
        <div className="glass rounded-3xl p-10 border border-border/40 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="p-6 rounded-full bg-primary/10 text-primary">
            <FileText className="w-12 h-12" />
          </div>
          <div>
            <h4 className="text-xl font-bold mb-2">Upload Student Database</h4>
            <p className="text-muted-foreground max-w-md mx-auto">
              Bulk add or update students by uploading a CSV file. Required columns: <code className="bg-muted px-1 rounded text-xs">name, email, room_number</code>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={downloadTemplate}
              className="px-6 py-3 rounded-full border border-border/40 text-sm font-medium hover:bg-muted/50 transition-all flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Download Template
            </button>
            <label className="relative cursor-pointer">
              <input
                type="file"
                className="hidden"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <div className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                {uploading ? 'Processing...' : 'Upload CSV'}
              </div>
            </label>
          </div>

          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Auto-Sync</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Secure</span>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Supabase</span>
          </div>
        </div>
      </section>
    </div>
  )
}

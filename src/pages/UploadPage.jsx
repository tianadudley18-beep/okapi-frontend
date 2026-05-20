import { useNavigate } from 'react-router-dom'
import { FileSpreadsheet, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import FileUpload from '../components/shared/FileUpload'

export default function UploadPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSuccess = () => {
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-gray-900 dark:text-slate-100">{t('upload.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">{t('upload.subtitle')}</p>
      </div>

      <div className="card">
        <FileUpload onUploadSuccess={handleSuccess} />
      </div>

      <div className="bg-electric-500/8 border border-electric-500/20 rounded-xl p-5 dark:bg-electric-500/10 dark:border-electric-500/20">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-electric-500 dark:text-electric-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 text-sm text-electric-700 dark:text-electric-300">
            <p className="font-semibold">{t('upload.tipsTitle')}</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t('upload.tip1')}</li>
              <li>{t('upload.tip2')}</li>
              <li>{t('upload.tip3')}</li>
              <li>{t('upload.tip4')}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-start gap-3">
          <FileSpreadsheet className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-600 dark:text-slate-400">
            <p className="font-medium text-gray-800 dark:text-slate-300 mb-1">{t('upload.exampleTitle')}</p>
            <div className="bg-gray-50 dark:bg-navy-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
              <p className="text-gray-500">Date, Product, Category, Revenue, Units</p>
              <p>2024-01-15, Widget A, Electronics, 1250.00, 5</p>
              <p>2024-01-20, Widget B, Home, 845.50, 3</p>
              <p>2024-02-03, Widget A, Electronics, 2100.00, 8</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getUserFiles } from '../services/api'
import ChatInterface from '../components/chat/ChatInterface'

export default function ChatPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [files, setFiles] = useState([])
  const [activeFile, setActiveFile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUserFiles()
      .then(({ data }) => {
        const fileList = data.files || []
        setFiles(fileList)
        if (fileList.length > 0) setActiveFile(fileList[0])
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!activeFile) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center py-16 space-y-5">
          <div className="bg-gray-100 rounded-full p-5 inline-flex">
            <FileText className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t('chat.noFile')}</h2>
            <p className="text-gray-500 mt-2">{t('chat.noFileDesc')}</p>
          </div>
          <button onClick={() => navigate('/upload')} className="btn-primary mx-auto">
            {t('chat.uploadFile')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('chat.title')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{t('chat.subtitle')}</p>
        </div>
        {files.length > 1 && (
          <select
            value={activeFile?.id}
            onChange={(e) => {
              const f = files.find((f) => f.id === e.target.value)
              if (f) setActiveFile(f)
            }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {files.map((f) => (
              <option key={f.id} value={f.id}>{f.original_name}</option>
            ))}
          </select>
        )}
      </div>

      <ChatInterface fileId={activeFile?.id} />
    </div>
  )
}

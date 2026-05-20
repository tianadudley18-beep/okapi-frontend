import { useState, useRef } from 'react'
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Tag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { uploadFile } from '../../services/api'

const ACCEPTED = '.xlsx,.csv'
const MAX_MB = 10

// Maps backend error codes to i18n keys
const ERROR_CODE_MAP = {
  encrypted_file: 'errors.encrypted',
  corrupt_file: 'errors.corrupt',
  empty_file: 'errors.empty',
  too_few_columns: 'errors.minColumns',
  wrong_file_type: 'errors.wrongType',
  file_too_large: 'errors.tooLarge',
  parse_error: 'errors.corrupt',
  server_error: 'errors.generic',
}

export default function FileUpload({ onUploadSuccess }) {
  const { t } = useTranslation()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [uploadResult, setUploadResult] = useState(null)
  const inputRef = useRef()

  const validate = (f) => {
    if (!f.name.match(/\.(xlsx|csv)$/i)) return t('errors.wrongType')
    if (f.size > MAX_MB * 1024 * 1024) return t('errors.tooLarge', { max: MAX_MB })
    return null
  }

  const handleFile = (f) => {
    const err = validate(f)
    if (err) { setErrorMsg(err); setStatus('error'); return }
    setFile(f)
    setStatus('idle')
    setErrorMsg('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    setUploadResult(null)
    try {
      const { data } = await uploadFile(file, setProgress)
      setStatus('success')
      setUploadResult(data)
      onUploadSuccess?.(data)
    } catch (err) {
      const code = err.response?.data?.code
      const i18nKey = ERROR_CODE_MAP[code]
      const msg = i18nKey
        ? t(i18nKey, { max: MAX_MB })
        : (err.response?.data?.message || t('upload.uploadFailed'))
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  const reset = () => {
    setFile(null)
    setStatus('idle')
    setProgress(0)
    setErrorMsg('')
    setUploadResult(null)
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
          dragging
            ? 'border-primary-400 bg-primary-50'
            : file
            ? 'border-green-300 bg-green-50 cursor-default'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
        />

        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-green-100 rounded-full p-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{file.name}</p>
              <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); reset() }}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3 h-3" /> {t('upload.remove')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="bg-gray-100 rounded-full p-4">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-700">
                {t('upload.dropHere')}{' '}
                <span className="text-primary-600">{t('upload.browse')}</span>
              </p>
              <p className="text-sm text-gray-400 mt-1">{t('upload.supports', { max: MAX_MB })}</p>
            </div>
          </div>
        )}
      </div>

      {status === 'uploading' && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{t('upload.uploading')}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm space-y-1.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {t('upload.successMsg')}
          </div>
          {uploadResult?.dataLabel && (
            <div className="flex items-center gap-1.5 text-green-600 text-xs pl-6">
              <Tag className="w-3 h-3" />
              {t('dataTypes.' + (uploadResult.dataType || 'generic'), { defaultValue: uploadResult.dataLabel })}
              {uploadResult.rowCount != null && ` · ${uploadResult.rowCount.toLocaleString()} rows`}
            </div>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {file && status !== 'uploading' && status !== 'success' && (
        <button onClick={handleUpload} className="btn-primary w-full flex items-center justify-center gap-2">
          <Upload className="w-4 h-4" />
          {t('upload.uploadBtn')}
        </button>
      )}
    </div>
  )
}

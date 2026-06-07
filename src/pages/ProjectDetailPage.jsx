import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Trash2, Send, User, FileSpreadsheet,
  BarChart3, AlertTriangle, Edit2, Check, X,
  RefreshCw, Link2, Unlink, Upload, ChevronRight, Loader,
  Bot, ChevronDown, Info, AlertCircle, CheckCircle, Zap,
  Target, BookOpen, Download, HelpCircle, Lock,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Layer1WhatHappened from '../components/analysis/Layer1WhatHappened'
import Layer2WhyItHappened from '../components/analysis/Layer2WhyItHappened'
import Layer3WhatToDo from '../components/analysis/Layer3WhatToDo'
import OkapiScore from '../components/analysis/OkapiScore'
import DataQualityPanel from '../components/analysis/DataQualityPanel'
import WhatToMeasure from '../components/analysis/WhatToMeasure'
import { ChartErrorBoundary } from '../components/shared/ErrorBoundary'
import OkapiLogo from '../components/shared/OkapiLogo'
import ProfitLossDetector from '../components/analysis/ProfitLossDetector'
import GrowthPlan from '../components/analysis/GrowthPlan'
import FutureProjections from '../components/analysis/FutureProjections'
import NoDataWizard from '../components/NoDataWizard'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#22c55e', '#f97316']

const QUICK_CHIPS_INITIAL = [
  'Cuéntame más sobre el punto 1',
  '¿Cómo aprovecho la oportunidad?',
  '¿Qué hago con la tendencia?',
  'Dame mi plan de acción',
  'Ver todas las alertas',
]

const QUICK_CHIPS_FOLLOWUP = [
  '¿Cómo crecer?',
  '¿Gano o pierdo?',
  '¿Cuál es mi mayor riesgo?',
  '¿Qué hago esta semana?',
  'Compará períodos',
]

function fmt(n) {
  if (n == null) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
}

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateShort(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
}

// ── Analysis Tab ──────────────────────────────────────────────────────────────
function AnalysisTab({ files, industry }) {
  const combined = useMemo(() => {
    const kpis = files.map(pf => pf.user_files?.kpi_data).filter(Boolean)
    if (!kpis.length) return null

    const totalRevenue = kpis.reduce((s, k) => s + (k.summary?.totalRevenue || 0), 0)
    const totalRows = files.reduce((s, pf) => s + (pf.user_files?.row_count || 0), 0)

    const periodMap = {}
    kpis.forEach(k => {
      ;(k.monthlySales || []).forEach(({ month, revenue }) => {
        periodMap[month] = (periodMap[month] || 0) + revenue
      })
    })
    const monthlySales = Object.entries(periodMap)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => {
        const da = new Date(a.month), db = new Date(b.month)
        if (!isNaN(da) && !isNaN(db)) return da - db
        return a.month.localeCompare(b.month)
      })

    const catMap = {}
    kpis.forEach(k => {
      ;(k.topProducts || []).forEach(({ name, revenue }) => {
        catMap[name] = (catMap[name] || 0) + revenue
      })
    })
    const topProducts = Object.entries(catMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    const avgTrend = kpis.reduce((s, k) => s + (k.summary?.revenueTrend || 0), 0) / kpis.length

    const summary = {
      totalRevenue,
      monthlyAverage: monthlySales.length ? totalRevenue / monthlySales.length : 0,
      revenueTrend: avgTrend,
      bestMonth: monthlySales.reduce((best, m) => (!best || m.revenue > best.revenue ? m : best), null),
      worstMonth: monthlySales.reduce((worst, m) => (!worst || m.revenue < worst.revenue ? m : worst), null),
    }

    // Pick the deepest available AI analysis
    const analysis = kpis.find(k => k.analysis)?.analysis || null
    const meta = { dataType: kpis[0]?.meta?.dataType, dataLabel: kpis[0]?.meta?.dataLabel, validRows: totalRows }
    const topLabel = kpis[0]?.topLabel || 'Categorías'

    return { summary, monthlySales, topProducts, analysis, meta, topLabel, fileCount: files.length, totalRows }
  }, [files])

  if (!combined) {
    return (
      <div className="text-center py-20">
        <BarChart3 className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-slate-400 text-sm">Sube archivos para ver el análisis combinado</p>
      </div>
    )
  }

  const analysisLoading = !combined.analysis

  return (
    <div className="space-y-6">
      {/* Feature 3: Profit/Loss Detector — verdict card first */}
      <ChartErrorBoundary>
        <ProfitLossDetector
          kpis={combined.summary}
          monthlySales={combined.monthlySales}
        />
      </ChartErrorBoundary>

      {/* Okapi Score */}
      <OkapiScore
        kpis={combined.summary}
        topProducts={combined.topProducts}
        monthlySales={combined.monthlySales}
      />

      {/* What to Measure */}
      <WhatToMeasure files={files} industry={industry} />

      {/* Section 1 — ¿Qué pasó? */}
      <div className="flex items-center gap-4 rounded-xl border px-5 py-4 border-primary-200 dark:border-primary-800/40 bg-primary-50 dark:bg-primary-900/15">
        <div className="text-2xl font-black text-primary-600 dark:text-primary-400 w-8 text-center">01</div>
        <div className="w-px h-8 bg-current opacity-20" />
        <div>
          <h2 className="text-lg font-black text-primary-600 dark:text-primary-400 tracking-tight">¿Qué pasó?</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Métricas, tendencias y resumen ejecutivo</p>
        </div>
      </div>
      <ChartErrorBoundary>
        <Layer1WhatHappened
          kpis={combined.summary}
          analysis={combined.analysis}
          monthlySales={combined.monthlySales}
          topProducts={combined.topProducts}
          topLabel={combined.topLabel}
          meta={combined.meta}
        />
      </ChartErrorBoundary>

      {/* Section 2 — ¿Por qué pasó? */}
      <div className="flex items-center gap-4 rounded-xl border px-5 py-4 border-purple-200 dark:border-purple-800/40 bg-purple-50 dark:bg-purple-900/15">
        <div className="text-2xl font-black text-purple-600 dark:text-purple-400 w-8 text-center">02</div>
        <div className="w-px h-8 bg-current opacity-20" />
        <div>
          <h2 className="text-lg font-black text-purple-600 dark:text-purple-400 tracking-tight">¿Por qué pasó?</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Causas raíz, patrones y riesgos de concentración</p>
        </div>
      </div>
      {analysisLoading ? (
        <div className="card border border-dashed border-electric-500/30 bg-electric-500/5 dark:bg-electric-500/10">
          <div className="flex items-center gap-3 py-4">
            <div className="bg-electric-500/20 rounded-full p-2">
              <Loader className="w-5 h-5 text-electric-500 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Generando análisis profundo con IA…</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Esto puede tomar hasta 30 segundos la primera vez</p>
            </div>
          </div>
        </div>
      ) : (
        <ChartErrorBoundary>
          <Layer2WhyItHappened analysis={combined.analysis} />
        </ChartErrorBoundary>
      )}

      {/* Section 3 — ¿Qué hacer? */}
      <div className="flex items-center gap-4 rounded-xl border px-5 py-4 border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-900/15">
        <div className="text-2xl font-black text-green-600 dark:text-green-400 w-8 text-center">03</div>
        <div className="w-px h-8 bg-current opacity-20" />
        <div>
          <h2 className="text-lg font-black text-green-600 dark:text-green-400 tracking-tight">¿Qué hacer?</h2>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Acciones urgentes, oportunidades y proyecciones</p>
        </div>
      </div>
      {analysisLoading ? (
        <div className="card border border-dashed border-electric-500/30 bg-electric-500/5 dark:bg-electric-500/10">
          <div className="flex items-center gap-3 py-4">
            <div className="bg-electric-500/20 rounded-full p-2">
              <Loader className="w-5 h-5 text-electric-500 animate-spin" />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-200">Generando recomendaciones…</p>
          </div>
        </div>
      ) : (
        <ChartErrorBoundary>
          <Layer3WhatToDo analysis={combined.analysis} monthlySales={combined.monthlySales} meta={combined.meta} />
        </ChartErrorBoundary>
      )}

      {/* Feature 2: Growth Plan */}
      <ChartErrorBoundary>
        <GrowthPlan
          kpis={combined.summary}
          monthlySales={combined.monthlySales}
          topProducts={combined.topProducts}
          analysis={combined.analysis}
        />
      </ChartErrorBoundary>

      {/* Feature 4: Future Projections */}
      <ChartErrorBoundary>
        <FutureProjections
          monthlySales={combined.monthlySales}
          kpis={combined.summary}
        />
      </ChartErrorBoundary>
    </div>
  )
}

// ── Paywall overlay ───────────────────────────────────────────────────────────
function PaywallOverlay({ active, children }) {
  if (!active) return <>{children}</>
  return (
    <div className="relative">
      <div className="pointer-events-none select-none" style={{ filter: 'blur(7px)', opacity: 0.45, maxHeight: 480, overflow: 'hidden' }}>
        {children}
      </div>
      <div className="absolute inset-0 flex items-start justify-center pt-20 z-10">
        <div className="mx-4 p-8 rounded-2xl border border-electric-500/30 bg-white dark:bg-navy-900 shadow-glass text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-electric-500/10 border border-electric-500/20 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-electric-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">Desbloqueá tu análisis completo</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-5">
            Subiste tus datos. Ahora activá tu plan para ver KPIs, tendencias y recomendaciones.
          </p>
          <a
            href="/subscription"
            className="inline-flex items-center gap-2 bg-electric-500 hover:bg-electric-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
          >
            Ver planes →
          </a>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { session } = useAuth()
  const bottomRef = useRef(null)
  const chatInputRef = useRef(null)
  const fileInputRef = useRef(null)

  const [project, setProject] = useState(null)
  const [files, setFiles] = useState([])
  const [sheets, setSheets] = useState([])
  const [messages, setMessages] = useState([])
  const [userFiles, setUserFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('datos')
  const [userPlan, setUserPlan] = useState(null)

  // Upload
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  // Google Sheets
  const [sheetUrl, setSheetUrl] = useState('')
  const [connectingSheet, setConnectingSheet] = useState(false)
  const [sheetError, setSheetError] = useState('')
  const [syncingSheet, setSyncingSheet] = useState(null)
  const [showAddExisting, setShowAddExisting] = useState(false)

  // Chat
  const [chatInput, setChatInput] = useState('')
  const [sending, setSending] = useState(false)
  const [hasGreeted, setHasGreeted] = useState(false)
  const [basicMode, setBasicMode] = useState(false)
  const [msgUsage, setMsgUsage] = useState(null)

  // Column override
  const [columnOverrideFile, setColumnOverrideFile] = useState(null)
  const [selectedColumn, setSelectedColumn] = useState('')
  const [reprocessing, setReprocessing] = useState(false)

  // Editing
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  const h = { Authorization: `Bearer ${session?.access_token}` }
  const jh = { ...h, 'Content-Type': 'application/json' }

  const loadAll = useCallback(async () => {
    try {
      const [projRes, filesRes, sheetsRes, chatRes, userFilesRes, planRes] = await Promise.all([
        fetch(`${API}/api/projects/${id}`, { headers: h }).then(r => r.json()).catch(() => null),
        fetch(`${API}/api/projects/${id}/files`, { headers: h }).then(r => r.json()).catch(() => ({ files: [] })),
        fetch(`${API}/api/projects/${id}/sheets`, { headers: h }).then(r => r.json()).catch(() => ({ sheets: [] })),
        fetch(`${API}/api/projects/${id}/chat`, { headers: h }).then(r => r.json()).catch(() => ({ messages: [] })),
        fetch(`${API}/api/files`, { headers: h }).then(r => r.json()).catch(() => ({ files: [] })),
        fetch(`${API}/api/usage/messages`, { headers: h }).then(r => r.json()).catch(() => ({ plan: 'free' })),
      ])
      setProject(projRes?.project || projRes)
      setNameInput(projRes?.project?.name || projRes?.name || '')
      setFiles(filesRes.files || [])
      setSheets(sheetsRes.sheets || [])
      setMessages(chatRes.messages || [])
      setUserFiles(userFilesRes.files || [])
      setUserPlan(planRes.plan || 'free')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  useEffect(() => {
    if (activeTab !== 'chat') return
    fetch(`${API}/api/usage/messages`, { headers: h })
      .then(r => r.json())
      .then(data => setMsgUsage(data))
      .catch(() => {})
  }, [activeTab])

  // Feature 5: Proactive chat greeting with actual data insights
  useEffect(() => {
    if (activeTab === 'chat' && messages.length === 0 && files.length > 0 && !hasGreeted && !sending) {
      setHasGreeted(true)
      const totalRows = files.reduce((s, pf) => s + (pf.user_files?.row_count || 0), 0)
      const kpis = files.map(pf => pf.user_files?.kpi_data).filter(Boolean)
      const firstKpi = kpis[0] || {}
      const trend = firstKpi.summary?.revenueTrend
      const total = kpis.reduce((s, k) => s + (k.summary?.totalRevenue || 0), 0)
      const topCat = firstKpi.topProducts?.[0]?.name
      const declines = firstKpi.summary?.consecutiveDeclines || 0
      const topShare = firstKpi.summary?.topCategoryShare || 0
      const dataType = firstKpi.meta?.dataType || 'datos'
      const fmtTotal = total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : total >= 1_000 ? `$${(total / 1_000).toFixed(0)}K` : `$${Math.round(total).toLocaleString('es-ES')}`

      // Build rich, data-specific greeting prompt
      const contextParts = []
      if (total > 0) contextParts.push(`Total analizado: ${fmtTotal}`)
      if (trend != null) contextParts.push(`Tendencia: ${trend >= 0 ? '+' : ''}${trend.toFixed(1)}%`)
      if (topCat) contextParts.push(`Categoría líder: "${topCat}" (${topShare.toFixed(0)}%)`)
      if (declines >= 2) contextParts.push(`${declines} períodos consecutivos en caída`)

      const greeting = `Analizaste ${files.length} ${files.length === 1 ? 'archivo' : 'archivos'} de este proyecto (${totalRows.toLocaleString()} registros, tipo: ${dataType}). Datos clave: ${contextParts.join(' · ')}.

Respondé en español con exactamente este formato:
"¡Hola! Analicé tus datos y encontré 3 cosas que necesitás saber:

1. 🚨 [La alerta o riesgo más crítico basado en los datos reales]
2. 💡 [La mayor oportunidad detectada con números específicos]
3. 📈 [La tendencia principal - positiva o negativa - con el dato exacto]

¿Sobre cuál querés profundizar primero?"`

      sendChatMessage(greeting, true)
    }
  }, [activeTab, files.length])

  async function saveName() {
    if (!nameInput.trim()) return
    try {
      const res = await fetch(`${API}/api/projects/${id}`, { method: 'PUT', headers: jh, body: JSON.stringify({ name: nameInput }) })
      const data = await res.json()
      setProject(data.project)
      setEditingName(false)
    } catch (err) { console.error(err) }
  }

  // ── Upload file directly to project ────────────────────────────────────────
  async function uploadFile(file) {
    if (!file) return
    setUploading(true)
    setUploadError('')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`${API}/api/projects/${id}/upload`, { method: 'POST', headers: h, body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Upload failed')
      await loadAll()
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleFileInput(e) {
    const file = e.target.files[0]
    if (!file) return
    e.target.value = ''
    await uploadFile(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  // ── Add existing file to project ────────────────────────────────────────────
  async function addExistingFile(fileId) {
    try {
      await fetch(`${API}/api/projects/${id}/files`, { method: 'POST', headers: jh, body: JSON.stringify({ fileId }) })
      setShowAddExisting(false)
      await loadAll()
    } catch (err) { console.error(err) }
  }

  // ── Remove file ─────────────────────────────────────────────────────────────
  async function removeFile(fileId) {
    try {
      await fetch(`${API}/api/projects/${id}/files/${fileId}`, { method: 'DELETE', headers: h })
      setFiles(f => f.filter(pf => pf.user_files?.id !== fileId))
    } catch (err) { console.error(err) }
  }

  // ── Google Sheets ───────────────────────────────────────────────────────────
  async function connectSheet(e) {
    e.preventDefault()
    if (!sheetUrl.trim()) return
    setConnectingSheet(true)
    setSheetError('')
    try {
      const res = await fetch(`${API}/api/projects/${id}/sheets`, { method: 'POST', headers: jh, body: JSON.stringify({ sheetUrl }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message)
      setSheetUrl('')
      await loadAll()
    } catch (err) {
      setSheetError(err.message)
    } finally {
      setConnectingSheet(false)
    }
  }

  async function syncSheet(integrationId) {
    setSyncingSheet(integrationId)
    try {
      await fetch(`${API}/api/projects/${id}/sheets/${integrationId}/sync`, { method: 'PUT', headers: h })
      await loadAll()
    } finally {
      setSyncingSheet(null)
    }
  }

  async function disconnectSheet(integrationId) {
    if (!window.confirm('¿Desconectar esta hoja? Los datos importados se eliminarán del proyecto.')) return
    try {
      await fetch(`${API}/api/projects/${id}/sheets/${integrationId}`, { method: 'DELETE', headers: h })
      await loadAll()
    } catch (err) { console.error(err) }
  }

  // ── Chat ────────────────────────────────────────────────────────────────────
  async function sendChatMessage(text, isAuto = false) {
    const msg = text?.trim()
    if (!msg || sending) return
    if (!isAuto) setChatInput('')
    setSending(true)
    if (!isAuto) setMessages(m => [...m, { role: 'user', content: msg }])
    try {
      const res = await fetch(`${API}/api/projects/${id}/chat`, { method: 'POST', headers: jh, body: JSON.stringify({ message: msg }) })
      const data = await res.json()
      if (res.status === 429 && data.error === 'limit_reached') {
        setMessages(m => m.slice(0, -1))
        setMsgUsage(u => u ? { ...u, used: data.used, remaining: 0, percentage: 100 } : u)
        setSending(false)
        chatInputRef.current?.focus()
        return
      }
      if (data.basicMode) setBasicMode(true)
      setMessages(m => [...m, { role: 'assistant', content: data.reply || 'Sin respuesta' }])
      // Refresh usage count
      fetch(`${API}/api/usage/messages`, { headers: h })
        .then(r => r.json())
        .then(d => setMsgUsage(d))
        .catch(() => {})
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Error al procesar. Intenta de nuevo.' }])
    } finally {
      setSending(false)
      chatInputRef.current?.focus()
    }
  }

  async function reprocessFileColumn(fileId, columnName) {
    setReprocessing(true)
    try {
      const res = await fetch(`${API}/api/projects/${id}/files/${fileId}/reprocess`, {
        method: 'POST', headers: jh, body: JSON.stringify({ columnName }),
      })
      if (res.ok) {
        setColumnOverrideFile(null)
        setSelectedColumn('')
        await loadAll()
      }
    } catch (err) { console.error(err) }
    finally { setReprocessing(false) }
  }

  const filesNotInProject = userFiles.filter(uf => !files.some(pf => pf.user_files?.id === uf.id))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-24">
        <p className="text-gray-500">Proyecto no encontrado.</p>
        <button onClick={() => navigate('/projects')} className="mt-4 text-electric-500 hover:underline text-sm">← Volver</button>
      </div>
    )
  }

  const projectColor = project.color || '#6366f1'

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/projects')}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/[0.07] text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${projectColor}20` }}
        >
          <BarChart3 className="w-5 h-5" style={{ color: projectColor }} />
        </div>

        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
              className="flex-1 text-xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-electric-500 focus:outline-none"
              autoFocus
            />
            <button onClick={saveName} className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10 rounded-lg">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => setEditingName(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group flex-1">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
            <button
              onClick={() => setEditingName(true)}
              className="p-1.5 text-gray-300 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/[0.07] rounded-lg opacity-0 group-hover:opacity-100 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="border-b border-gray-200 dark:border-white/[0.08]">
        <nav className="flex gap-0">
          {[
            { key: 'datos', label: 'Datos', badge: files.length + sheets.length || null },
            { key: 'analisis', label: 'Análisis' },
            { key: 'chat', label: 'Chat IA', badge: messages.length || null },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-electric-500 dark:text-electric-400'
                  : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-2 text-[10px] bg-gray-100 dark:bg-white/[0.08] text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: projectColor }} />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: DATOS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'datos' && (
        <div className="space-y-6">
          {/* Hidden file input */}
          <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.tsv" className="hidden" onChange={handleFileInput} />

          {/* Feature 1: No-data wizard — show when project has no files */}
          {files.length === 0 && !uploading && (
            <NoDataWizard
              industry={project?.industry || 'general'}
              projectName={project?.name}
              onUpload={() => fileInputRef.current?.click()}
            />
          )}

          {/* ── Drag-drop upload zone ── */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
              dragOver
                ? 'border-electric-500 bg-electric-500/10 dark:bg-electric-500/15'
                : 'border-gray-200 dark:border-white/[0.10] hover:border-electric-500/50 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center gap-2 select-none">
              {uploading ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-electric-500/10 flex items-center justify-center">
                    <Loader className="w-5 h-5 text-electric-500 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Procesando archivo…</p>
                </>
              ) : dragOver ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-electric-500/20 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-electric-500" />
                  </div>
                  <p className="text-sm font-semibold text-electric-500">Soltá el archivo aquí</p>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-slate-300">
                      Arrastrá un archivo o <span className="text-electric-500">buscá</span>
                    </p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">.xlsx · .csv · .tsv — hasta 10 MB</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {uploadError}
              <button onClick={() => setUploadError('')} className="ml-auto"><X className="w-3 h-3" /></button>
            </div>
          )}

          {/* Data quality panel */}
          {files.length > 0 && <DataQualityPanel files={files} />}

          {/* ── Section A: Uploaded files ── */}
          <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">
                Archivos subidos
                {files.length > 0 && <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">({files.length})</span>}
              </h2>
              <button
                onClick={() => setShowAddExisting(true)}
                className="text-xs px-3 py-1.5 border border-gray-200 dark:border-white/[0.12] text-gray-600 dark:text-slate-400 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
              >
                Agregar existente
              </button>
            </div>

            {files.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-400 dark:text-slate-500">No hay archivos en este proyecto todavía.</p>
              </div>
            ) : (
              <div>
                {files.map(pf => {
                  const f = pf.user_files
                  const kpi = f?.kpi_data
                  const isSheet = kpi?.source === 'google_sheets'
                  return (
                    <div key={pf.id} className="border-b border-gray-50 dark:border-white/[0.04] last:border-b-0">
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0">
                        {isSheet
                          ? <Link2 className="w-4 h-4 text-green-500" />
                          : <FileSpreadsheet className="w-4 h-4 text-electric-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f?.original_name}</p>
                          {kpi?.meta?.dataType && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-electric-500/10 text-electric-500 font-medium">
                              {kpi.meta.dataType}
                            </span>
                          )}
                          {isSheet && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-medium">
                              Google Sheets
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400 dark:text-slate-500 flex-wrap">
                          {kpi?.summary?.totalRevenue != null && (
                            <span className="font-medium text-gray-600 dark:text-slate-300">{fmt(kpi.summary.totalRevenue)}</span>
                          )}
                          {kpi?.summary?.revenueTrend != null && (
                            <span className={kpi.summary.revenueTrend >= 0 ? 'text-green-500' : 'text-red-400'}>
                              {kpi.summary.revenueTrend >= 0 ? '↑' : '↓'}{Math.abs(kpi.summary.revenueTrend).toFixed(1)}%
                            </span>
                          )}
                          <span>{fmtDateShort(f?.created_at)}</span>
                          <span>{f?.row_count?.toLocaleString()} filas</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(f?.id)}
                        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0"
                        title="Quitar del proyecto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Column selector: show when total is $0 and columns exist */}
                    {kpi?.summary?.totalRevenue === 0 && (f?.columns?.length > 0 || kpi?.numericColumns?.length > 0) && (
                      <div className="mx-4 mb-3 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" />
                          ¿Los datos no se ven bien? Seleccioná la columna principal manualmente
                        </p>
                        {columnOverrideFile === f?.id ? (
                          <div className="flex gap-2">
                            <select
                              value={selectedColumn}
                              onChange={e => setSelectedColumn(e.target.value)}
                              className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-amber-300 dark:border-amber-500/40 bg-white dark:bg-navy-800 text-gray-900 dark:text-white focus:outline-none"
                            >
                              <option value="">— Elegí una columna —</option>
                              {(kpi?.numericColumns || f?.columns || []).map(col => (
                                <option key={col} value={col}>{col}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => reprocessFileColumn(f.id, selectedColumn)}
                              disabled={!selectedColumn || reprocessing}
                              className="text-xs px-3 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                            >
                              {reprocessing ? '…' : 'Aplicar'}
                            </button>
                            <button onClick={() => setColumnOverrideFile(null)} className="text-xs px-2 text-gray-400 hover:text-gray-600">
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => { setColumnOverrideFile(f?.id); setSelectedColumn('') }}
                            className="text-xs px-3 py-1.5 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                          >
                            Seleccionar columna →
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Section B: Connected sources ── */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm mb-3">Fuentes conectadas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Google Sheets */}
              <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-500/10 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#34A853" opacity=".2"/>
                      <path d="M14 2v6h6" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 13h8M8 17h5" stroke="#34A853" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Google Sheets</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">Importa datos desde una hoja pública</p>
                  </div>
                </div>

                {sheets.length > 0 ? (
                  <div className="space-y-2 mb-3">
                    {sheets.map(s => (
                      <div key={s.id} className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-500/5 rounded-xl border border-green-200 dark:border-green-500/20">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-slate-300 truncate">{s.name}</p>
                          <p className="text-[10px] text-gray-400 dark:text-slate-500">
                            Sincronizado {fmtDateShort(s.last_synced_at)}
                          </p>
                        </div>
                        <button
                          onClick={() => syncSheet(s.id)}
                          disabled={syncingSheet === s.id}
                          className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/10 rounded-lg transition-colors"
                          title="Sincronizar"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${syncingSheet === s.id ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => disconnectSheet(s.id)}
                          className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Desconectar"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}

                <form onSubmit={connectSheet} className="space-y-2">
                  <input
                    type="url"
                    value={sheetUrl}
                    onChange={e => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-white/[0.12] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500"
                  />
                  {sheetError && (
                    <p className="text-[10px] text-red-500">{sheetError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={!sheetUrl.trim() || connectingSheet}
                    className="w-full text-xs py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    {connectingSheet ? (
                      <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Link2 className="w-3 h-3" />
                    )}
                    {connectingSheet ? 'Conectando…' : 'Conectar'}
                  </button>
                </form>
              </div>

              {/* Meta Ads */}
              <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-500/10 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Meta Ads</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">Facebook & Instagram Ads</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] px-2 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                  Próximamente
                </span>
              </div>

              {/* Google Ads */}
              <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] p-4 opacity-60">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 flex-shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M5.26 6.13 2.13 11.5a1.5 1.5 0 0 0 .55 2.05l5.2 3A6 6 0 0 1 18 9.5H9a3 3 0 0 0-2.6 1.5L5.26 6.13z"/>
                      <path fill="#FBBC04" d="M18 9.5a6 6 0 1 1-6 6h-6a3 3 0 0 0 0 6h12a6 6 0 0 0 0-12z"/>
                      <path fill="#34A853" d="M12 21.5a6 6 0 0 0 5.2-9H12a3 3 0 0 1 0-6H6a6 6 0 0 0 0 12h6z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Google Ads</p>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500">Campañas de búsqueda y display</p>
                  </div>
                </div>
                <span className="inline-block text-[10px] px-2 py-1 bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-full font-medium">
                  Próximamente
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: ANÁLISIS
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'analisis' && (
        <AnalysisTab files={files} industry={project?.industry || 'general'} />
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: CHAT IA
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'chat' && (
        <div className="bg-white dark:bg-navy-800 rounded-2xl border border-gray-100 dark:border-white/[0.08] flex flex-col" style={{ height: 'calc(100vh - 320px)', minHeight: 400 }}>
          {/* Chat header */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-white/[0.06]">
            <div className="w-8 h-8 rounded-xl bg-electric-500/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <OkapiLogo size={28} showText={false} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Okapi — Asistente IA</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {files.length} {files.length === 1 ? 'archivo' : 'archivos'} en contexto
              </p>
            </div>
            {/* Usage indicator */}
            {msgUsage && (
              <div className="flex-shrink-0 text-right">
                {msgUsage.unlimited ? (
                  <span className="text-[11px] text-electric-500 font-medium">Mensajes ilimitados ✨</span>
                ) : (
                  <div>
                    <span className={`text-[11px] font-semibold ${
                      msgUsage.percentage >= 100 ? 'text-red-500' :
                      msgUsage.percentage >= 80 ? 'text-amber-500' : 'text-green-500'
                    }`}>
                      {msgUsage.used}/{msgUsage.limit} mensajes este mes{' '}
                      {msgUsage.percentage >= 100 ? '🔴' : msgUsage.percentage >= 80 ? '🟡' : '🟢'}
                    </span>
                    <div className="mt-0.5 h-1 w-24 bg-gray-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          msgUsage.percentage >= 100 ? 'bg-red-500' :
                          msgUsage.percentage >= 80 ? 'bg-amber-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(100, msgUsage.percentage)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basic mode banner */}
          {basicMode && (
            <div className="mx-4 mt-3 flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl text-xs text-yellow-700 dark:text-yellow-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>Chat en modo básico. Activá créditos en <strong>console.anthropic.com</strong> para IA completa.</span>
            </div>
          )}

          {/* Approaching limit warning (80%+) */}
          {msgUsage && !msgUsage.unlimited && msgUsage.percentage >= 80 && msgUsage.percentage < 100 && (
            <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>⚠️ Te quedan <strong>{msgUsage.remaining}</strong> mensaje{msgUsage.remaining !== 1 ? 's' : ''} este mes</span>
            </div>
          )}

          {/* After 5th message on free plan upsell */}
          {msgUsage && msgUsage.plan === 'free' && msgUsage.used === 5 && (
            <div className="mx-4 mt-3 flex items-center gap-2 p-3 bg-electric-500/5 dark:bg-electric-500/10 border border-electric-500/20 rounded-xl text-xs text-electric-600 dark:text-electric-400">
              <Zap className="w-4 h-4 flex-shrink-0" />
              <span>¿Sabías que con el plan mensual tenés <strong>150 mensajes</strong>? Solo <strong>$7.45/mes</strong></span>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && !sending && (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-electric-500/40 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-slate-500">
                  {files.length === 0
                    ? 'Agrega archivos en la pestaña "Datos" para empezar'
                    : 'Cargando análisis…'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${
                  msg.role === 'user' ? 'bg-electric-500 text-white' : 'bg-electric-500/10'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5" />
                    : <OkapiLogo size={24} showText={false} />
                  }
                </div>
                <div className={`max-w-[85%] text-sm rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-electric-500 text-white rounded-tr-sm'
                    : 'bg-gray-50 dark:bg-white/[0.05] text-gray-800 dark:text-slate-200 rounded-tl-sm'
                }`}>
                  {msg.content === '...'
                    ? <span className="flex gap-1 py-0.5">
                        <span className="animate-bounce">·</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>·</span>
                        <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>·</span>
                      </span>
                    : <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  }
                </div>
              </div>
            ))}

            {sending && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-xl bg-electric-500/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <OkapiLogo size={24} showText={false} />
                </div>
                <div className="bg-gray-50 dark:bg-white/[0.05] rounded-2xl rounded-tl-sm px-4 py-3">
                  <span className="flex gap-1 py-0.5">
                    <span className="animate-bounce text-electric-500">·</span>
                    <span className="animate-bounce text-electric-500" style={{ animationDelay: '0.1s' }}>·</span>
                    <span className="animate-bounce text-electric-500" style={{ animationDelay: '0.2s' }}>·</span>
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick chips — proactive set for first 2 messages, then followup set */}
          {files.length > 0 && messages.length > 0 && messages.length <= 4 && !(msgUsage && !msgUsage.unlimited && msgUsage.percentage >= 100) && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {(messages.length <= 2 ? QUICK_CHIPS_INITIAL : QUICK_CHIPS_FOLLOWUP).map(chip => (
                <button
                  key={chip}
                  onClick={() => sendChatMessage(chip)}
                  disabled={sending}
                  className="text-xs px-3 py-1.5 rounded-full border border-electric-500/30 text-electric-500 hover:bg-electric-500/10 dark:text-electric-400 dark:border-electric-400/30 transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input or limit-reached card */}
          <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
            {msgUsage && !msgUsage.unlimited && msgUsage.percentage >= 100 ? (
              <div className="space-y-3">
                <div className="p-4 bg-gray-50 dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/[0.08] text-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                    Alcanzaste tu límite mensual de mensajes IA
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mb-3">
                    Plan actual: <strong>{msgUsage.plan === 'free' ? 'Gratuito — 10 mensajes/mes' : 'Mensual — 150 mensajes/mes'}</strong>
                    {' · '}Próximo reset: 1 de {msgUsage.resetDate}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">Para seguir chateando con IA:</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <a
                      href="/subscription"
                      className="text-xs px-4 py-2 bg-electric-500 hover:bg-electric-600 text-white rounded-xl font-medium transition-colors"
                    >
                      Plan Mensual — $7.45/mes
                    </a>
                    <a
                      href="/subscription"
                      className="text-xs px-4 py-2 border border-electric-500/40 text-electric-500 hover:bg-electric-500/10 rounded-xl font-medium transition-colors"
                    >
                      Plan Anual — $34.99/año
                    </a>
                  </div>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-3">
                    Mientras tanto podés seguir viendo tus KPIs y análisis.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  ref={chatInputRef}
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(chatInput) }
                  }}
                  placeholder={files.length === 0 ? 'Agrega archivos primero…' : 'Pregunta sobre tus datos…'}
                  disabled={files.length === 0 || sending}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-electric-500/40 disabled:opacity-50"
                />
                <button
                  onClick={() => sendChatMessage(chatInput)}
                  disabled={!chatInput.trim() || sending || files.length === 0}
                  className="w-10 h-10 flex items-center justify-center bg-electric-500 hover:bg-electric-600 disabled:opacity-50 text-white rounded-xl transition-colors flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Add existing file modal ── */}
      {showAddExisting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.08]">
              <h2 className="font-semibold text-gray-900 dark:text-white">Agregar archivo existente</h2>
              <button onClick={() => setShowAddExisting(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-72 overflow-y-auto">
              {filesNotInProject.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">Todos tus archivos ya están en este proyecto.</p>
                  <button
                    onClick={() => { setShowAddExisting(false); setActiveTab('datos') }}
                    className="mt-3 text-electric-500 hover:underline text-sm"
                  >
                    Subir un nuevo archivo →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {filesNotInProject.map(f => (
                    <button
                      key={f.id}
                      onClick={() => addExistingFile(f.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.04] text-left transition-colors border border-transparent hover:border-electric-500/20"
                    >
                      <FileSpreadsheet className="w-5 h-5 text-electric-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.original_name}</p>
                        <p className="text-xs text-gray-400">{f.row_count?.toLocaleString()} filas · {fmtDateShort(f.created_at)}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

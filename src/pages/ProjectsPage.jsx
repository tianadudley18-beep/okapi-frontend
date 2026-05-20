import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Folder, BarChart3, Calendar, Trash2, X,
  Store, Factory, GraduationCap, User, Globe2,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#eab308', '#22c55e', '#06b6d4',
]

const INDUSTRIES = [
  { id: 'importexport', emoji: '🏭', label: 'Importación/Exportación' },
  { id: 'retail', emoji: '🛍️', label: 'Retail/Comercio' },
  { id: 'saas', emoji: '💻', label: 'SaaS/Tecnología' },
  { id: 'gastronomy', emoji: '🍽️', label: 'Gastronomía/Turismo' },
  { id: 'logistics', emoji: '📦', label: 'Logística/Distribución' },
  { id: 'construction', emoji: '🏗️', label: 'Construcción/Inmobiliaria' },
  { id: 'finance', emoji: '💰', label: 'Servicios Financieros' },
  { id: 'education', emoji: '🎓', label: 'Educación' },
  { id: 'health', emoji: '🏥', label: 'Salud' },
  { id: 'manufacturing', emoji: '⚙️', label: 'Manufactura/Producción' },
  { id: 'professional', emoji: '📊', label: 'Servicios Profesionales' },
  { id: 'academic', emoji: '🎓', label: 'Académico/Investigación' },
  { id: 'general', emoji: '🌐', label: 'Otro/General' },
]

const PROJECT_ICONS = [
  { id: 'chart', Icon: BarChart3, label: 'Gráfico' },
  { id: 'store', Icon: Store, label: 'Tienda' },
  { id: 'factory', Icon: Factory, label: 'Fábrica' },
  { id: 'school', Icon: GraduationCap, label: 'Educación' },
  { id: 'person', Icon: User, label: 'Persona' },
  { id: 'globe', Icon: Globe2, label: 'Global' },
]

function ProjectIcon({ icon, color, size = 5 }) {
  const found = PROJECT_ICONS.find(i => i.id === icon)
  const Icon = found?.Icon || BarChart3
  return <Icon className={`w-${size} h-${size}`} style={{ color }} />
}

function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatValue(n) {
  if (!n && n !== 0) return '—'
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString('es-ES', { maximumFractionDigits: 0 })}`
}

export default function ProjectsPage() {
  const { session } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [modalStep, setModalStep] = useState(1)
  const [form, setForm] = useState({ name: '', description: '', color: PROJECT_COLORS[0], icon: 'chart', industry: 'general' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const headers = { Authorization: `Bearer ${session?.access_token}` }

  async function loadProjects() {
    try {
      const res = await fetch(`${API}/api/projects`, { headers })
      const data = await res.json()
      setProjects(data.projects || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadProjects() }, [])

  async function createProject(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      const res = await fetch(`${API}/api/projects`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.project) {
        setProjects(p => [data.project, ...p])
        setShowModal(false)
        setModalStep(1)
        setForm({ name: '', description: '', color: PROJECT_COLORS[0], icon: 'chart', industry: 'general' })
        navigate(`/projects/${data.project.id}`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject(e, id) {
    e.stopPropagation()
    if (!window.confirm('¿Eliminar este proyecto?')) return
    setDeleting(id)
    try {
      await fetch(`${API}/api/projects/${id}`, { method: 'DELETE', headers })
      setProjects(p => p.filter(pr => pr.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-electric-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Proyectos</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Agrupa archivos y chatea con Okapi sobre toda tu información
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-electric-500 hover:bg-electric-600 text-white rounded-xl font-medium text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </div>

      {/* Empty state */}
      {projects.length === 0 && (
        <div className="text-center py-24">
          <div className="w-16 h-16 bg-electric-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Folder className="w-8 h-8 text-electric-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Crea tu primer proyecto</h3>
          <p className="text-gray-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
            Agrupa archivos relacionados y usa el chat de IA con contexto de todos ellos
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 bg-electric-500 hover:bg-electric-600 text-white rounded-xl font-medium text-sm transition-colors"
          >
            Crear proyecto
          </button>
        </div>
      )}

      {/* Projects grid */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => {
            const fileCount = project.file_count || 0
            return (
              <div
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group relative bg-white dark:bg-navy-800 border border-gray-200 dark:border-white/[0.08] rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-electric-500/30 transition-all duration-200"
              >
                {/* Color bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
                  style={{ backgroundColor: project.color || '#6366f1' }}
                />

                <div className="flex items-start justify-between mt-1">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${project.color || '#6366f1'}20` }}
                  >
                    <ProjectIcon icon={project.icon} color={project.color || '#6366f1'} />
                  </div>
                  <button
                    onClick={(e) => deleteProject(e, project.id)}
                    disabled={deleting === project.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-4 text-xs text-gray-400 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <BarChart3 className="w-3.5 h-3.5" />
                    {fileCount} {fileCount === 1 ? 'archivo' : 'archivos'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(project.updated_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create project modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-navy-800 rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-white/[0.08]">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Nuevo proyecto</h2>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Paso {modalStep} de 2</p>
              </div>
              <button onClick={() => { setShowModal(false); setModalStep(1) }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step indicators */}
            <div className="flex gap-1.5 px-6 pt-4">
              {[1, 2].map(s => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= modalStep ? 'bg-electric-500' : 'bg-gray-200 dark:bg-white/[0.08]'}`} />
              ))}
            </div>

            {modalStep === 1 ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Nombre del proyecto *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter' && form.name.trim()) setModalStep(2) }}
                    placeholder="Ej: Ventas Q1 2025"
                    maxLength={80}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.12] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500 text-sm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Descripción (opcional)</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="¿De qué tratan estos datos?"
                    rows={2}
                    maxLength={200}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.12] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-electric-500/50 focus:border-electric-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-navy-800' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Ícono</label>
                  <div className="flex gap-2 flex-wrap">
                    {PROJECT_ICONS.map(({ id, Icon, label }) => (
                      <button
                        key={id}
                        type="button"
                        title={label}
                        onClick={() => setForm(f => ({ ...f, icon: id }))}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 ${
                          form.icon === id
                            ? 'border-electric-500 bg-electric-500/10'
                            : 'border-transparent hover:border-gray-200 dark:hover:border-white/[0.12] hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                        }`}
                      >
                        <Icon className="w-5 h-5" style={{ color: form.icon === id ? form.color : undefined }} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setModalStep(1) }}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/[0.12] rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!form.name.trim()}
                    onClick={() => setModalStep(2)}
                    className="flex-1 px-4 py-2.5 bg-electric-500 hover:bg-electric-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={createProject} className="p-6">
                <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-4">¿Cuál es el rubro de este proyecto?</p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                  {INDUSTRIES.map(ind => (
                    <button
                      key={ind.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, industry: ind.id }))}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all ${
                        form.industry === ind.id
                          ? 'border-electric-500 bg-electric-500/10 text-electric-600 dark:text-electric-400'
                          : 'border-transparent bg-gray-50 dark:bg-white/[0.04] hover:border-electric-500/30 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xl">{ind.emoji}</span>
                      <span className="text-xs font-medium leading-tight">{ind.label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setModalStep(1)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/[0.12] rounded-xl text-sm font-medium text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" /> Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 px-4 py-2.5 bg-electric-500 hover:bg-electric-600 disabled:opacity-50 text-white rounded-xl text-sm font-medium transition-colors"
                  >
                    {saving ? 'Creando…' : 'Crear proyecto'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

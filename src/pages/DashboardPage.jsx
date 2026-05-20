import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plus, Folder, FileText, BarChart3, TrendingUp, ArrowRight, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'

const API = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api'

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'ahora'
  if (mins < 60) return `hace ${mins}m`
  const hs = Math.floor(mins / 60)
  if (hs < 24) return `hace ${hs}h`
  const days = Math.floor(hs / 24)
  return `hace ${days}d`
}

const PROJECT_COLORS = {
  '#6366f1': 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
  '#10b981': 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  '#f59e0b': 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  '#ef4444': 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  '#8b5cf6': 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400',
  '#06b6d4': 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
  '#ec4899': 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
  '#14b8a6': 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
}

function ProjectCard({ project }) {
  const colorClass = PROJECT_COLORS[project.color] || PROJECT_COLORS['#6366f1']
  const fileCount = project.file_count || 0

  return (
    <Link
      to={`/projects/${project.id}`}
      className="card hover:shadow-md hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorClass}`}>
          {project.icon === 'store' ? '🏪' :
           project.icon === 'factory' ? '🏭' :
           project.icon === 'school' ? '🎓' :
           project.icon === 'person' ? '👤' :
           project.icon === 'globe' ? '🌐' : '📊'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {project.name}
            </h3>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 shrink-0 transition-colors" />
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 dark:text-slate-400 truncate mt-0.5">{project.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              {fileCount} {fileCount === 1 ? 'archivo' : 'archivos'}
            </span>
            <span className="text-xs text-gray-300 dark:text-slate-600">·</span>
            <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              {timeAgo(project.updated_at || project.created_at)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-slate-100">{value}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{label}</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [recentFiles, setRecentFiles] = useState([])
  const [loading, setLoading] = useState(true)

  const firstName = user?.email?.split('@')[0]?.split('.')?.[0] || 'usuario'
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1)

  useEffect(() => {
    const headers = {}
    async function load() {
      try {
        const { supabase } = await import('../services/supabase')
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
        }
        const [projRes, filesRes] = await Promise.all([
          fetch(`${API}/projects`, { headers }),
          fetch(`${API}/files`, { headers }),
        ])
        const projData = projRes.ok ? await projRes.json() : { projects: [] }
        const filesData = filesRes.ok ? await filesRes.json() : { files: [] }
        setProjects(projData.projects || [])
        setRecentFiles((filesData.files || []).slice(0, 5))
      } catch {
        // show empty state
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalFiles = recentFiles.length
  const totalRecords = recentFiles.reduce((s, f) => s + (f.row_count || 0), 0)
  const recentProjects = [...projects].sort((a, b) =>
    new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
  ).slice(0, 6)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-gray-200 dark:bg-navy-700 rounded-lg" />
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => <div key={i} className="h-20 bg-gray-200 dark:bg-navy-700 rounded-xl" />)}
        </div>
        <div className="h-6 w-40 bg-gray-200 dark:bg-navy-700 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-200 dark:bg-navy-700 rounded-xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-slate-100">
            Bienvenido, {capitalizedName} 👋
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
            Resumen de tus proyectos de análisis
          </p>
        </div>
        <button
          onClick={() => navigate('/projects')}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nuevo proyecto
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Folder}
          label="Proyectos activos"
          value={projects.length}
          color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <StatCard
          icon={FileText}
          label="Archivos analizados"
          value={totalFiles}
          color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          icon={BarChart3}
          label="Registros totales"
          value={totalRecords.toLocaleString()}
          color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
        />
      </div>

      {/* Projects section */}
      {projects.length === 0 ? (
        <div className="card flex flex-col items-center text-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-navy-700 flex items-center justify-center">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Todavía no tenés proyectos
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-xs">
              Creá tu primer proyecto para empezar a subir datos y obtener análisis con IA.
            </p>
          </div>
          <button
            onClick={() => navigate('/projects')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Crear primer proyecto
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-slate-100">
              Proyectos recientes
            </h2>
            <Link
              to="/projects"
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recentProjects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

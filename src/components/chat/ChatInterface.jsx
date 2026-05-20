import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader, Lightbulb, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { sendChatMessage, getChatHistory } from '../../services/api'
import { useTheme } from '../../context/ThemeContext'

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-primary-600' : 'bg-gray-100 dark:bg-navy-700'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-gray-600 dark:text-slate-300" />
        }
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? 'bg-primary-600 text-white rounded-tr-sm'
          : 'bg-gray-100 dark:bg-navy-700 text-gray-800 dark:text-slate-200 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

function TypingIndicator({ dark }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${dark ? 'bg-navy-700' : 'bg-gray-100'}`}>
        <Bot className={`w-4 h-4 ${dark ? 'text-slate-300' : 'text-gray-600'}`} />
      </div>
      <div className={`rounded-2xl rounded-tl-sm px-4 py-3 ${dark ? 'bg-navy-700' : 'bg-gray-100'}`}>
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full animate-bounce ${dark ? 'bg-slate-400' : 'bg-gray-400'}`}
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function ChatInterface({ fileId }) {
  const { t } = useTranslation()
  const { dark } = useTheme()
  const greeting = { role: 'assistant', content: t('chat.greeting') }
  const [messages, setMessages] = useState([greeting])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const bottomRef = useRef()

  // Load conversation history when fileId changes
  useEffect(() => {
    if (!fileId) return
    setMessages([greeting])
    setHistoryLoaded(false)

    getChatHistory(fileId)
      .then(({ data }) => {
        const history = data?.messages || []
        if (history.length > 0) {
          setMessages([greeting, ...history.map((m) => ({ role: m.role, content: m.content }))])
        }
      })
      .catch(() => {})
      .finally(() => setHistoryLoaded(true))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const suggestions = [t('chat.s1'), t('chat.s2'), t('chat.s3'), t('chat.s4')]

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return

    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setInput('')
    setLoading(true)

    try {
      const { data } = await sendChatMessage(userMsg, fileId)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: t('chat.errorMsg') },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const hasOnlyGreeting = messages.length === 1 && messages[0].role === 'assistant'

  return (
    <div className={`flex flex-col h-[600px] card p-0 overflow-hidden ${dark ? 'bg-navy-800 border-navy-700' : ''}`}>
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-4 border-b ${dark ? 'border-navy-700' : 'border-gray-100'}`}>
        <div className={`rounded-full p-2 ${dark ? 'bg-electric-500/20' : 'bg-accent-100'}`}>
          <Bot className={`w-5 h-5 ${dark ? 'text-electric-400' : 'text-accent-600'}`} />
        </div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${dark ? 'text-slate-100' : 'text-gray-900'}`}>{t('chat.title')}</p>
          <p className={`text-xs flex items-center gap-1 ${loading ? 'text-amber-500' : 'text-green-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            {loading ? t('chat.thinking') : t('chat.online')}
          </p>
        </div>
        {messages.length > 1 && (
          <button
            onClick={() => { setMessages([greeting]); setHistoryLoaded(false) }}
            className={`p-1.5 rounded-lg transition-colors ${dark ? 'hover:bg-navy-700 text-slate-400' : 'hover:bg-gray-100 text-gray-400'}`}
            title={t('chat.clearHistory')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {!historyLoaded && fileId && (
          <div className="flex justify-center">
            <span className={`text-xs px-3 py-1 rounded-full ${dark ? 'bg-navy-700 text-slate-400' : 'bg-gray-100 text-gray-400'}`}>
              {t('chat.loadingHistory')}
            </span>
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={i} msg={msg} />
        ))}
        {loading && <TypingIndicator dark={dark} />}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions (only when conversation is fresh) */}
      {hasOnlyGreeting && historyLoaded && (
        <div className={`px-5 pb-3 border-t ${dark ? 'border-navy-700' : 'border-gray-50'}`}>
          <p className={`text-xs flex items-center gap-1 mt-3 mb-2 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
            <Lightbulb className="w-3 h-3" /> {t('chat.suggestedQuestions')}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className={`text-xs rounded-full px-3 py-1.5 transition-colors ${
                  dark
                    ? 'bg-navy-700 hover:bg-electric-500/20 hover:text-electric-400 text-slate-400'
                    : 'bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-600'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`px-5 py-4 border-t ${dark ? 'border-navy-700' : 'border-gray-100'}`}>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('chat.placeholder')}
            rows={1}
            className={`flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
              dark
                ? 'bg-navy-700 border-navy-600 text-slate-100 placeholder-slate-500'
                : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
            }`}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition-colors flex-shrink-0"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
        <p className={`text-xs mt-1.5 ${dark ? 'text-slate-600' : 'text-gray-400'}`}>{t('chat.enterHint')}</p>
      </div>
    </div>
  )
}

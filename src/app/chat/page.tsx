'use client'

import { useState, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { useConversations } from '@/hooks/useConversations'
import ConversationList from '@/components/chat/ConversationList'
import ChatWindow from '@/components/chat/ChatWindow'
import ChatInput from '@/components/chat/ChatInput'
import Link from 'next/link'
import { BarChart2, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

export default function ChatPage() {
  const { messages, isStreaming, sessionId, model, setModel, sendMessage, regenerate, stopStreaming, newSession, loadSession } = useChat()
  const { resume } = useConversations()
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    if (sessionId && messages.length === 0) {
      setIsLoading(true)
      resume(sessionId).then(msgs => {
        if (msgs.length > 0) {
          loadSession(sessionId, msgs)
        }
        setIsLoading(false)
      })
    }
  }, [sessionId, resume, messages.length, loadSession])

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {isSidebarOpen && (
        <div className="hidden md:flex border-r border-sidebar-border">
          <ConversationList
            currentSessionId={sessionId}
            onResume={loadSession}
            onNew={newSession}
            onLoadingChange={setIsLoading}
          />
        </div>
      )}

      <div className="flex flex-col flex-1 h-full min-w-0 min-h-0 relative">
        <div className="absolute top-4 left-4 z-10 hidden md:block">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <a
            href="https://github.com/Ethan4582/t7.chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
            title="GitHub Repository"
          >
            <img src="github.png" className="w-4 h-4" />
          </a>
          <Link href="/dashboard" className="flex items-center justify-center w-9 h-9 rounded-xl bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm" title="Dashboard">
            <BarChart2 className="w-4 h-4" />
          </Link>
        </div>

        <ChatWindow
          messages={messages}
          isStreaming={isStreaming}
          model={model}
          onSuggestion={sendMessage}
          isLoading={isLoading}
          onRetry={regenerate}
        />
        <ChatInput
          onSend={sendMessage}
          onStop={stopStreaming}
          isStreaming={isStreaming}
          model={model}
          setModel={setModel}
        />
      </div>
    </div>
  )
}

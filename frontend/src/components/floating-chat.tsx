"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Send, Bot, User, Loader2, Sparkles, Clock, CheckCheck, X, Minimize2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"


interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  status?: "sending" | "sent" | "delivered"
}

const API_BASE_URL = "http://localhost:8000"

export function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your SplitWise AI assistant. I can help you with expense tracking, group management, and answer questions about splitting bills. How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
      status: "delivered",
    },
  ])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [groups, setGroups] = useState<{ id: string; name: string }[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [selectedUserId, setSelectedUserId] = useState<string>("")
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasNewMessage, setHasNewMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setHasNewMessage(false)
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/users/"),
          fetch("http://127.0.0.1:8000/groups/")
        ])

        const usersData = await usersRes.json()
        const groupsData = await groupsRes.json()

        setUsers(usersData)
        setGroups(groupsData)

        // Set default only once
        if (!selectedUserId && usersData.length > 0) {
          setSelectedUserId(usersData[0].id)
        }
        if (!selectedGroupId && groupsData.length > 0) {
          setSelectedGroupId(groupsData[0].id)
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        toast({
          title: "Failed to load users/groups",
          description: "Check if the backend is running.",
          variant: "destructive",
        })
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // <-- Only run once



  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setLoading(true)
    setIsTyping(true)

    // Update message status to sent
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "sent" } : msg)),
      )
    }, 500)

    try {
      const response = await fetch(`${API_BASE_URL}/query`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // SEND user_id and group_id with the query now
        body: JSON.stringify({
          query: userMessage.content,
          user_id: selectedUserId,
          group_id: selectedGroupId,
        }),
      })

      if (response.ok) {
        const data = await response.json()

        // Simulate typing delay
        setTimeout(() => {
          setIsTyping(false)

          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            content:
              data.response || "I'm sorry, I couldn't process your request right now. Please try again.",
            sender: "bot",
            timestamp: new Date(),
            status: "delivered",
          }

          setMessages((prev) => [...prev, botMessage])

          // Update user message to delivered
          setMessages((prev) =>
            prev.map((msg) => (msg.id === userMessage.id ? { ...msg, status: "delivered" } : msg)),
          )

          // Show notification if chat is closed
          if (!isOpen) {
            setHasNewMessage(true)
          }
        }, 1000 + Math.random() * 1000)
      } else {
        throw new Error("Failed to get response")
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsTyping(false)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })

      // Remove the failed message
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="h-8 w-8 text-white" />
            {hasNewMessage && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">1</span>
              </div>
            )}
            {hasNewMessage && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </Button>
        )}

        {/* Chat Window */}
        {isOpen && (
          <div className="absolute bottom-0 right-0 w-96 h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] animate-in slide-in-from-bottom-4 slide-in-from-right-4 duration-300">
            <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur-sm h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg flex-shrink-0 p-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-1.5 bg-white/20 rounded-lg">
                      <MessageCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base">SplitWise AI</span>
                        <Badge variant="secondary" className="bg-green-500 text-white text-xs px-2 py-0.5">
                          Online
                        </Badge>
                      </div>
                      <p className="text-blue-100 text-xs font-normal">Ask me anything!</p>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-white hover:bg-white/20 w-8 h-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* NEW: User & Group Selection */}
              <div className="p-3 border-b border-gray-300 flex gap-2 justify-between">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1"
                  disabled={loading}
                >
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="border rounded px-2 py-1 text-sm flex-1"
                  disabled={loading}
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Messages Container */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <div className="h-full overflow-y-auto p-3 space-y-3">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-start gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                      {/* Avatar */}
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${message.sender === "user"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gradient-to-r from-purple-500 to-pink-500"
                          }`}
                      >
                        {message.sender === "user" ? (
                          <User className="h-3.5 w-3.5 text-white" />
                        ) : (
                          <Bot className="h-3.5 w-3.5 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div
                        className={`max-w-[75%] ${message.sender === "user" ? "items-end" : "items-start"
                          } flex flex-col gap-1`}
                      >
                        <div
                          className={`px-3 py-2 rounded-2xl text-sm ${message.sender === "user"
                              ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-br-md"
                              : "bg-gray-100 text-gray-800 rounded-bl-md border border-gray-200"
                            } shadow-sm`}
                        >
                          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        </div>

                        {/* Message Info */}
                        <div
                          className={`flex items-center gap-1 px-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"
                            }`}
                        >
                          <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                          {message.sender === "user" && (
                            <div className="flex items-center">
                              {message.status === "sending" && <Clock className="h-2.5 w-2.5 text-gray-400" />}
                              {message.status === "sent" && <CheckCheck className="h-2.5 w-2.5 text-gray-400" />}
                              {message.status === "delivered" && <CheckCheck className="h-2.5 w-2.5 text-blue-500" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Bot className="h-3.5 w-3.5 text-white" />
                      </div>
                      <div className="bg-gray-100 px-3 py-2 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "150ms" }}
                            ></div>
                            <div
                              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "300ms" }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 ml-1">AI is typing...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Input Area */}
              <div className="flex-shrink-0 p-3 border-t border-gray-200 bg-gray-50/50">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="pr-10 py-2 text-sm border-2 border-gray-200 focus:border-blue-500 transition-colors resize-none rounded-lg"
                      disabled={loading}
                    />
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <Sparkles className="h-3.5 w-3.5 text-gray-400" />
                    </div>
                  </div>
                  <Button
                    onClick={sendMessage}
                    disabled={loading || !inputMessage.trim()}
                    size="sm"
                    className="h-10 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg shadow-lg transition-all duration-200"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-1 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("How do I split an expense equally?")}
                    className="text-xs h-6 px-2 bg-white/50 hover:bg-white border-gray-200 hover:border-blue-300"
                    disabled={loading}
                  >
                    Split expenses?
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage("How do I settle balances?")}
                    className="text-xs h-6 px-2 bg-white/50 hover:bg-white border-gray-200 hover:border-blue-300"
                    disabled={loading}
                  >
                    Settle balances?
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </>
  )
}

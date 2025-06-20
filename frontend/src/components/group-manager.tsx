/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Plus, Users, DollarSign, UserPlus, Loader2, Star, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Select from "react-select"

interface User {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
  users: User[]
  total_expenses: number
}

const API_BASE_URL = "http://localhost:8000"

export function GroupManager() {
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [selectedUsers, setSelectedUsers] = useState<{ label: string; value: number }[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [newGroupName, setNewGroupName] = useState("")
  const [newGroupUsers, setNewGroupUsers] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`)
      if (res.ok) {
        const users = await res.json()
        setAllUsers(users)
      }
    } catch (error) {
      console.error("Error fetching users", error)
    }
  }


  const fetchGroups = async () => {
    try {
      // Since we don't have a list all groups endpoint, we'll maintain a local list
      // In a real app, you'd have a GET /groups endpoint
      const storedGroups = localStorage.getItem("splitwise-groups")
      if (storedGroups) {
        const groupIds = JSON.parse(storedGroups)
        const groupPromises = groupIds.map(async (id: number) => {
          const response = await fetch(`${API_BASE_URL}/groups/${id}`)
          if (response.ok) {
            return await response.json()
          }
          return null
        })
        const groupsData = await Promise.all(groupPromises)
        setGroups(groupsData.filter((group) => group !== null))
      }
    } catch (error) {
      console.error("Error fetching groups:", error)
    }
  }

  const createGroup = async () => {
    if (!newGroupName.trim() || !newGroupUsers.trim()) {
      toast({
        title: "Error",
        description: "Please provide both group name and user IDs",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const userIds = selectedUsers.map((user) => user.value)

      const response = await fetch(`${API_BASE_URL}/groups`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newGroupName,
          user_ids: userIds,
        }),
      })

      if (response.ok) {
        const newGroup = await response.json()

        // Store group ID in localStorage for future reference
        const storedGroups = localStorage.getItem("splitwise-groups")
        const groupIds = storedGroups ? JSON.parse(storedGroups) : []
        groupIds.push(newGroup.id)
        localStorage.setItem("splitwise-groups", JSON.stringify(groupIds))

        setGroups([...groups, newGroup])
        setNewGroupName("")
        setNewGroupUsers("")

        toast({
          title: "Success",
          description: "Group created successfully!",
        })
      } else {
        throw new Error("Failed to create group")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Group Manager
            </h1>
            <p className="text-lg text-gray-600 mt-2">Create and manage your expense sharing groups</p>
          </div>
        </div>

        {/* Create New Group */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white -my-6">
          <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
              Create New Group
            </CardTitle>
            <CardDescription className="text-purple-100">
              Start a new group to track shared expenses with friends or family
            </CardDescription>
          </CardHeader>
        </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="groupName" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Group Name
                </Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="groupName"
                    placeholder="e.g., Weekend Trip, Roommates, Office Lunch"
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="h-12 pl-10 border-2 border-gray-200 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="userIds" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Users
                </Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Select
                      isMulti
                      id="userIds"
                      options={allUsers.map((user) => ({ value: user.id, label: user.name }))}
                      value={selectedUsers}
                      onChange={(selected) => setSelectedUsers(selected as { value: number; label: string }[])}
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                </div>
              </div>
            </div>
            <Button
              onClick={createGroup}
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg transition-all duration-200"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Group...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Group
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

        {/* Groups List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-bold text-gray-800">Your Groups</h3>
            {groups.length > 0 && (
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 px-3 py-1">
                {groups.length} group{groups.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>

          {groups.length === 0 ? (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl shadow-lg mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Groups Yet</h3>
                <p className="text-gray-500 text-lg mb-6">Create your first group above to get started!</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Star className="h-4 w-4" />
                  <span>Groups help you organize shared expenses</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((group) => (
                <Card
                  key={group.id}
                  className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                          {group.name}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                            ID: {group.id}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {group.users.length} member{group.users.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-md">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Members */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-600">Members</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.users.map((user, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1 rounded-full border border-purple-100"
                          >
                            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{user.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total Expenses */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-gray-600">Total Expenses</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-bold text-green-600">
                            ${group.total_expenses?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Created indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
                      <Calendar className="h-3 w-3" />
                      <span>Group created</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect} from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select as UiSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calculator, Users, User, ArrowRight, Wallet, TrendingUp, DollarSign, CreditCard, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Group {
  id: number
  name: string
  users: string[]
}

interface user {
  id: string
  name: string
}

interface Balance {
  user_owes: user
  user_owed: user
  amount: number
}

interface GroupOut {
  id: number
  name: string
  users: user[]
  total_expenses: number
}

interface UserBalance {
  group: GroupOut
  balances: Balance[]
}

const API_BASE_URL = "http://localhost:8000"

export function BalanceViewer() {
  const [allUsers, setAllUsers] = useState<user[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [groupBalances, setGroupBalances] = useState<Balance[]>([])
  const [userId, setUserId] = useState("")
  const [userBalances, setUserBalances] = useState<UserBalance[]>([])
  const [loading, setLoading] = useState(false)
  const [showGroupBalances, setShowGroupBalances] = useState(false)
  const [showUserBalances, setShowUserBalances] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    fetch(`${API_BASE_URL}/users`) // adjust endpoint accordingly
      .then(res => res.json())
      .then(setAllUsers)
      .catch(console.error)
  }, [])

  const fetchGroups = async () => {
    try {
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

  const fetchGroupBalances = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/balances`)
      if (res.ok) {
        setGroupBalances(await res.json())
        setShowGroupBalances(true)
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to fetch group balances",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUserBalances = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/balances`)
      if (res.ok) {
        setUserBalances(await res.json())
        setShowUserBalances(true)
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to fetch group balances",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Balance Viewer
            </h1>
            <p className="text-lg text-gray-600 mt-2">Track expenses and settle balances with ease</p>
          </div>
        </div>

        {/* Group Balances */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white -my-6">
          <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              Group Balances
            </CardTitle>
            <CardDescription className="text-blue-100">See who owes whom in a specific group</CardDescription>
          </CardHeader>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="groupSelect" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Select Group
                </Label>
                <UiSelect value={selectedGroupId} onValueChange={setSelectedGroupId}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-blue-500 transition-colors">
                    <SelectValue placeholder="Choose a group to view balances" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchGroupBalances}
                  disabled={loading || !selectedGroupId}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      View Balances
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showGroupBalances && groupBalances.length > 0 && (
              <div className="space-y-4">
                <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-800">Balances for</h4>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                    {selectedGroup?.name}
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {groupBalances.map((balance, index) => (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="bg-red-50 text-red-700 border-red-200 px-3 py-1 font-medium"
                            >
                              {balance.user_owes.name}
                            </Badge>
                            <div className="flex items-center gap-1">
                              <ArrowRight className="h-4 w-4 text-gray-400" />
                              <span className="text-xs text-gray-500 font-medium">owes</span>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 px-3 py-1 font-medium"
                            >
                              {balance.user_owed.name}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="text-xl font-bold text-green-600">{balance.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            { showGroupBalances && groupBalances.length === 0 && selectedGroupId && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CreditCard className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">All Settled Up!</h3>
                <p className="text-gray-500">No outstanding balances in this group</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Balances */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white -my-6">
          <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              Personal Balance Summary
            </CardTitle>
            <CardDescription className="text-indigo-100">
              View all balances for a specific user across all groups
            </CardDescription>
          </CardHeader>
          </div>
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="userId" className="text-sm font-semibold text-gray-700 mb-2 block">
                  User ID
                </Label>
                <UiSelect value={userId} onValueChange={setUserId}>
                  <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-indigo-500 transition-colors">
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {allUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          {user.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={fetchUserBalances}
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <User className="mr-2 h-4 w-4" />
                      View Balances
                    </>
                  )}
                </Button>
              </div>
            </div>

            {showUserBalances && userBalances.length > 0 && (
              <div className="space-y-6">
                <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-semibold text-gray-800">All balances for</h4>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 px-3 py-1">
                    User ID: {userId}
                  </Badge>
                </div>

                <div className="space-y-6">
                  {userBalances.map((groupBalance, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 overflow-hidden shadow-sm"
                    >
                      {/* Group header */}
                      <div className="bg-gradient-to-r from-gray-800 to-gray-700 text-white p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                              <Users className="h-5 w-5" />
                            </div>
                            <div>
                              <h5 className="font-semibold text-lg">{groupBalance.group.name}</h5>
                              <p className="text-gray-300 text-sm">Group ID: {groupBalance.group.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-300">Total Expenses</p>
                            <p className="text-xl font-bold text-white">
                              ${groupBalance.group.total_expenses.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Group members */}
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-xs text-gray-300 mb-2">Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {groupBalance.group.users.map((u, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-white/20 text-white border-white/30 text-xs"
                              >
                                {u.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Balances */}
                      <div className="p-4">
                        {groupBalance.balances.length > 0 ? (
                          <div className="space-y-3">
                            {groupBalance.balances.map((balance, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant="outline"
                                    className="bg-red-50 text-red-700 border-red-200 text-xs font-medium"
                                  >
                                    {balance.user_owes.name}
                                  </Badge>
                                  <ArrowRight className="h-3 w-3 text-gray-400" />
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 text-xs font-medium"
                                  >
                                    {balance.user_owed.name}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4 text-green-600" />
                                  <span className="font-bold text-green-600">{balance.amount.toFixed(2)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                              <CreditCard className="h-6 w-6 text-green-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-600">All settled up in this group!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showUserBalances && userBalances.length === 0 && userId && !loading && (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Balances Found</h3>
                <p className="text-gray-500">This user has no outstanding balances</p>
              </div>
            )}
          </CardContent>
        </Card>

        {groups.length === 0 && (
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl shadow-lg mb-6">
                <Calculator className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Groups Available</h3>
              <p className="text-gray-500 text-lg mb-6">Create your first group to start tracking expenses!</p>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200">
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

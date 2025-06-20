/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Receipt, Plus, DollarSign, Users, Percent, Calculator, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  name: string
}

interface Group {
  id: number
  name: string
  users: User[]
}

interface PercentageSplit {
  user_id: string
  percentage: number
}

const API_BASE_URL = "http://localhost:8000"

export function ExpenseManager() {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string>("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [paidBy, setPaidBy] = useState("")
  const [splitType, setSplitType] = useState<"equal" | "percentage">("equal")
  const [percentageSplits, setPercentageSplits] = useState<PercentageSplit[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchGroups()
  }, [])

  useEffect(() => {
    if (selectedGroupId && splitType === "percentage") {
      const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId)
      if (selectedGroup) {
        setPercentageSplits(
          selectedGroup.users.map((user) => ({
            user_id: user.id.toString(),
            percentage: 0,
          })),
        )
      }
    }
  }, [selectedGroupId, splitType, groups])

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

  const updatePercentage = (userId: string, percentage: number) => {
    setPercentageSplits((prev) => prev.map((split) => (split.user_id === userId ? { ...split, percentage } : split)))
  }

  const getTotalPercentage = () => {
    return percentageSplits.reduce((sum, split) => sum + split.percentage, 0)
  }

  const addExpense = async () => {
    if (!selectedGroupId || !description.trim() || !amount || !paidBy) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (splitType === "percentage") {
      const totalPercentage = getTotalPercentage()
      if (Math.abs(totalPercentage - 100) > 0.01) {
        toast({
          title: "Error",
          description: "Percentages must add up to 100%",
          variant: "destructive",
        })
        return
      }
    }

    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const expenseData: any = {
        description,
        amount: Number.parseFloat(amount),
        paid_by: Number.parseInt(paidBy, 10),
        split_type: splitType,
      }

      if (splitType === "percentage") {
        expenseData.splits = percentageSplits
          .filter((split) => split.percentage > 0)
          .map((split) => ({
            user_id: Number.parseInt(split.user_id, 10),
            percentage: split.percentage,
          }))
      } else if (splitType === "equal") {
        const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId)
        if (selectedGroup) {
          const numUsers = selectedGroup.users.length
          const equalSplitAmount = Number.parseFloat(amount) / numUsers
          const equalPercentage = Number((100 / numUsers).toFixed(2)) // e.g. 33.33

          expenseData.splits = selectedGroup.users.map((user) => ({
            user_id: user.id,
            amount: equalSplitAmount,
            percentage: equalPercentage,
          }))
        }
      }

      const response = await fetch(`${API_BASE_URL}/groups/${selectedGroupId}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      })

      if (response.ok) {
        // Reset form
        setDescription("")
        setAmount("")
        setPaidBy("")
        setSplitType("equal")
        setPercentageSplits([])

        toast({
          title: "Success",
          description: "Expense added successfully!",
        })
      } else {
        throw new Error("Failed to add expense")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedGroup = groups.find((g) => g.id.toString() === selectedGroupId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl shadow-lg">
            <Receipt className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Expense Manager
            </h1>
            <p className="text-lg text-gray-600 mt-2">Record and split expenses with your group</p>
          </div>
        </div>

        {/* Main Form */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white -my-6">
          <CardHeader className="px-6 py-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-white/20 rounded-lg">
                <Receipt className="h-6 w-6" />
              </div>
              Add New Expense
            </CardTitle>
            <CardDescription className="text-green-100">
              Record a shared expense and split it among group members
            </CardDescription>
          </CardHeader>
        </div>
          <CardContent className="p-6 space-y-6">
            {/* Group Selection */}
            <div>
              <Label htmlFor="group" className="text-sm font-semibold text-gray-700 mb-2 block">
                Select Group
              </Label>
              <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors">
                  <SelectValue placeholder="Choose a group for this expense" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id.toString()}>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {group.name} ({group.users.length} members)
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedGroup && (
              <>
                <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                {/* Expense Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="description" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="e.g., Dinner at restaurant, Uber ride, Groceries"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[100px] border-2 border-gray-200 focus:border-green-500 transition-colors resize-none"
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Amount ($)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="h-12 pl-10 border-2 border-gray-200 focus:border-green-500 transition-colors text-lg font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="paidBy" className="text-sm font-semibold text-gray-700 mb-2 block">
                        Paid By
                      </Label>
                      <Select value={paidBy} onValueChange={setPaidBy}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500 transition-colors">
                          <SelectValue placeholder="Who paid for this expense?" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedGroup.users.map((user) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                {user.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Split Type */}
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">Split Type</Label>
                      <RadioGroup
                        value={splitType}
                        onValueChange={(value: "equal" | "percentage") => setSplitType(value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                          <RadioGroupItem value="equal" id="equal" />
                          <Label htmlFor="equal" className="flex items-center gap-2 cursor-pointer">
                            <Calculator className="h-4 w-4 text-green-600" />
                            Equal Split
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                          <RadioGroupItem value="percentage" id="percentage" />
                          <Label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                            <Percent className="h-4 w-4 text-green-600" />
                            Custom Split
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>

                {/* Percentage Splits */}
                {splitType === "percentage" && (
                  <div className="space-y-4">
                    <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Custom Percentage Distribution
                      </Label>
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                        <div className="grid gap-3">
                          {percentageSplits.map((split) => {
                            const user = selectedGroup.users.find((u) => u.id.toString() === split.user_id)
                            return (
                              <div
                                key={split.user_id}
                                className="flex items-center gap-4 p-3 bg-white rounded-lg border border-green-100"
                              >
                                <div className="flex items-center gap-3 flex-1">
                                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-semibold">
                                    {user?.name.charAt(0).toUpperCase()}
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200 font-medium"
                                  >
                                    {user?.name}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    placeholder="0"
                                    value={split.percentage || ""}
                                    onChange={(e) =>
                                      updatePercentage(split.user_id, Number.parseFloat(e.target.value) || 0)
                                    }
                                    className="w-20 h-10 text-center border-2 border-gray-200 focus:border-green-500 transition-colors font-semibold"
                                  />
                                  <Percent className="h-4 w-4 text-gray-500" />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 p-3 bg-white rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-gray-700">Total Percentage:</span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-lg font-bold ${Math.abs(getTotalPercentage() - 100) > 0.01 ? "text-red-600" : "text-green-600"}`}
                              >
                                {getTotalPercentage().toFixed(1)}%
                              </span>
                              {Math.abs(getTotalPercentage() - 100) > 0.01 && (
                                <Badge variant="destructive" className="text-xs">
                                  Must equal 100%
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

                <Button
                  onClick={addExpense}
                  disabled={loading}
                  className="w-full h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-lg shadow-lg transition-all duration-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Adding Expense...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-5 w-5" />
                      Add Expense
                    </>
                  )}
                </Button>
              </>
            )}

            {groups.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-400 to-pink-400 rounded-2xl shadow-lg mb-6">
                  <Receipt className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Groups Available</h3>
                <p className="text-gray-500 text-lg mb-6">Create your first group to start adding expenses!</p>
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-lg shadow-lg transition-all duration-200">
                  Create Your First Group
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

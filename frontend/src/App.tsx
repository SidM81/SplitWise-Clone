"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupManager } from "@/components/group-manager"
import { ExpenseManager } from "@/components/expense-manager"
import { BalanceViewer } from "@/components/balance-viewer"
import { FloatingChat } from "@/components/floating-chat"
import { Users, Receipt, Calculator, Wallet, Sparkles } from "lucide-react"

export default function SplitWiseApp() {
  const [activeTab, setActiveTab] = useState("groups")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
              SplitWise
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Track shared expenses and settle up with friends effortlessly
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-500 font-medium">Beautiful • Simple • Powerful</span>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger
                value="groups"
                className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-semibold"
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Users className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">Groups</span>
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-semibold"
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Receipt className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">Expenses</span>
              </TabsTrigger>
              <TabsTrigger
                value="balances"
                className="flex items-center gap-3 px-6 py-4 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 font-semibold"
              >
                <div className="p-1.5 rounded-lg bg-white/20">
                  <Calculator className="h-5 w-5" />
                </div>
                <span className="hidden sm:inline">Balances</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="relative">
            <TabsContent value="groups" className="mt-0">
              <div className="animate-in fade-in-50 duration-200">
                <GroupManager />
              </div>
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <div className="animate-in fade-in-50 duration-200">
                <ExpenseManager />
              </div>
            </TabsContent>

            <TabsContent value="balances" className="mt-0">
              <div className="animate-in fade-in-50 duration-200">
                <BalanceViewer />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-white/20">
          <p className="text-gray-500 text-sm">Made with ❤️ for better expense sharing</p>
        </div>
      </div>
      <FloatingChat />
    </div>
  )
}

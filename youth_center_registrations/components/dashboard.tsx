"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Calendar, Trophy, TrendingUp, Activity, Sparkles, Star } from "lucide-react"

interface DashboardStats {
  totalMembers: number
  newThisMonth: number
  categories: {
    karate: number
    tableTennis: number
    chess: number
    other: number
  }
  recentRegistrations: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    newThisMonth: 0,
    categories: { karate: 0, tableTennis: 0, chess: 0, other: 0 },
    recentRegistrations: [],
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = () => {
    try {
      const members = JSON.parse(localStorage.getItem("youthCenterMembers") || "[]")
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const newThisMonth = members.filter((member: any) => {
        const regDate = new Date(member.registrationDate)
        return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear
      }).length

      const categories = {
        karate: members.filter((m: any) => m.category === "karate").length,
        tableTennis: members.filter((m: any) => m.category === "table-tennis").length,
        chess: members.filter((m: any) => m.category === "chess").length,
        other: members.filter((m: any) => m.category === "other").length,
      }

      const recentRegistrations = members
        .sort((a: any, b: any) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        .slice(0, 5)

      setStats({
        totalMembers: members.length,
        newThisMonth,
        categories,
        recentRegistrations,
      })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    }
  }

  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      karate: "الكاراتيه",
      "table-tennis": "تنس الطاولة",
      chess: "الشطرنج",
      other: "أخرى",
    }
    return categories[category] || category
  }

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="text-center py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-green-600/10 rounded-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Sparkles className="h-12 w-12 text-blue-500" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 bg-clip-text text-transparent">
              مرحباً بكم في دار الشباب سليمي إبراهيم
            </h1>
            <Star className="h-12 w-12 text-purple-500" />
          </div>
          <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            نظام إدارة التسجيل الإلكتروني المتطور - نحو مستقبل رياضي وثقافي مشرق لشباب بئر العاتر
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-secondary opacity-90"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-white">إجمالي المنخرطين</CardTitle>
            <div className="bg-white/20 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-white mb-2">{stats.totalMembers}</div>
            <p className="text-sm text-green-100">منخرط مسجل في النظام</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-primary opacity-90"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-white">تسجيلات هذا الشهر</CardTitle>
            <div className="bg-white/20 p-3 rounded-xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-white mb-2">{stats.newThisMonth}</div>
            <p className="text-sm text-blue-100">منخرط جديد هذا الشهر</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-purple opacity-90"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-white">الأنشطة المتاحة</CardTitle>
            <div className="bg-white/20 p-3 rounded-xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-white mb-2">4</div>
            <p className="text-sm text-purple-100">نشاط رياضي وثقافي متنوع</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-accent opacity-90"></div>
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-white">معدل النمو</CardTitle>
            <div className="bg-white/20 p-3 rounded-xl">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative">
            <div className="text-4xl font-bold text-white mb-2">
              +
              {stats.newThisMonth > 0
                ? Math.round((stats.newThisMonth / Math.max(stats.totalMembers - stats.newThisMonth, 1)) * 100)
                : 0}
              %
            </div>
            <p className="text-sm text-orange-100">نمو شهري في التسجيلات</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <Card className="card-shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-3xl text-green-700 flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <Trophy className="h-8 w-8 text-green-600" />
              </div>
              <span>توزيع المنخرطين حسب الفئات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100 hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"></div>
                  <span className="font-semibold text-lg text-gray-700">الكاراتيه</span>
                </div>
                <div className="text-3xl font-bold text-red-600">{stats.categories.karate}</div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-lg"></div>
                  <span className="font-semibold text-lg text-gray-700">تنس الطاولة</span>
                </div>
                <div className="text-3xl font-bold text-blue-600">{stats.categories.tableTennis}</div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-violet-50 rounded-2xl border border-purple-100 hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-500 rounded-full shadow-lg"></div>
                  <span className="font-semibold text-lg text-gray-700">الشطرنج</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">{stats.categories.chess}</div>
              </div>

              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100 hover-lift">
                <div className="flex items-center space-x-4">
                  <div className="w-6 h-6 bg-gradient-to-r from-gray-500 to-slate-500 rounded-full shadow-lg"></div>
                  <span className="font-semibold text-lg text-gray-700">أنشطة أخرى</span>
                </div>
                <div className="text-3xl font-bold text-gray-600">{stats.categories.other}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow-lg border-0 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <CardTitle className="text-3xl text-blue-700 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <span>آخر التسجيلات</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {stats.recentRegistrations.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <div className="bg-gray-100 p-6 rounded-2xl inline-block mb-6">
                  <Users className="h-16 w-16 text-gray-300 mx-auto" />
                </div>
                <p className="text-xl font-medium">لا توجد تسجيلات حديثة</p>
                <p className="text-gray-400 mt-2">ستظهر التسجيلات الجديدة هنا</p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.recentRegistrations.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-100 hover-lift"
                  >
                    <div>
                      <div className="font-semibold text-lg text-gray-900">{member.fullName}</div>
                      <div className="text-sm text-gray-500 mt-1">{getCategoryName(member.category)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {member.registrationNumber}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{member.registrationDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="card-shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <CardTitle className="text-3xl text-purple-700 flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Sparkles className="h-8 w-8 text-purple-600" />
            </div>
            <span>الإجراءات السريعة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl text-center hover-lift cursor-pointer border border-green-200 group">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-green-100 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="h-16 w-16 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-3">تسجيل منخرط جديد</h3>
                <p className="text-green-600 text-lg">إضافة منخرط جديد إلى النظام بسهولة</p>
              </div>
            </div>

            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-blue-50 to-cyan-100 rounded-2xl text-center hover-lift cursor-pointer border border-blue-200 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-blue-100 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-800 mb-3">عرض المنخرطين</h3>
                <p className="text-blue-600 text-lg">استعراض وإدارة قائمة المنخرطين</p>
              </div>
            </div>

            <div className="relative overflow-hidden p-8 bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl text-center hover-lift cursor-pointer border border-purple-200 group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="bg-purple-100 p-6 rounded-2xl inline-block mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="h-16 w-16 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-purple-800 mb-3">الإحصائيات</h3>
                <p className="text-purple-600 text-lg">عرض تقارير وإحصائيات مفصلة</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

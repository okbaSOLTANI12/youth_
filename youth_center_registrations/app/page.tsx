"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, Home, Sparkles } from "lucide-react"
import RegistrationForm from "@/components/registration-form"
import MembersList from "@/components/members-list"
import Dashboard from "@/components/dashboard"
import Logo from "@/components/logo"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "register" | "members">("dashboard")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-purple-600/20"></div>
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Logo />
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-5xl font-bold mb-4 text-white text-shadow-lg">دار الشباب سليمي إبراهيم</h1>
                <p className="text-blue-100 text-2xl font-medium mb-2">بئر العاتر - ولاية تبسة</p>
                <div className="flex items-center space-x-2 text-blue-200">
                  <Sparkles className="h-5 w-5" />
                  <p className="text-lg">نظام إدارة التسجيل الإلكتروني المتطور</p>
                </div>
              </div>
            </div>
            <div className="text-right glass-effect rounded-2xl p-8 border border-white/30">
              <p className="font-bold text-xl mb-3 text-white">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p className="text-blue-100 font-medium text-lg">وزارة الشباب والرياضة</p>
              <p className="text-blue-200 text-base">ديوان مؤسسات الشباب تبسة</p>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Navigation */}
      <nav className="relative bg-white/80 backdrop-blur-lg shadow-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center space-x-3 px-8 py-6 border-b-4 transition-all duration-300 font-semibold text-lg relative overflow-hidden group ${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50"
                  : "border-transparent text-gray-600 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:border-blue-200"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Home className="h-6 w-6 relative z-10" />
              <span className="relative z-10">الرئيسية</span>
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex items-center space-x-3 px-8 py-6 border-b-4 transition-all duration-300 font-semibold text-lg relative overflow-hidden group ${
                activeTab === "register"
                  ? "border-green-500 text-green-600 bg-gradient-to-r from-green-50 to-emerald-50"
                  : "border-transparent text-gray-600 hover:text-green-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-transparent hover:border-green-200"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <UserPlus className="h-6 w-6 relative z-10" />
              <span className="relative z-10">تسجيل منخرط جديد</span>
            </button>
            <button
              onClick={() => setActiveTab("members")}
              className={`flex items-center space-x-3 px-8 py-6 border-b-4 transition-all duration-300 font-semibold text-lg relative overflow-hidden group ${
                activeTab === "members"
                  ? "border-purple-500 text-purple-600 bg-gradient-to-r from-purple-50 to-violet-50"
                  : "border-transparent text-gray-600 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-transparent hover:border-purple-200"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Users className="h-6 w-6 relative z-10" />
              <span className="relative z-10">قائمة المنخرطين</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        {activeTab === "dashboard" && <Dashboard />}

        {activeTab === "register" && (
          <Card className="max-w-6xl mx-auto card-shadow-lg border-0 overflow-hidden">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 gradient-secondary opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 via-transparent to-emerald-600/20"></div>
              <div className="relative text-center py-8">
                <CardTitle className="text-5xl text-white mb-6 font-bold text-shadow">تسجيل منخرط جديد</CardTitle>
                <CardDescription className="text-2xl text-green-100 font-medium">
                  يرجى ملء جميع البيانات المطلوبة لإتمام عملية التسجيل بنجاح
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-12 bg-gradient-to-br from-white to-green-50/30">
              <RegistrationForm />
            </CardContent>
          </Card>
        )}

        {activeTab === "members" && (
          <Card className="card-shadow-lg border-0 overflow-hidden">
            <CardHeader className="relative overflow-hidden">
              <div className="absolute inset-0 gradient-purple opacity-90"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-violet-600/20"></div>
              <div className="relative py-8">
                <CardTitle className="text-5xl text-white flex items-center space-x-6 font-bold text-shadow justify-center">
                  <Users className="h-12 w-12" />
                  <span>قائمة المنخرطين</span>
                </CardTitle>
                <CardDescription className="text-2xl text-purple-100 text-center mt-4 font-medium">
                  إدارة وعرض جميع المنخرطين المسجلين مع إمكانيات التصدير والطباعة المتقدمة
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-10 bg-gradient-to-br from-white to-purple-50/30">
              <MembersList />
            </CardContent>
          </Card>
        )}
      </main>

      {/* Enhanced Footer */}
      <footer className="relative mt-24 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20"></div>
        <div className="relative container mx-auto px-6 py-16">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-8 mb-10">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <Logo />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">دار الشباب سليمي إبراهيم</h3>
                <p className="text-blue-200 text-xl">نظام إدارة التسجيل الإلكتروني المتطور</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              <div className="glass-effect rounded-2xl p-8 border border-white/30 hover-lift">
                <h4 className="font-bold text-2xl mb-4 text-white">معلومات الاتصال</h4>
                <p className="text-blue-200 text-lg mb-2">بئر العاتر - ولاية تبسة</p>
                <p className="text-blue-200 text-lg">الجزائر</p>
              </div>
              <div className="glass-effect rounded-2xl p-8 border border-white/30 hover-lift">
                <h4 className="font-bold text-2xl mb-4 text-white">الأنشطة المتاحة</h4>
                <p className="text-blue-200 text-lg mb-2">الكاراتيه • تنس الطاولة</p>
                <p className="text-blue-200 text-lg">الشطرنج • أنشطة أخرى</p>
              </div>
              <div className="glass-effect rounded-2xl p-8 border border-white/30 hover-lift">
                <h4 className="font-bold text-2xl mb-4 text-white">أوقات العمل</h4>
                <p className="text-blue-200 text-lg mb-2">السبت - الخميس</p>
                <p className="text-blue-200 text-lg">8:00 - 17:00</p>
              </div>
            </div>

            <div className="border-t border-white/30 pt-8">
              <p className="text-2xl mb-3 text-white font-semibold">© 2025 دار الشباب سليمي إبراهيم - بئر العاتر</p>
              <p className="text-blue-100 text-lg mb-2">
                وزارة الشباب والرياضة - الجمهورية الجزائرية الديمقراطية الشعبية
              </p>
              <p className="text-blue-200 mt-6">   
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

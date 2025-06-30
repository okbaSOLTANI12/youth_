"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Printer,
  Download,
  Trash2,
  FileSpreadsheet,
  Users,
  Filter,
  CheckSquare,
  FolderOpen,
  Sparkles,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import * as XLSX from "xlsx"
import JSZip from "jszip"

function base64ToArrayBuffer(base64: string) {
  const binary = atob(base64)
  const len = binary.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

function getFileInfo(f?: { name: string; type: string; data: string } | null): {
  ok: boolean
  name?: string
  buffer?: ArrayBuffer
} {
  if (!f || !f.data) return { ok: false }
  return { ok: true, name: f.name, buffer: base64ToArrayBuffer(f.data) }
}

// --- helper: save workbook in the browser ---
function saveWorkbook(workbook: XLSX.WorkBook, filename: string) {
  const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" })
  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

interface Member {
  id: number
  fullName: string
  birthDate: string
  birthPlace?: string
  address?: string
  age: number
  category: string
  registrationNumber: string
  registrationDate: string
  phone?: string
  email?: string
  guardianName?: string
  guardianPhone?: string
  notes?: string
  photo?: { name: string; type: string; data: string } | null
  birthCertificate?: { name: string; type: string; data: string } | null
  parentalConsent?: { name: string; type: string; data: string } | null
  medicalCertificate?: { name: string; type: string; data: string } | null
}

export default function MembersList() {
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Set<number>>(new Set())
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [ageFilter, setAgeFilter] = useState("all")
  const [showFilters, setShowFilters] = useState(false)

  // الملف الرئيسي للإكسل
  const MAIN_EXCEL_FILENAME = "سجل_منخرطي_دار_الشباب_سليمي_إبراهيم.xlsx"

  useEffect(() => {
    loadMembers()
    // تحديث الملف الرئيسي كل 10 دقائق
    const interval = setInterval(updateMainExcelFile, 10 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    filterMembers()
  }, [members, searchTerm, categoryFilter, ageFilter])

  useEffect(() => {
    // تحديث الملف عند تغيير البيانات
    if (members.length > 0) {
      updateMainExcelFile()
    }
  }, [members])

  const loadMembers = () => {
    try {
      const saved = JSON.parse(localStorage.getItem("youthCenterMembers") || "[]")
      setMembers(saved)
    } catch (error) {
      console.error("Error loading members:", error)
      toast({
        title: "خطأ في تحميل البيانات",
        description: "حدث خطأ أثناء تحميل قائمة المنخرطين",
        variant: "destructive",
      })
    }
  }

  const filterMembers = () => {
    let data = [...members]

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      data = data.filter(
        (m) =>
          m.fullName.toLowerCase().includes(q) ||
          m.registrationNumber.toLowerCase().includes(q) ||
          (m.phone && m.phone.includes(q)),
      )
    }

    if (categoryFilter !== "all") {
      data = data.filter((m) => m.category === categoryFilter)
    }

    if (ageFilter !== "all") {
      if (ageFilter === "minor") {
        data = data.filter((m) => m.age < 18)
      } else if (ageFilter === "adult") {
        data = data.filter((m) => m.age >= 18)
      }
    }

    data.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    setFilteredMembers(data)
  }

  const categories: Record<string, string> = {
    karate: "الكاراتيه",
    "table-tennis": "تنس الطاولة",
    chess: "الشطرنج",
    other: "أخرى",
  }

  const catColors: Record<string, string> = {
    karate: "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200",
    "table-tennis": "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200",
    chess: "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200",
    other: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200",
  }

  // تحديث الملف الرئيسي للإكسل
  const updateMainExcelFile = () => {
    if (members.length === 0) return

    try {
      const workbook = XLSX.utils.book_new()

      // ورقة البيانات الأساسية
      const mainData = members.map((member, index) => ({
        "الرقم التسلسلي": index + 1,
        "رقم التسجيل": member.registrationNumber,
        "الاسم الكامل": member.fullName,
        "تاريخ الميلاد": member.birthDate,
        "مكان الميلاد": member.birthPlace || "",
        العنوان: member.address || "",
        العمر: member.age,
        "الحالة العمرية": member.age < 18 ? "قاصر" : "بالغ",
        الفئة: categories[member.category],
        "تاريخ التسجيل": member.registrationDate,
        "رقم الهاتف": member.phone || "",
        "البريد الإلكتروني": member.email || "",
        "اسم الولي": member.guardianName || "",
        "هاتف الولي": member.guardianPhone || "",
        ملاحظات: member.notes || "",
        "الصورة الشخصية": member.photo?.data ? "✓ مرفقة" : "✗ غير مرفقة",
        "شهادة الميلاد": member.birthCertificate?.data ? "✓ مرفقة" : "✗ غير مرفقة",
        "الشهادة الطبية": member.medicalCertificate?.data
          ? "✓ مرفقة"
          : member.category === "karate"
            ? "✗ غير مرفقة"
            : "غير مطلوبة",
        "السماح الأبوي": member.parentalConsent?.data ? "✓ مرفق" : member.age >= 18 ? "غير مطلوب" : "✗ غير مرفق",
        "حالة الملف": (() => {
          const hasPhoto = member.photo?.data
          const hasBirthCert = member.birthCertificate?.data
          const hasConsent = member.age >= 18 || member.parentalConsent?.data
          const hasMedical = member.category !== "karate" || member.medicalCertificate?.data
          return hasPhoto && hasBirthCert && hasConsent && hasMedical ? "مكتمل" : "ناقص"
        })(),
      }))

      const mainSheet = XLSX.utils.json_to_sheet(mainData)

      // تنسيق الأعمدة
      const colWidths = [
        { wch: 8 }, // الرقم التسلسلي
        { wch: 15 }, // رقم التسجيل
        { wch: 25 }, // الاسم الكامل
        { wch: 15 }, // تاريخ الميلاد
        { wch: 20 }, // مكان الميلاد
        { wch: 30 }, // العنوان
        { wch: 8 }, // العمر
        { wch: 12 }, // الحالة العمرية
        { wch: 15 }, // الفئة
        { wch: 15 }, // تاريخ التسجيل
        { wch: 15 }, // رقم الهاتف
        { wch: 25 }, // البريد الإلكتروني
        { wch: 20 }, // اسم الولي
        { wch: 15 }, // هاتف الولي
        { wch: 30 }, // ملاحظات
        { wch: 15 }, // الصورة الشخصية
        { wch: 15 }, // شهادة الميلاد
        { wch: 15 }, // الشهادة الطبية
        { wch: 15 }, // السماح الأبوي
        { wch: 12 }, // حالة الملف
      ]
      mainSheet["!cols"] = colWidths

      XLSX.utils.book_append_sheet(workbook, mainSheet, "سجل المنخرطين")

      // ورقة الإحصائيات
      const currentDate = new Date()
      const currentMonth = currentDate.getMonth()
      const currentYear = currentDate.getFullYear()

      const thisMonthRegistrations = members.filter((m) => {
        const regDate = new Date(m.registrationDate)
        return regDate.getMonth() === currentMonth && regDate.getFullYear() === currentYear
      }).length

      const stats = [
        { البيان: "إجمالي المنخرطين", العدد: members.length },
        { البيان: "تسجيلات هذا الشهر", العدد: thisMonthRegistrations },
        { البيان: "", العدد: "" },
        { البيان: "توزيع الفئات:", العدد: "" },
        { البيان: "الكاراتيه", العدد: members.filter((m) => m.category === "karate").length },
        { البيان: "تنس الطاولة", العدد: members.filter((m) => m.category === "table-tennis").length },
        { البيان: "الشطرنج", العدد: members.filter((m) => m.category === "chess").length },
        { البيان: "أنشطة أخرى", العدد: members.filter((m) => m.category === "other").length },
        { البيان: "", العدد: "" },
        { البيان: "توزيع الأعمار:", العدد: "" },
        { البيان: "القاصرون (أقل من 18)", العدد: members.filter((m) => m.age < 18).length },
        { البيان: "البالغون (18 فأكثر)", العدد: members.filter((m) => m.age >= 18).length },
        { البيان: "", العدد: "" },
        { البيان: "حالة الملفات:", العدد: "" },
        {
          البيان: "ملفات مكتملة",
          العدد: members.filter((m) => {
            const hasPhoto = m.photo?.data
            const hasBirthCert = m.birthCertificate?.data
            const hasConsent = m.age >= 18 || m.parentalConsent?.data
            const hasMedical = m.category !== "karate" || m.medicalCertificate?.data
            return hasPhoto && hasBirthCert && hasConsent && hasMedical
          }).length,
        },
        {
          البيان: "ملفات ناقصة",
          العدد: members.filter((m) => {
            const hasPhoto = m.photo?.data
            const hasBirthCert = m.birthCertificate?.data
            const hasConsent = m.age >= 18 || m.parentalConsent?.data
            const hasMedical = m.category !== "karate" || m.medicalCertificate?.data
            return !(hasPhoto && hasBirthCert && hasConsent && hasMedical)
          }).length,
        },
        { البيان: "", العدد: "" },
        { البيان: "تاريخ آخر تحديث", العدد: new Date().toLocaleString("ar-DZ") },
      ]

      const statsSheet = XLSX.utils.json_to_sheet(stats)
      XLSX.utils.book_append_sheet(workbook, statsSheet, "الإحصائيات")

      // ورقة المنخرطين حسب الفئة
      Object.entries(categories).forEach(([key, name]) => {
        const categoryMembers = members.filter((m) => m.category === key)
        if (categoryMembers.length > 0) {
          const categoryData = categoryMembers.map((member, index) => ({
            الرقم: index + 1,
            "رقم التسجيل": member.registrationNumber,
            "الاسم الكامل": member.fullName,
            العمر: member.age,
            "تاريخ التسجيل": member.registrationDate,
            "رقم الهاتف": member.phone || "",
            "اسم الولي": member.guardianName || "",
          }))
          const categorySheet = XLSX.utils.json_to_sheet(categoryData)
          XLSX.utils.book_append_sheet(workbook, categorySheet, name)
        }
      })

      saveWorkbook(workbook, MAIN_EXCEL_FILENAME)
      console.log("تم تحديث الملف الرئيسي بنجاح")
    } catch (error) {
      console.error("خطأ في تحديث الملف الرئيسي:", error)
    }
  }

  // إنشاء أرشيف شامل مع الصور
  const createCompleteArchive = async () => {
    if (members.length === 0) {
      toast({
        title: "لا توجد بيانات",
        description: "لا توجد بيانات منخرطين لإنشاء الأرشيف",
        variant: "destructive",
      })
      return
    }

    try {
      const zip = new JSZip()

      // إنشاء مجلد بيانات المنخرطين
      const mainFolder = zip.folder("بيانات المنخرطين")

      if (!mainFolder) {
        throw new Error("فشل في إنشاء المجلد الرئيسي")
      }

      // إنشاء مجلد لكل منخرط مع ملفاته المرفوعة فقط
      for (const member of members) {
        const memberFolder = mainFolder.folder(member.fullName)
        if (!memberFolder) continue

        // إضافة ملف معلومات المنخرط
        const memberInfo = `
معلومات المنخرط
================

رقم التسجيل: ${member.registrationNumber}
الاسم الكامل: ${member.fullName}
تاريخ الميلاد: ${member.birthDate}
مكان الميلاد: ${member.birthPlace || "غير محدد"}
العنوان: ${member.address || "غير محدد"}
العمر: ${member.age} سنة
الفئة: ${categories[member.category]}
تاريخ التسجيل: ${member.registrationDate}
رقم الهاتف: ${member.phone || "غير محدد"}
البريد الإلكتروني: ${member.email || "غير محدد"}

${
  member.age < 18
    ? `
بيانات الولي:
اسم الولي: ${member.guardianName || "غير محدد"}
هاتف الولي: ${member.guardianPhone || "غير محدد"}
`
    : ""
}

ملاحظات: ${member.notes || "لا توجد ملاحظات"}

تاريخ إنشاء هذا الملف: ${new Date().toLocaleString("ar-DZ")}
      `

        memberFolder.file("معلومات_المنخرط.txt", memberInfo)

        // إضافة الصور والملفات المرفوعة بأسماء عربية
        if (member.photo) {
          const { ok, buffer } = getFileInfo(member.photo)
          if (ok && buffer) {
            const extension = member.photo.name.split(".").pop() || "jpg"
            memberFolder.file(`الصورة_الشخصية.${extension}`, buffer)
          }
        }

        if (member.birthCertificate) {
          const { ok, buffer } = getFileInfo(member.birthCertificate)
          if (ok && buffer) {
            const extension = member.birthCertificate.name.split(".").pop() || "pdf"
            memberFolder.file(`شهادة_الميلاد.${extension}`, buffer)
          }
        }

        if (member.medicalCertificate) {
          const { ok, buffer } = getFileInfo(member.medicalCertificate)
          if (ok && buffer) {
            const extension = member.medicalCertificate.name.split(".").pop() || "pdf"
            memberFolder.file(`الشهادة_الطبية_العامة_والصدرية.${extension}`, buffer)
          }
        }

        if (member.parentalConsent) {
          const { ok, buffer } = getFileInfo(member.parentalConsent)
          if (ok && buffer) {
            const extension = member.parentalConsent.name.split(".").pop() || "pdf"
            memberFolder.file(`السماح_الأبوي.${extension}`, buffer)
          }
        }
      }

      // إنشاء ملف README
      const readmeContent = `
أرشيف ملفات منخرطي دار الشباب سليمي إبراهيم
==========================================

هذا الأرشيف يحتوي على الملفات المرفوعة من قبل المنخرطين:

محتويات الأرشيف:
- مجلدات منفصلة لكل منخرط تحتوي على:
  • ملف معلومات المنخرط (نص)
  • الصورة الشخصية (إذا تم رفعها)
  • شهادة الميلاد (إذا تم رفعها)
  • الشهادة الطبية العامة والصدرية (للكاراتيه - إذا تم رفعها)
  • السماح الأبوي (للقاصرين - إذا تم رفعه)

إحصائيات الأرشيف:
- إجمالي المنخرطين: ${members.length}
- الكاراتيه: ${members.filter((m) => m.category === "karate").length}
- تنس الطاولة: ${members.filter((m) => m.category === "table-tennis").length}
- الشطرنج: ${members.filter((m) => m.category === "chess").length}
- أنشطة أخرى: ${members.filter((m) => m.category === "other").length}

ملاحظة: هذا الأرشيف يحتوي فقط على الملفات المرفوعة من قبل المنخرطين
للحصول على ملف Excel بالبيانات، استخدم خيار "تحديث الملف الرئيسي"

تاريخ إنشاء الأرشيف: ${new Date().toLocaleString("ar-DZ")}

دار الشباب سليمي إبراهيم - بئر العاتر
ديوان مؤسسات الشباب تبسة
    `

      zip.file("اقرأني.txt", readmeContent)

      // تحميل الأرشيف
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `أرشيف_ملفات_المنخرطين_${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "تم إنشاء الأرشيف بنجاح",
        description: `تم إنشاء أرشيف يحتوي على ملفات ${members.length} منخرط`,
      })
    } catch (error) {
      console.error("خطأ في إنشاء الأرشيف:", error)
      toast({
        title: "خطأ في إنشاء الأرشيف",
        description: "حدث خطأ أثناء إنشاء الأرشيف الشامل",
        variant: "destructive",
      })
    }
  }

  const exportToExcel = (selectedOnly = false) => {
    const dataToExport = selectedOnly ? members.filter((m) => selectedMembers.has(m.id)) : filteredMembers

    if (dataToExport.length === 0) {
      toast({
        title: "لا توجد بيانات للتصدير",
        description: selectedOnly ? "لم يتم تحديد أي منخرطين" : "لا توجد بيانات مطابقة للفلاتر",
        variant: "destructive",
      })
      return
    }

    // استخدام الملف الرئيسي
    updateMainExcelFile()

    toast({
      title: "تم التصدير بنجاح",
      description: `تم تحديث الملف الرئيسي بـ ${members.length} منخرط`,
    })
  }

  const handlePrint = (selectedOnly = false) => {
    const dataToPrint = selectedOnly ? members.filter((m) => selectedMembers.has(m.id)) : filteredMembers

    if (dataToPrint.length === 0) {
      toast({
        title: "لا توجد بيانات للطباعة",
        description: selectedOnly ? "لم يتم تحديد أي منخرطين" : "لا توجد بيانات مطابقة للفلاتر",
        variant: "destructive",
      })
      return
    }

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const tableRows = dataToPrint
      .map(
        (member) => `
      <tr>
        <td>${member.registrationNumber}</td>
        <td>${member.fullName}</td>
        <td>${member.age} سنة</td>
        <td>${categories[member.category]}</td>
        <td>${member.registrationDate}</td>
        <td>${member.phone || "غير محدد"}</td>
        <td>${member.email || "غير محدد"}</td>
      </tr>
    `,
      )
      .join("")

    printWindow.document.write(`
      <html>
        <head>
          <title>قائمة المنخرطين - دار الشباب سليمي إبراهيم</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              direction: rtl; 
              margin: 20px;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
              border-bottom: 3px solid #166534;
              padding-bottom: 20px;
            }
            .header img {
              width: 80px;
              height: 80px;
              margin-bottom: 10px;
            }
            .header h1 { 
              color: #166534; 
              margin: 10px 0; 
              font-size: 24px;
            }
            .header p { 
              margin: 5px 0; 
              color: #666; 
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: right; 
            }
            th { 
              background-color: #f0fdf4; 
              font-weight: bold;
              color: #166534;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
            .stats {
              margin-bottom: 20px;
              background: #f0fdf4;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/images/odej-logo.png" alt="شعار ديوان مؤسسات الشباب تبسة">
            <h1>دار الشباب سليمي إبراهيم</h1>
            <p>بئر العاتر - ولاية تبسة</p>
            <p>ديوان مؤسسات الشباب تبسة</p>
            <p>الجمهورية الجزائرية الديمقراطية الشعبية</p>
          </div>
          
          <div class="stats">
            <h3>إحصائيات القائمة</h3>
            <p><strong>عدد المنخرطين:</strong> ${dataToPrint.length}</p>
            <p><strong>تاريخ الطباعة:</strong> ${new Date().toLocaleDateString("ar-DZ")}</p>
            ${selectedOnly ? "<p><strong>نوع القائمة:</strong> المنخرطون المحددون</p>" : ""}
          </div>

          <table>
            <thead>
              <tr>
                <th>رقم التسجيل</th>
                <th>الاسم الكامل</th>
                <th>العمر</th>
                <th>الفئة</th>
                <th>تاريخ التسجيل</th>
                <th>الهاتف</th>
                <th>البريد الإلكتروني</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <p>دار الشباب سليمي إبراهيم - بئر العاتر</p>
            <p>هذه القائمة تم إنشاؤها تلقائياً من نظام إدارة التسجيل الإلكتروني</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleDelete = (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنخرط؟")) return

    const updated = members.filter((m) => m.id !== id)
    setMembers(updated)
    localStorage.setItem("youthCenterMembers", JSON.stringify(updated))
    setSelectedMembers((prev) => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })

    toast({
      title: "تم الحذف",
      description: "تم حذف المنخرط بنجاح",
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMembers(new Set(filteredMembers.map((m) => m.id)))
    } else {
      setSelectedMembers(new Set())
    }
  }

  const handleSelectMember = (id: number, checked: boolean) => {
    setSelectedMembers((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(id)
      } else {
        newSet.delete(id)
      }
      return newSet
    })
  }

  const selectedCount = selectedMembers.size
  const allSelected = filteredMembers.length > 0 && selectedCount === filteredMembers.length

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-secondary opacity-90"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">إجمالي المنخرطين</p>
                <p className="text-3xl font-bold text-white">{members.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Users className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-primary opacity-90"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">المعروضون حالياً</p>
                <p className="text-3xl font-bold text-white">{filteredMembers.length}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Filter className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-purple opacity-90"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">المحددون</p>
                <p className="text-3xl font-bold text-white">{selectedCount}</p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CheckSquare className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden card-shadow hover-lift border-0">
          <div className="absolute inset-0 gradient-accent opacity-90"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">الملفات المكتملة</p>
                <p className="text-3xl font-bold text-white">
                  {
                    members.filter((m) => {
                      const hasPhoto = m.photo?.data
                      const hasBirthCert = m.birthCertificate?.data
                      const hasConsent = m.age >= 18 || m.parentalConsent?.data
                      const hasMedical = m.category !== "karate" || m.medicalCertificate?.data
                      return hasPhoto && hasBirthCert && hasConsent && hasMedical
                    }).length
                  }
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <CheckSquare className="h-10 w-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters and Actions */}
      <Card className="card-shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            <CardTitle className="text-2xl text-blue-700 flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              <span>البحث والتصفية المتقدمة</span>
            </CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-3"
            >
              <Filter className="h-5 w-5 mr-2" />
              {showFilters ? "إخفاء الفلاتر" : "إظهار الفلاتر"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="البحث بالاسم أو رقم التسجيل أو الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-12 py-3 text-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
              />
            </div>

            {showFilters && (
              <>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-56 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl">
                    <SelectValue placeholder="تصفية حسب الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="karate">الكاراتيه</SelectItem>
                    <SelectItem value="table-tennis">تنس الطاولة</SelectItem>
                    <SelectItem value="chess">الشطرنج</SelectItem>
                    <SelectItem value="other">أخرى</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={ageFilter} onValueChange={setAgeFilter}>
                  <SelectTrigger className="w-56 py-3 border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl">
                    <SelectValue placeholder="تصفية حسب العمر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأعمار</SelectItem>
                    <SelectItem value="minor">القاصرون (أقل من 18)</SelectItem>
                    <SelectItem value="adult">البالغون (18 فأكثر)</SelectItem>
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
            <Button
              onClick={() => exportToExcel(false)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl shadow-lg hover-lift"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              تحديث الملف الرئيسي
            </Button>

            <Button
              onClick={createCompleteArchive}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover-lift"
            >
              <FolderOpen className="h-5 w-5 mr-2" />
              تحميل أرشيف الملفات المرفوعة
            </Button>

            <Button
              onClick={() => handlePrint(false)}
              variant="outline"
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-xl shadow-lg hover-lift"
            >
              <Printer className="h-5 w-5 mr-2" />
              طباعة الكل
            </Button>

            <Button
              onClick={() => handlePrint(true)}
              disabled={selectedCount === 0}
              variant="outline"
              className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 px-6 py-3 rounded-xl shadow-lg hover-lift"
            >
              <Printer className="h-5 w-5 mr-2" />
              طباعة المحدد ({selectedCount})
            </Button>

            <Button
              onClick={updateMainExcelFile}
              variant="outline"
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-indigo-100 px-6 py-3 rounded-xl shadow-lg hover-lift"
            >
              <Download className="h-5 w-5 mr-2" />
              حفظ فوري
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Table */}
      <Card className="card-shadow-lg border-0 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                  <TableHead className="w-16 p-6">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="تحديد الكل"
                      className="w-5 h-5"
                    />
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">رقم التسجيل</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">الاسم الكامل</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">العمر</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">الفئة</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">تاريخ التسجيل</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">الهاتف</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6">حالة الملف</TableHead>
                  <TableHead className="font-bold text-gray-700 text-lg p-6 print:hidden">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-20">
                      <div className="flex flex-col items-center space-y-6 text-gray-500">
                        <div className="bg-gray-100 p-8 rounded-2xl">
                          <Users className="h-20 w-20 text-gray-300 mx-auto" />
                        </div>
                        <div>
                          <p className="text-2xl font-medium mb-2">لا توجد بيانات للعرض</p>
                          <p className="text-lg text-gray-400">جرب تغيير معايير البحث أو الفلاتر</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMembers.map((member, index) => {
                    const hasPhoto = member.photo?.data
                    const hasBirthCert = member.birthCertificate?.data
                    const hasConsent = member.age >= 18 || member.parentalConsent?.data
                    const hasMedical = member.category !== "karate" || member.medicalCertificate?.data
                    const isComplete = hasPhoto && hasBirthCert && hasConsent && hasMedical

                    return (
                      <TableRow
                        key={member.id}
                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                          selectedMembers.has(member.id)
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-md"
                            : ""
                        } ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"} border-b border-gray-100`}
                      >
                        <TableCell className="p-6">
                          <Checkbox
                            checked={selectedMembers.has(member.id)}
                            onCheckedChange={(checked) => handleSelectMember(member.id, checked as boolean)}
                            aria-label={`تحديد ${member.fullName}`}
                            className="w-5 h-5"
                          />
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-blue-700 text-lg p-6">
                          {member.registrationNumber}
                        </TableCell>
                        <TableCell className="font-semibold text-gray-900 text-lg p-6">{member.fullName}</TableCell>
                        <TableCell className="p-6">
                          <span
                            className={`px-4 py-2 rounded-full text-sm font-semibold ${
                              member.age < 18
                                ? "bg-gradient-to-r from-orange-100 to-amber-100 text-orange-800 border border-orange-200"
                                : "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200"
                            }`}
                          >
                            {member.age} سنة
                          </span>
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge
                            className={`${catColors[member.category]} border text-sm font-semibold px-4 py-2 rounded-full`}
                          >
                            {categories[member.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-lg p-6">{member.registrationDate}</TableCell>
                        <TableCell className="text-lg p-6">
                          {member.phone ? (
                            <a
                              href={`tel:${member.phone}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                            >
                              {member.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">غير محدد</span>
                          )}
                        </TableCell>
                        <TableCell className="p-6">
                          <Badge
                            className={`text-sm font-semibold px-4 py-2 rounded-full ${
                              isComplete
                                ? "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200"
                                : "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {isComplete ? "مكتمل" : "ناقص"}
                          </Badge>
                        </TableCell>
                        <TableCell className="print:hidden p-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 rounded-lg px-4 py-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center text-lg text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl border border-gray-200 shadow-lg">
        <div className="flex items-center space-x-3">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span>
            عرض {filteredMembers.length} من أصل {members.length} منخرط
            {selectedCount > 0 && ` • محدد: ${selectedCount}`}
          </span>
        </div>
        <div className="text-sm text-gray-500 mt-2 sm:mt-0 flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>آخر تحديث للملف الرئيسي: {new Date().toLocaleTimeString("ar-DZ")}</span>
        </div>
      </div>
    </div>
  )
}

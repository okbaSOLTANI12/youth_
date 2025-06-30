"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Printer, Download } from "lucide-react"
import Logo from "./logo"

interface RegistrationReceiptProps {
  data: any
  onBack: () => void
}

export default function RegistrationReceipt({ data, onBack }: RegistrationReceiptProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const element = document.getElementById("receipt-content")
    if (element) {
      const printContent = element.innerHTML
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>وصل التسجيل - ${data.registrationNumber}</title>
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
                  border-bottom: 2px solid #166534;
                  padding-bottom: 20px;
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
                .content { 
                  max-width: 800px; 
                  margin: 0 auto; 
                }
                .section { 
                  margin: 20px 0; 
                  padding: 15px;
                  border: 1px solid #ddd;
                  border-radius: 8px;
                }
                .section h3 { 
                  color: #166534; 
                  margin-bottom: 15px;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
                }
                .info-grid { 
                  display: grid; 
                  grid-template-columns: 1fr 1fr; 
                  gap: 15px; 
                }
                .info-item { 
                  display: flex; 
                  justify-content: space-between; 
                  padding: 8px 0;
                  border-bottom: 1px dotted #ccc;
                }
                .info-label { 
                  font-weight: bold; 
                  color: #333;
                }
                .info-value { 
                  color: #666;
                }
                .highlight { 
                  background-color: #f0fdf4; 
                  padding: 15px; 
                  border-radius: 8px;
                  border: 2px solid #22c55e;
                  text-align: center;
                  margin: 20px 0;
                }
                .footer { 
                  text-align: center; 
                  margin-top: 40px; 
                  padding-top: 20px;
                  border-top: 2px solid #166534;
                  color: #666;
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `)
        printWindow.document.close()

        // Download as PDF-like HTML
        const blob = new Blob([printWindow.document.documentElement.outerHTML], {
          type: "text/html;charset=utf-8",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `وصل_التسجيل_${data.registrationNumber}.html`
        a.click()
        URL.revokeObjectURL(url)

        printWindow.close()
      }
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
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex justify-between items-center print:hidden">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2 bg-transparent">
          <ArrowRight className="h-4 w-4" />
          <span>العودة للتسجيل</span>
        </Button>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownload} className="flex items-center space-x-2 bg-transparent">
            <Download className="h-4 w-4" />
            <span>تحميل</span>
          </Button>
          <Button onClick={handlePrint} className="flex items-center space-x-2 bg-green-700 hover:bg-green-800">
            <Printer className="h-4 w-4" />
            <span>طباعة</span>
          </Button>
        </div>
      </div>

      {/* Receipt */}
      <Card className="max-w-4xl mx-auto shadow-2xl">
        <div id="receipt-content">
          <CardHeader className="text-center border-b-2 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
            <div className="flex items-center justify-center space-x-6 mb-6">
              <Logo />
              <div>
                <h1 className="text-3xl font-bold text-green-800">دار الشباب سليمي إبراهيم</h1>
                <p className="text-green-600 text-lg">بئر العاتر - ولاية تبسة</p>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1 bg-white p-4 rounded-lg">
              <p className="font-semibold">الجمهورية الجزائرية الديمقراطية الشعبية</p>
              <p>وزارة الشباب والرياضة</p>
              <p>ديوان مؤسسات الشباب تبسة</p>
            </div>
            <CardTitle className="text-2xl text-green-800 mt-6 bg-green-100 p-4 rounded-lg">وصل تسجيل منخرط</CardTitle>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Registration Info */}
            <div className="bg-gradient-to-r from-green-100 to-green-50 p-6 rounded-xl border-2 border-green-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <span className="block text-sm font-medium text-green-700 mb-2">رقم التسجيل</span>
                  <span className="text-3xl font-bold text-green-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                    {data.registrationNumber}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-sm font-medium text-green-700 mb-2">تاريخ التسجيل</span>
                  <span className="text-xl font-semibold text-green-800 bg-white px-4 py-2 rounded-lg shadow-sm">
                    {data.registrationDate}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">البيانات الشخصية</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">الاسم الكامل:</span>
                    <span className="font-semibold text-gray-900">{data.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">تاريخ الميلاد:</span>
                    <span className="font-semibold text-gray-900">{data.birthDate}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">العمر:</span>
                    <span className="font-semibold text-gray-900">{data.age} سنة</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">مكان الميلاد:</span>
                    <span className="font-semibold text-gray-900">{data.birthPlace || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">العنوان:</span>
                    <span className="font-semibold text-gray-900">{data.address || "غير محدد"}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">رقم الهاتف:</span>
                    <span className="font-semibold text-gray-900">{data.phone || "غير محدد"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {data.age < 18 && (
              <>
                <Separator className="my-8" />
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-orange-800 border-b-2 border-orange-200 pb-2">بيانات الولي</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-700">اسم الولي:</span>
                      <span className="font-semibold text-orange-900">{data.guardianName}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-orange-700">هاتف الولي:</span>
                      <span className="font-semibold text-orange-900">{data.guardianPhone}</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator className="my-8" />

            {/* Activity Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">النشاط المختار</h3>
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border-2 border-blue-200">
                <div className="text-center">
                  <span className="block text-sm font-medium text-blue-700 mb-2">الفئة المختارة</span>
                  <span className="text-2xl font-bold text-blue-800 bg-white px-6 py-3 rounded-lg shadow-sm inline-block">
                    {getCategoryName(data.category)}
                  </span>
                </div>
                {data.notes && (
                  <div className="mt-4 p-4 bg-white rounded-lg">
                    <span className="block font-medium text-blue-700 mb-2">ملاحظات:</span>
                    <p className="text-blue-800">{data.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Files Status */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-800 border-b-2 border-green-200 pb-2">حالة المرفقات</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border-2 text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      data.photo ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {data.photo ? "✓" : "✗"}
                  </div>
                  <span className="block font-medium">الصورة الشخصية</span>
                  <span className={`text-sm ${data.photo ? "text-green-600" : "text-red-600"}`}>
                    {data.photo ? "مرفقة" : "غير مرفقة"}
                  </span>
                </div>

                <div className="p-4 rounded-lg border-2 text-center">
                  <div
                    className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                      data.birthCertificate ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                    }`}
                  >
                    {data.birthCertificate ? "✓" : "✗"}
                  </div>
                  <span className="block font-medium">شهادة الميلاد</span>
                  <span className={`text-sm ${data.birthCertificate ? "text-green-600" : "text-red-600"}`}>
                    {data.birthCertificate ? "مرفقة" : "غير مرفقة"}
                  </span>
                </div>

                {data.category === "karate" && (
                  <div className="p-4 rounded-lg border-2 text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        data.medicalCertificate ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {data.medicalCertificate ? "✓" : "✗"}
                    </div>
                    <span className="block font-medium">الشهادة الطبية</span>
                    <span className={`text-sm ${data.medicalCertificate ? "text-green-600" : "text-red-600"}`}>
                      {data.medicalCertificate ? "مرفقة" : "غير مرفقة"}
                    </span>
                  </div>
                )}

                {data.age < 18 && (
                  <div className="p-4 rounded-lg border-2 text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                        data.parentalConsent ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}
                    >
                      {data.parentalConsent ? "✓" : "✗"}
                    </div>
                    <span className="block font-medium">السماح الأبوي</span>
                    <span className={`text-sm ${data.parentalConsent ? "text-green-600" : "text-red-600"}`}>
                      {data.parentalConsent ? "مرفق" : "غير مرفق"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-8 border-t-2 border-green-200 bg-green-50 p-6 rounded-lg">
              <p className="text-lg font-semibold text-green-800 mb-2">
                هذا الوصل يؤكد تسجيل المنخرط في دار الشباب سليمي إبراهيم
              </p>
              <p className="text-sm text-green-600 mb-2">يرجى الاحتفاظ بهذا الوصل كإثبات للتسجيل</p>
              <p className="text-xs text-gray-500">للاستفسارات يرجى الاتصال بإدارة دار الشباب</p>
              <div className="mt-4 text-xs text-gray-400">
                تم إنشاء هذا الوصل تلقائياً في: {new Date().toLocaleString("ar-DZ")}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, User, Calendar, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import RegistrationReceipt from "./registration-receipt"

// utils
async function encodeFile(file: File) {
  return new Promise<{ name: string; type: string; data: string }>((res, rej) => {
    const reader = new FileReader()
    reader.onerror = () => rej(reader.error)
    reader.onload = () =>
      res({
        name: file.name,
        type: file.type,
        data: (reader.result as string).split(",")[1], // strip Data-URL prefix
      })
    reader.readAsDataURL(file)
  })
}

interface FormData {
  fullName: string
  birthDate: string
  birthPlace: string
  address: string
  phone: string
  email: string
  guardianName: string
  guardianPhone: string
  category: string
  notes: string
  photo: File | null
  birthCertificate: File | null
  parentalConsent: File | null
  medicalCertificate: File | null
}

export default function RegistrationForm() {
  const { toast } = useToast()
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    birthDate: "",
    birthPlace: "",
    address: "",
    phone: "",
    email: "",
    guardianName: "",
    guardianPhone: "",
    category: "",
    notes: "",
    photo: null,
    birthCertificate: null,
    parentalConsent: null,
    medicalCertificate: null,
  })
  const [showReceipt, setShowReceipt] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleFileChange = (field: keyof FormData, file: File | null) => {
    setFormData((prev) => ({ ...prev, [field]: file }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "الاسم الكامل مطلوب"
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "تاريخ الميلاد مطلوب"
    } else {
      const age = calculateAge(formData.birthDate)
      if (age < 6) {
        newErrors.birthDate = "العمر يجب أن يكون 6 سنوات على الأقل"
      }
      if (age > 35) {
        newErrors.birthDate = "العمر يجب أن يكون أقل من 35 سنة"
      }
    }

    if (!formData.category) {
      newErrors.category = "يرجى اختيار الفئة"
    }

    if (!formData.photo) {
      newErrors.photo = "الصورة الشخصية مطلوبة"
    }

    if (!formData.birthCertificate) {
      newErrors.birthCertificate = "شهادة الميلاد مطلوبة"
    }

    // التحقق من الشهادة الطبية للكاراتيه
    if (formData.category === "karate" && !formData.medicalCertificate) {
      newErrors.medicalCertificate = "الشهادة الطبية العامة والصدرية مطلوبة لفئة الكاراتيه"
    }

    if (formData.birthDate) {
      const age = calculateAge(formData.birthDate)
      if (age < 18) {
        if (!formData.guardianName.trim()) {
          newErrors.guardianName = "اسم الولي مطلوب للقاصرين"
        }
        if (!formData.guardianPhone.trim()) {
          newErrors.guardianPhone = "هاتف الولي مطلوب للقاصرين"
        }
        if (!formData.parentalConsent) {
          newErrors.parentalConsent = "السماح الأبوي مطلوب للقاصرين"
        }
      }
    }

    if (formData.phone && !/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = "رقم الهاتف غير صحيح"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "البريد الإلكتروني غير صحيح"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى تصحيح الأخطاء المذكورة أعلاه",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate processing time
      await new Promise((r) => setTimeout(r, 1500))

      // ---- encode the uploaded files so they are serialisable ----
      const photoEncoded = formData.photo ? await encodeFile(formData.photo) : null
      const birthCertEncoded = formData.birthCertificate ? await encodeFile(formData.birthCertificate) : null
      const consentEncoded = formData.parentalConsent ? await encodeFile(formData.parentalConsent) : null
      const medicalCertEncoded = formData.medicalCertificate ? await encodeFile(formData.medicalCertificate) : null

      const age = calculateAge(formData.birthDate)
      const registrationNumber = `YC${Date.now().toString().slice(-6)}`
      const registrationDate = new Date().toLocaleDateString("ar-DZ")

      const memberData = {
        ...formData,
        photo: photoEncoded,
        birthCertificate: birthCertEncoded,
        parentalConsent: consentEncoded,
        medicalCertificate: medicalCertEncoded,
        registrationNumber,
        registrationDate,
        age,
        id: Date.now(),
      }

      // Save to localStorage with error handling
      try {
        const existingMembers = JSON.parse(localStorage.getItem("youthCenterMembers") || "[]")
        existingMembers.push(memberData)
        localStorage.setItem("youthCenterMembers", JSON.stringify(existingMembers))
      } catch (storageError) {
        console.error("Storage error:", storageError)
        throw new Error("فشل في حفظ البيانات")
      }

      setRegistrationData(memberData)
      setShowReceipt(true)

      toast({
        title: "تم التسجيل بنجاح",
        description: `رقم التسجيل: ${registrationNumber}`,
      })
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "خطأ في التسجيل",
        description: "حدث خطأ أثناء التسجيل، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      fullName: "",
      birthDate: "",
      birthPlace: "",
      address: "",
      phone: "",
      email: "",
      guardianName: "",
      guardianPhone: "",
      category: "",
      notes: "",
      photo: null,
      birthCertificate: null,
      parentalConsent: null,
      medicalCertificate: null,
    })
    setErrors({})
    setShowReceipt(false)
    setRegistrationData(null)
  }

  if (showReceipt && registrationData) {
    return <RegistrationReceipt data={registrationData} onBack={resetForm} />
  }

  const age = formData.birthDate ? calculateAge(formData.birthDate) : 0
  const isMinor = age > 0 && age < 18
  const isKarate = formData.category === "karate"

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Age Alert */}
      {formData.birthDate && (
        <Alert className={isMinor ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}>
          <AlertCircle className={`h-4 w-4 ${isMinor ? "text-orange-600" : "text-green-600"}`} />
          <AlertDescription className={isMinor ? "text-orange-800" : "text-green-800"}>
            {isMinor
              ? `المنخرط قاصر (${age} سنة) - يتطلب بيانات الولي والسماح الأبوي`
              : `المنخرط بالغ (${age} سنة) - لا يتطلب بيانات الولي`}
          </AlertDescription>
        </Alert>
      )}

      {/* Karate Medical Certificate Alert */}
      {isKarate && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>تنبيه خاص بفئة الكاراتيه:</strong> يتطلب تقديم شهادة طبية عامة وصدرية حديثة (لا تزيد عن 3 أشهر)
          </AlertDescription>
        </Alert>
      )}

      {/* Personal Information */}
      <Card className="shadow-md">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <User className="h-5 w-5" />
            <span>البيانات الشخصية</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">الاسم الكامل *</Label>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              placeholder="أدخل الاسم الكامل"
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && <p className="text-sm text-red-600">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">تاريخ الميلاد *</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              className={errors.birthDate ? "border-red-500" : ""}
            />
            {errors.birthDate && <p className="text-sm text-red-600">{errors.birthDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthPlace">مكان الميلاد</Label>
            <Input
              id="birthPlace"
              value={formData.birthPlace}
              onChange={(e) => handleInputChange("birthPlace", e.target.value)}
              placeholder="أدخل مكان الميلاد"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              placeholder="أدخل العنوان"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="أدخل رقم الهاتف"
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && <p className="text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="أدخل البريد الإلكتروني"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Guardian Information */}
      {isMinor && (
        <Card className="shadow-md border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center space-x-2 text-orange-700">
              <User className="h-5 w-5" />
              <span>بيانات الولي (مطلوبة للقاصرين)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="guardianName">اسم الولي *</Label>
              <Input
                id="guardianName"
                value={formData.guardianName}
                onChange={(e) => handleInputChange("guardianName", e.target.value)}
                placeholder="أدخل اسم الولي"
                className={errors.guardianName ? "border-red-500" : ""}
              />
              {errors.guardianName && <p className="text-sm text-red-600">{errors.guardianName}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="guardianPhone">هاتف الولي *</Label>
              <Input
                id="guardianPhone"
                value={formData.guardianPhone}
                onChange={(e) => handleInputChange("guardianPhone", e.target.value)}
                placeholder="أدخل هاتف الولي"
                className={errors.guardianPhone ? "border-red-500" : ""}
              />
              {errors.guardianPhone && <p className="text-sm text-red-600">{errors.guardianPhone}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Category */}
      <Card className="shadow-md">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Calendar className="h-5 w-5" />
            <span>الفئة والنشاط</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="category">الفئة *</Label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="karate">الكاراتيه</SelectItem>
                <SelectItem value="table-tennis">تنس الطاولة</SelectItem>
                <SelectItem value="chess">الشطرنج</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-600">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="أدخل أي ملاحظات إضافية"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Uploads */}
      <Card className="shadow-md">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2 text-green-700">
            <Upload className="h-5 w-5" />
            <span>المرفقات المطلوبة</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="photo" className="flex items-center space-x-2">
              <span>الصورة الشخصية *</span>
              {formData.photo && <CheckCircle className="h-4 w-4 text-green-600" />}
            </Label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("photo", e.target.files?.[0] || null)}
              className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${errors.photo ? "border-red-500" : ""}`}
            />
            {errors.photo && <p className="text-sm text-red-600">{errors.photo}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthCertificate" className="flex items-center space-x-2">
              <span>شهادة الميلاد *</span>
              {formData.birthCertificate && <CheckCircle className="h-4 w-4 text-green-600" />}
            </Label>
            <Input
              id="birthCertificate"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange("birthCertificate", e.target.files?.[0] || null)}
              className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 ${errors.birthCertificate ? "border-red-500" : ""}`}
            />
            {errors.birthCertificate && <p className="text-sm text-red-600">{errors.birthCertificate}</p>}
          </div>

          {/* Medical Certificate for Karate */}
          {isKarate && (
            <div className="space-y-2">
              <Label htmlFor="medicalCertificate" className="flex items-center space-x-2">
                <span>الشهادة الطبية العامة والصدرية (للكاراتيه) *</span>
                {formData.medicalCertificate && <CheckCircle className="h-4 w-4 text-green-600" />}
              </Label>
              <Input
                id="medicalCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange("medicalCertificate", e.target.files?.[0] || null)}
                className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 ${errors.medicalCertificate ? "border-red-500" : ""}`}
              />
              {errors.medicalCertificate && <p className="text-sm text-red-600">{errors.medicalCertificate}</p>}
              <p className="text-xs text-red-600">
                * يجب أن تكون الشهادة الطبية حديثة (لا تزيد عن 3 أشهر) وتشمل الفحص العام والصدري
              </p>
            </div>
          )}

          {isMinor && (
            <div className="space-y-2">
              <Label htmlFor="parentalConsent" className="flex items-center space-x-2">
                <span>السماح الأبوي (للقاصرين) *</span>
                {formData.parentalConsent && <CheckCircle className="h-4 w-4 text-green-600" />}
              </Label>
              <Input
                id="parentalConsent"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange("parentalConsent", e.target.files?.[0] || null)}
                className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 ${errors.parentalConsent ? "border-red-500" : ""}`}
              />
              {errors.parentalConsent && <p className="text-sm text-red-600">{errors.parentalConsent}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={resetForm}
          disabled={isSubmitting}
          className="px-8 bg-transparent"
        >
          إعادة تعيين
        </Button>
        <Button type="submit" size="lg" disabled={isSubmitting} className="bg-green-700 hover:bg-green-800 px-8">
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              جاري التسجيل...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              تسجيل المنخرط
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

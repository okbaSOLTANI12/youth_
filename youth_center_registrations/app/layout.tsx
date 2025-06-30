import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'انخراطات دار الشباب سليمي إبراهيم  ',
  description: 'Created with okba soltani',
  generator: 'okba',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

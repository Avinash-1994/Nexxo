export default function RootLayout({
  children
}: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><title>Lunx + Next.js App Router</title></head>
      <body>{children}</body>
    </html>
  )
}

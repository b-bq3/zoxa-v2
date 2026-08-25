// ===== Zoxa Addons — Root Layout =====

import type { Metadata } from 'next'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { LangProvider } from '@/components/ui/lang-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Particles } from '@/components/ui/particles'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Zoxa Addons — إضافات ماينكرافت',
    template: '%s | Zoxa Addons',
  },
  description: 'اكتشف أفضل إضافات ماينكرافت. منصة عربية لتحميل إضافات Minecraft Bedrock و Java.',
  keywords: ['ماينكرافت', 'إضافات', 'Minecraft', 'Addons', 'Mods', 'Bedrock', 'Java'],
  authors: [{ name: 'Zoxa' }],
  creator: 'Zoxa',
  publisher: 'Zoxa',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zoxa.vercel.app'),
  openGraph: {
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
    siteName: 'Zoxa Addons',
    title: 'Zoxa Addons — إضافات ماينكرافت',
    description: 'اكتشف أفضل إضافات ماينكرافت. منصة عربية لتحميل إضافات Minecraft.',
    images: [{ url: '/og.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zoxa Addons',
    description: 'اكتشف أفضل إضافات ماينكرافت',
    images: ['/og.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Zoxa',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
  ],
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Zoxa Addons',
              url: process.env.NEXT_PUBLIC_SITE_URL || 'https://zoxa.vercel.app',
              description: 'اكتشف أفضل إضافات ماينكرافت',
              inLanguage: ['ar', 'en'],
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zoxa.vercel.app'}/search?q={search_term_string}`,
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white antialiased">
        <ThemeProvider>
          <LangProvider>
            <Particles />
            <Navbar />
            <main className="relative z-10 min-h-screen pt-16">
              {children}
            </main>
            <Footer />
          </LangProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
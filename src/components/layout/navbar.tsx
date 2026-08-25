// ===== Zoxa Addons — Navbar Component =====

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Home, Search, Package, Info, Zap } from 'lucide-react'
import { useLang } from '@/components/ui/lang-provider'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { LangSwitcher } from '@/components/ui/lang-switcher'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { href: '/', label: 'nav.home', icon: Home },
  { href: '/search', label: 'nav.search', icon: Search },
  { href: '/addons', label: 'nav.addons', icon: Package },
  { href: '/about', label: 'nav.about', icon: Info },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { t, dir } = useLang()

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Glassmorphism backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl border-b border-white/5" />
      
      <nav className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-red-700 
                       flex items-center justify-center shadow-lg shadow-red-500/20
                       group-hover:scale-105 transition-transform duration-300">
            <Zap size={18} className="text-white" />
          </div>
          <span className="text-lg font-bold text-white/90 group-hover:text-white transition-colors">
            Zoxa
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-4 py-2 rounded-xl text-sm text-white/60 hover:text-white 
                       hover:bg-white/5 transition-all duration-200"
            >
              {t(link.label)}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <LangSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl border border-white/10 hover:border-white/20 
                     transition-all duration-300 text-white/70 hover:text-white"
            aria-label="Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden absolute top-16 left-0 right-0 bg-black/60 backdrop-blur-2xl border-b border-white/5"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-white/60 
                           hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <link.icon size={16} />
                  {t(link.label)}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
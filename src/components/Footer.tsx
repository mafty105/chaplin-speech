'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-16 border-t border-[#DFE1E6] bg-[#FAFBFC]"
    >
      <div className="max-w-[480px] mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-3">
          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link 
              href="/privacy" 
              className="text-[#6B778C] hover:text-[#172B4D] transition-colors"
            >
              プライバシーポリシー
            </Link>
            <span className="text-[#DFE1E6]">|</span>
            <Link 
              href="/terms" 
              className="text-[#6B778C] hover:text-[#172B4D] transition-colors"
            >
              利用規約
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-xs text-[#6B778C]">
            © {currentYear} ChaplinSpeech. All rights reserved.
          </div>
        </div>
      </div>
    </motion.footer>
  )
}
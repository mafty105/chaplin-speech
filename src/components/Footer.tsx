import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-16 border-t border-[#DFE1E6]">
      <div className="max-w-[480px] mx-auto px-4 py-6">
        <div className="flex flex-col items-center space-y-3">
          {/* Legal Links */}
          <div className="flex items-center gap-4 text-sm">
            <Link 
              href="/privacy" 
              className="text-black hover:text-[#172B4D]"
            >
              プライバシーポリシー
            </Link>
            <span className="text-[#DFE1E6]">|</span>
            <Link 
              href="/terms" 
              className="text-black hover:text-[#172B4D]"
            >
              利用規約
            </Link>
            <span className="text-[#DFE1E6]">|</span>
            <Link 
              href="https://docs.google.com/forms/d/e/1FAIpQLSd9y7qTCzCT-vKYcHqY6ce297WcxuAzvWjUbP-B14Nj3BFKuQ/viewform?usp=header"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black hover:text-[#172B4D]"
            >
              お問い合わせ
            </Link>
          </div>
          
          {/* Copyright */}
          <div className="text-xs">
            © {currentYear} Charlie Talk. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
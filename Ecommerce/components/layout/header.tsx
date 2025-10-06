'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store/cart-store'
import { useState } from 'react'

export default function Header() {
  const { data: session } = useSession()
  const { getTotalItems } = useCartStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const cartItems = getTotalItems()

  return (
    <header className="glass-effect sticky top-0 z-50 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full animate-pulse"></div>
            </Link>
            <span className="text-3xl font-bold gradient-text">
              Unicart
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-2">
            <Link href="/" className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-purple-500 transition-all duration-300 font-medium">
              Home
            </Link>
            <Link href="/products" className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-purple-500 transition-all duration-300 font-medium">
              Products
            </Link>
            <Link href="/about" className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-purple-500 transition-all duration-300 font-medium">
              About
            </Link>
            <Link href="/contact" className="px-4 py-2 rounded-full text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-purple-500 transition-all duration-300 font-medium">
              Contact
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-3">
            {/* Cart */}
            <div className="relative group">
              <Link href="/cart" className="p-3 rounded-full bg-gradient-to-r from-emerald-500/20 to-purple-500/20 hover:from-emerald-500/30 hover:to-purple-500/30 transition-all duration-300 group-hover:scale-110 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-gray-300 group-hover:text-emerald-400 transition-colors" />
              </Link>
              {cartItems > 0 && (
                <div className="absolute -top-1 -right-1 h-6 w-6 bg-gradient-to-r from-emerald-400 to-purple-400 rounded-full flex items-center justify-center text-xs text-white font-bold animate-pulse-glow">
                  {cartItems}
                </div>
              )}
            </div>

            {/* User menu */}
            {session ? (
              <div className="flex items-center space-x-3">
                <Link href="/profile">
                  <Button className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <User className="h-4 w-4 mr-2" />
                    {session.user.name || 'Profile'}
                  </Button>
                </Link>
                {session.user.email === 'admin@aishani.com' && (
                  <Link href="/admin">
                    <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  onClick={() => signOut()}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-gradient-to-r from-emerald-500 to-purple-500 hover:from-emerald-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 px-6">
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden touch-target"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t mobile-padding">
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="touch-target text-gray-700 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-gray-100">
                Home
              </Link>
              <Link href="/products" className="touch-target text-gray-700 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-gray-100">
                Products
              </Link>
              <Link href="/about" className="touch-target text-gray-700 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-gray-100">
                About
              </Link>
              <Link href="/contact" className="touch-target text-gray-700 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-gray-100">
                Contact
              </Link>
              {!session && (
                <Link href="/login" className="touch-target text-gray-700 hover:text-primary transition-colors py-3 px-4 rounded-lg hover:bg-gray-100">
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

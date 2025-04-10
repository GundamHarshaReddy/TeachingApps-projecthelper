"use client"

import React from 'react'
import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            M
          </div>
          <span className="text-xl font-semibold">MVP Builder</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/project-helper" 
            className="text-sm font-medium text-gray-500 hover:text-blue-600"
          >
            Project Helper
          </Link>
        </nav>
        
        <div className="flex items-center space-x-4">
          <button className="flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
            Save Project
          </button>
        </div>
      </div>
    </header>
  )
}

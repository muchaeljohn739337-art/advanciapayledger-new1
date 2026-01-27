'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LandingPage from './landing-page'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in later
    // For now, show the landing page
  }, [router])

  return <LandingPage />

'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AdminData {
  allowSignups: boolean
  allowedEmails: string[]
}

interface RateLimit {
  ip: string
  attempts: number
  blocked: boolean
  remaining: number
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [adminData, setAdminData] = useState<AdminData>({ allowSignups: false, allowedEmails: [] })
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [rateLimits, setRateLimits] = useState<RateLimit[]>([])
  const [rateLimitLoading, setRateLimitLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/sign-in')
      return
    }
  }, [session, status, router])

  // Load admin data
  useEffect(() => {
    if (session) {
      loadAdminData()
    }
  }, [session])

  const loadAdminData = async () => {
    try {
      const [signupsRes, emailsRes] = await Promise.all([
        fetch('/api/admin/signups'),
        fetch('/api/admin/emails')
      ])
      
      const signupsData = await signupsRes.json()
      const emailsData = await emailsRes.json()
      
      setAdminData({
        allowSignups: signupsData.allowSignups || false,
        allowedEmails: emailsData.allowedEmails || []
      })
    } catch (error) {
      console.error('Failed to load admin data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSignups = async () => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/signups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allow: !adminData.allowSignups })
      })
      
      if (response.ok) {
        setAdminData(prev => ({ ...prev, allowSignups: !prev.allowSignups }))
      }
    } catch (error) {
      console.error('Failed to update signups:', error)
    } finally {
      setUpdating(false)
    }
  }

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmail.trim()) return
    
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'add',
          email: newEmail.trim().toLowerCase()
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, allowedEmails: data.allowedEmails }))
        setNewEmail('')
      }
    } catch (error) {
      console.error('Failed to add email:', error)
    } finally {
      setUpdating(false)
    }
  }

  const removeEmail = async (emailToRemove: string) => {
    setUpdating(true)
    try {
      const response = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'remove',
          email: emailToRemove
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminData(prev => ({ ...prev, allowedEmails: data.allowedEmails }))
      }
    } catch (error) {
      console.error('Failed to remove email:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Rate limiting functions
  const loadRateLimits = async () => {
    setRateLimitLoading(true)
    try {
      const response = await fetch('/api/admin/rate-limits')
      if (response.ok) {
        const data = await response.json()
        setRateLimits(data.rateLimits || [])
      }
    } catch (error) {
      console.error('Failed to load rate limits:', error)
    } finally {
      setRateLimitLoading(false)
    }
  }

  const clearRateLimit = async (ip: string) => {
    setRateLimitLoading(true)
    try {
      const response = await fetch(`/api/admin/rate-limits?ip=${encodeURIComponent(ip)}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadRateLimits() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to clear rate limit:', error)
    } finally {
      setRateLimitLoading(false)
    }
  }

  const clearAllRateLimits = async () => {
    if (!confirm('Are you sure you want to clear all rate limits for today?')) return
    
    setRateLimitLoading(true)
    try {
      const response = await fetch('/api/admin/rate-limits?action=clear-all', {
        method: 'DELETE'
      })
      if (response.ok) {
        await loadRateLimits() // Refresh the list
      }
    } catch (error) {
      console.error('Failed to clear all rate limits:', error)
    } finally {
      setRateLimitLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">
              Signed in as: <span className="font-medium">{session.user?.email || session.user?.name}</span>
            </p>
          </div>

          {/* Signup Toggle */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-4 text-blue-900">🚪 Master Signup Control</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 mb-2">
                  New signups are currently: <span className={`font-bold ${adminData.allowSignups ? 'text-green-600' : 'text-red-600'}`}>
                    {adminData.allowSignups ? 'ENABLED' : 'DISABLED'}
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  {adminData.allowSignups 
                    ? 'New users can create accounts (subject to email whitelist below)' 
                    : 'Only existing users can sign in'
                  }
                </p>
              </div>
              <button
                onClick={toggleSignups}
                disabled={updating}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  adminData.allowSignups
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50`}
              >
                {updating ? 'Updating...' : adminData.allowSignups ? 'Disable Signups' : 'Enable Signups'}
              </button>
            </div>
          </div>

          {/* Email Whitelist */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">📧 Email Whitelist</h2>
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>How it works:</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• If the whitelist is <strong>empty</strong>, anyone can sign up (when signups are enabled)</li>
                <li>• If the whitelist has emails, <strong>only those emails</strong> can sign up</li>
                <li>• Existing users can always sign in, regardless of whitelist</li>
              </ul>
            </div>

            {/* Add Email Form */}
            <form onSubmit={addEmail} className="mb-6">
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email address..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="submit"
                  disabled={updating || !newEmail.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Email
                </button>
              </div>
            </form>

            {/* Email List */}
            <div className="space-y-2">
              {adminData.allowedEmails.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">🌍 No email restrictions</p>
                  <p className="text-sm">Anyone can sign up when signups are enabled</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Allowed emails ({adminData.allowedEmails.length}):
                  </h3>
                  {adminData.allowedEmails.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-md">
                      <span className="text-gray-900">{email}</span>
                      <button
                        onClick={() => removeEmail(email)}
                        disabled={updating}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Rate Limits */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">🛡️ Login Rate Limits</h2>
              <div className="space-x-2">
                <button
                  onClick={loadRateLimits}
                  disabled={rateLimitLoading}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {rateLimitLoading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={clearAllRateLimits}
                  disabled={rateLimitLoading}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-gray-600 mb-2">
                <strong>Rate limiting:</strong> 20 login attempts per day per IP address
              </p>
              <p className="text-sm text-gray-600">
                Users are blocked for the rest of the day after 20 failed attempts. Successful logins reset the counter.
              </p>
            </div>

            <div className="space-y-2">
              {rateLimits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">✅ No rate limits active</p>
                  <p className="text-sm">No IPs are currently being rate limited</p>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Active rate limits ({rateLimits.length}):
                  </h3>
                  {rateLimits.map((limit, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 border rounded-md ${
                      limit.blocked ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <div>
                        <div className="font-mono text-sm">{limit.ip}</div>
                        <div className="text-xs text-gray-600">
                          {limit.attempts}/20 attempts • {limit.remaining} remaining
                          {limit.blocked && <span className="text-red-600 font-medium"> • BLOCKED</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => clearRateLimit(limit.ip)}
                        disabled={rateLimitLoading}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                      >
                        Clear
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                ← Back to Site
              </button>
              <button
                onClick={() => window.open('/sign-in', '_blank')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Test Sign In Page
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
// app/sign-up/[[...sign-up]]/page.tsx
'use client'
import { signIn } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [signupsAllowed, setSignupsAllowed] = useState(false)
    const [checkingSignups, setCheckingSignups] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if signups are allowed
        fetch('/api/admin/signups')
            .then(res => res.json())
            .then(data => {
                setSignupsAllowed(data.allowSignups)
                setCheckingSignups(false)
            })
            .catch(() => {
                setCheckingSignups(false)
            })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                username,
                password,
                action: 'signup',
                redirect: false
            })

            if (result?.error) {
                setError(result.error)
            } else {
                router.push('/')
            }
        } catch {
            setError('Sign up failed')
        } finally {
            setLoading(false)
        }
    }

    if (checkingSignups) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-gray-600">Checking signup availability...</div>
                </div>
            </div>
        )
    }

    if (!signupsAllowed) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 rounded-lg shadow-md text-center">
                        <h1 className="text-2xl font-bold mb-4 text-gray-900">Sign Up Disabled</h1>
                        <p className="text-gray-600 mb-4">New registrations are currently disabled.</p>
                        <button 
                            onClick={() => router.push('/sign-in')}
                            className="text-indigo-600 hover:text-indigo-500"
                        >
                            Go to Sign In
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Create Account</h1>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                            />
                        </div>

                        {error && (
                            <div className="text-red-600 text-sm text-center">{error}</div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            onClick={() => router.push('/sign-in')}
                            className="text-indigo-600 hover:text-indigo-500 text-sm"
                        >
                            Already have an account? Sign in
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

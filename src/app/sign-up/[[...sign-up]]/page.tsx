// app/sign-up/[[...sign-up]]/page.tsx
'use client'
import { SignUp } from '@clerk/nextjs'
export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <SignUp />
            </div>
        </div>
    )
}

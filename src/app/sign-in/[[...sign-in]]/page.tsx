// app/sign-in/[[...sign-in]]/page.tsx
'use client'
import { SignIn } from '@clerk/nextjs'
export default function Page() {
	return (
		<div className="min-h-screen flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<SignIn />
			</div>
		</div>
	)
}
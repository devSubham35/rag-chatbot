"use client"

import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Show, SignInButton, SignOutButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'


const Navigation = () => {
    const { sessionClaims } = useAuth()
    const pathname = usePathname()
    const isAdmin = sessionClaims?.metadata?.roles === "admin"

    return (
        <header className='flex min-h-16 w-full flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6 lg:px-20'>
            <div className='flex shrink-0 items-center gap-2'>
                <Link className='font-semibold text-base sm:text-lg' href='/'>
                    <span className='text-primary'>RAG</span> Chatbot
                </Link>
                {isAdmin && (
                    <Badge className='border-primary/30 bg-primary/10 text-primary' variant='outline'>
                        Admin
                    </Badge>
                )}
            </div>
            <nav className='flex min-w-0 flex-wrap items-center justify-end gap-2'>

                <Show when="signed-out">
                    <SignInButton
                        fallbackRedirectUrl={pathname}
                        mode='modal'
                    >
                        <Button size="xl" variant="outline">Sign In</Button>
                    </SignInButton>
                    <SignUpButton
                        fallbackRedirectUrl={pathname}
                        mode='modal'
                    >
                        <Button size="xl">Sign Up</Button>
                    </SignUpButton>
                </Show>

                <Show when="signed-in">
                    <Button asChild variant="ghost" size="xl">
                        <Link href="/chat">Chats</Link>
                    </Button>
                    {isAdmin && (
                        <Button asChild variant="ghost" size="xl">
                            <Link href="/upload">Uploads</Link>
                        </Button>
                    )}
                    <UserButton />
                    <SignOutButton redirectUrl='/'>
                        <Button variant="outline" size="xl">Sign Out</Button>
                    </SignOutButton>
                </Show>
            </nav>
        </header>
    )
}

export default Navigation

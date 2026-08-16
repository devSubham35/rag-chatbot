import { Button } from './ui/button'
import { Show, SignInButton, SignOutButton, SignUpButton } from '@clerk/nextjs'


const Navigation = () => {
    return (
        <div className='w-full h-[7vh] flex items-center justify-between px-20 border-b'>
            <h1 className='font-semibold text-lg'><span className='text-emerald-400'>RAG</span> Chatbot</h1>
            <div className='flex items-center gap-2'>

                <Show when="signed-out">
                    <SignInButton
                        fallbackRedirectUrl="/chat"
                        forceRedirectUrl="/chat"
                        mode='modal'
                    >
                        <Button size="xl" variant="outline">Sign In</Button>
                    </SignInButton>
                    <SignUpButton
                        fallbackRedirectUrl="/chat"
                        forceRedirectUrl="/chat"
                        mode='modal'
                    >
                        <Button size="xl">Sign Up</Button>
                    </SignUpButton>
                </Show>

                <Show when="signed-in">
                    <SignOutButton redirectUrl='/'>
                        <Button variant="outline" size="xl">Sign Out</Button>
                    </SignOutButton>
                </Show>
            </div>
        </div>
    )
}

export default Navigation

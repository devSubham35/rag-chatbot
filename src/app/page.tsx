import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[93vh] items-center px-6">
      <section className="mx-auto w-full max-w-3xl text-center">
        <p className="mb-4 text-muted-foreground text-sm">RAG Chatbot</p>
        <h1 className="font-heading text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Chat with your documents.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground text-base leading-7">
          Upload PDFs, index their content, and ask questions with answers
          grounded in your own knowledge base.
        </p>
        <div className="mt-8">
          <Show when="signed-out">
            <SignInButton fallbackRedirectUrl="/chat" mode="modal">
              <Button size="xl">Get Started</Button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Button asChild size="xl">
              <Link href="/chat">Get Started</Link>
            </Button>
          </Show>
        </div>
      </section>
    </main>
  );
}

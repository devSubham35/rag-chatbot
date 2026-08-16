import Link from "next/link";
import { Show, SignInButton } from "@clerk/nextjs";
import { buttonVariants } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-[calc(100svh-4rem)] items-center px-4 py-12 sm:px-6">
      <section className="mx-auto w-full max-w-3xl text-center">
        <p className="mb-4 text-muted-foreground text-sm">RAG Chatbot</p>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Chat with your documents.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-muted-foreground text-sm leading-6 sm:text-base sm:leading-7">
          Upload PDFs, index their content, and ask questions with answers
          grounded in your own knowledge base.
        </p>
        <div className="mt-8">
          <Show when="signed-out">
            <SignInButton fallbackRedirectUrl="/chat" mode="modal">
              <button className={buttonVariants({ size: "xl" })} type="button">
                Get Started
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link className={buttonVariants({ size: "xl" })} href="/chat">
              Get Started
            </Link>
          </Show>
        </div>
      </section>
    </main>
  );
}

import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth.protect();

  if (sessionClaims.metadata?.role !== "admin") {
    notFound();
  }

  return children;
}

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { parseStoredMessage } from "@/lib/chat-store";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function GET(_req: Request, context: RouteContext) {
  const { userId } = await auth.protect();
  const { chatId } = await context.params;

  const chat = await prisma.chatSession.findFirst({
    where: {
      id: chatId,
      userId,
    },
    include: {
      messages: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!chat) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json({
    chat: {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
    },
    messages: chat.messages
      .map((message) => parseStoredMessage(message.content))
      .filter((message) => message !== null),
  });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const { userId } = await auth.protect();
  const { chatId } = await context.params;

  const deleted = await prisma.chatSession.deleteMany({
    where: {
      id: chatId,
      userId,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

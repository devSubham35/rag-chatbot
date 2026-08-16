import { auth } from "@clerk/nextjs/server";
import { type UIMessage } from "ai";
import { NextResponse } from "next/server";

import { getChatTitle } from "@/lib/chat-store";
import { prisma } from "@/lib/db";

type RouteContext = {
  params: Promise<{
    chatId: string;
  }>;
};

export async function PUT(req: Request, context: RouteContext) {
  const { userId } = await auth.protect();
  const { chatId } = await context.params;
  const { messages }: { messages?: UIMessage[] } = await req.json();

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "Messages are required" }, { status: 400 });
  }

  const chat = await prisma.chatSession.findUnique({
    where: { id: chatId },
    select: { id: true, userId: true },
  });

  if (chat && chat.userId !== userId) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 });
  }

  const title = getChatTitle(messages);

  if (!chat) {
    await prisma.chatSession.create({
      data: {
        id: chatId,
        userId,
        title,
      },
    });
  }

  await prisma.$transaction([
    prisma.chatMessage.deleteMany({
      where: { chatId },
    }),
    prisma.chatMessage.createMany({
      data: messages.map((message, index) => ({
        chatId,
        messageId: message.id,
        role: message.role,
        content: JSON.stringify(message),
        order: index,
      })),
      skipDuplicates: true,
    }),
    prisma.chatSession.update({
      where: { id: chatId },
      data: { title },
    }),
  ]);

  return NextResponse.json({ ok: true, title });
}

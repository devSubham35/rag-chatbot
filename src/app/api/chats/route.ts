import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getMessageText, parseStoredMessage } from "@/lib/chat-store";
import { prisma } from "@/lib/db";

export async function GET() {
  const { userId } = await auth.protect();

  const chats = await prisma.chatSession.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        orderBy: { order: "desc" },
        take: 1,
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  return NextResponse.json({
    chats: chats.map((chat) => {
      const latestMessage = chat.messages[0]
        ? parseStoredMessage(chat.messages[0].content)
        : null;

      return {
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        messageCount: chat._count.messages,
        preview: latestMessage ? getMessageText(latestMessage) : "",
      };
    }),
  });
}

export async function POST() {
  const { userId } = await auth.protect();

  const chat = await prisma.chatSession.create({
    data: {
      userId,
      title: "New chat",
    },
  });

  return NextResponse.json({
    chat: {
      id: chat.id,
      title: chat.title,
      createdAt: chat.createdAt.toISOString(),
      updatedAt: chat.updatedAt.toISOString(),
      messageCount: 0,
      preview: "",
    },
  });
}

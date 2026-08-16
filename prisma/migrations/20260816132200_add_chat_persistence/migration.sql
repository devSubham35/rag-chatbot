-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New chat',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_sessions_userId_updatedAt_idx" ON "chat_sessions"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "chat_messages_chatId_messageId_key" ON "chat_messages"("chatId", "messageId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_messages_chatId_order_idx" ON "chat_messages"("chatId", "order");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'chat_messages_chatId_fkey'
    ) THEN
        ALTER TABLE "chat_messages"
        ADD CONSTRAINT "chat_messages_chatId_fkey"
        FOREIGN KEY ("chatId") REFERENCES "chat_sessions"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

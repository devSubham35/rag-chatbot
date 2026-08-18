"use client";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";
import { ChatComposer } from "@/components/chat/chat-composer";
import { ChatConversation } from "@/components/chat/chat-conversation";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import type { ChatResponse, ChatSummary } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import { chatModels, defaultChatModel } from "@/lib/chat-models";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import { Menu, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const RagChatBot = () => {
  const [input, setInput] = useState("");
  const [selectedModelId, setSelectedModelId] = useState(defaultChatModel.id);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [loadedChatId, setLoadedChatId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<UIMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const lastSavedSignatureRef = useRef("");

  const persistMessages = useCallback(
    async (chatId: string, nextMessages: UIMessage[]) => {
      if (nextMessages.length === 0) {
        return;
      }

      const signature = `${chatId}:${JSON.stringify(nextMessages)}`;

      if (lastSavedSignatureRef.current === signature) {
        return;
      }

      lastSavedSignatureRef.current = signature;

      const response = await fetch(`/api/chats/${chatId}/messages`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!response.ok) {
        throw new Error("Failed to save chat");
      }

      const data = (await response.json()) as { title?: string };

      setChats((currentChats) => {
        const updatedChats = currentChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                title: data.title ?? chat.title,
                messageCount: nextMessages.length,
                updatedAt: new Date().toISOString(),
              }
            : chat
        );

        return updatedChats.sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
    },
    []
  );

  const { error, messages, sendMessage, setMessages, status } = useChat({
    id: activeChatId ?? "pending-chat",
    messages: activeChatId === loadedChatId ? loadedMessages : [],
    onFinish: ({ messages: finishedMessages }) => {
      if (activeChatId) {
        void persistMessages(activeChatId, finishedMessages);
      }
    },
  });
  const isChatBusy = status === "submitted" || status === "streaming";
  const selectedModel =
    chatModels.find((model) => model.id === selectedModelId) ??
    defaultChatModel;

  const createChat = useCallback(async () => {
    const response = await fetch("/api/chats", { method: "POST" });

    if (!response.ok) {
      throw new Error("Failed to create chat");
    }

    const data = (await response.json()) as ChatResponse;

    setChats((currentChats) => [data.chat, ...currentChats]);
    setActiveChatId(data.chat.id);
    setLoadedChatId(data.chat.id);
    setLoadedMessages([]);
    setMessages([]);
    lastSavedSignatureRef.current = "";
    setInput("");

    return data.chat;
  }, [setMessages]);

  const loadChat = useCallback(
    async (chatId: string) => {
      setActiveChatId(chatId);
      setInput("");
      setIsSidebarOpen(false);

      const response = await fetch(`/api/chats/${chatId}`);

      if (!response.ok) {
        throw new Error("Failed to load chat");
      }

      const data = (await response.json()) as ChatResponse;

      setLoadedChatId(chatId);
      setLoadedMessages(data.messages ?? []);
      lastSavedSignatureRef.current = `${chatId}:${JSON.stringify(
        data.messages ?? []
      )}`;
    },
    []
  );

  const loadChats = useCallback(async () => {
    setIsLoadingChats(true);

    try {
      const response = await fetch("/api/chats");

      if (!response.ok) {
        throw new Error("Failed to load chats");
      }

      const data = (await response.json()) as { chats: ChatSummary[] };
      setChats(data.chats);

      if (data.chats[0]) {
        await loadChat(data.chats[0].id);
      } else {
        await createChat();
      }
    } finally {
      setIsLoadingChats(false);
    }
  }, [createChat, loadChat]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadChats();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadChats]);

  useEffect(() => {
    if (activeChatId === loadedChatId) {
      setMessages(loadedMessages);
    }
  }, [activeChatId, loadedChatId, loadedMessages, setMessages]);

  useEffect(() => {
    if (status === "error" && activeChatId) {
      void persistMessages(activeChatId, messages);
    }
  }, [activeChatId, messages, persistMessages, status]);

  const handleNewChat = async () => {
    if (isChatBusy) {
      return;
    }

    await createChat();
    setIsSidebarOpen(false);
  };

  const handleDeleteChat = async (chatId: string) => {
    if (isChatBusy || deletingChatId) {
      return;
    }

    setDeletingChatId(chatId);

    try {
      const response = await fetch(`/api/chats/${chatId}`, { method: "DELETE" });

      if (!response.ok) {
        throw new Error("Failed to delete chat");
      }

      const remainingChats = chats.filter((chat) => chat.id !== chatId);
      setChats(remainingChats);

      if (activeChatId === chatId) {
        if (remainingChats[0]) {
          await loadChat(remainingChats[0].id);
        } else {
          await createChat();
        }
      }
    } finally {
      setDeletingChatId(null);
    }
  };

  const handleSubmit = (message: PromptInputMessage) => {
    if (!message.text || !activeChatId || isChatBusy) {
      return;
    }

    sendMessage(
      {
        text: message.text,
      },
      {
        body: { chatId: activeChatId, modelId: selectedModelId },
      }
    );
    setInput("");
  };

  const sidebar = (
    <ChatSidebar
      activeChatId={activeChatId}
      chats={chats}
      deletingChatId={deletingChatId}
      isChatBusy={isChatBusy}
      isLoadingChats={isLoadingChats}
      onCloseSidebar={() => setIsSidebarOpen(false)}
      onDeleteChat={(chatId) => void handleDeleteChat(chatId)}
      onLoadChat={(chatId) => void loadChat(chatId)}
      onNewChat={() => void handleNewChat()}
    />
  );

  return (
    <main className="relative h-[calc(100svh-4rem)] overflow-hidden">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 md:hidden">
          <div className="h-full w-72 max-w-[82vw] border-r bg-background">
            {sidebar}
          </div>
        </div>
      )}

      <div className="flex h-full min-h-0">
        <div className="hidden md:block">{sidebar}</div>

        <section className="mx-auto flex h-full min-w-0 flex-1 flex-col px-3 sm:px-4">
          <div className="flex h-11 items-center gap-2 md:hidden">
            <Button
              aria-label="Open sidebar"
              onClick={() => setIsSidebarOpen(true)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <Menu />
            </Button>
            <Button
              className="gap-1"
              disabled={isLoadingChats || isChatBusy}
              onClick={handleNewChat}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus />
              New chat
            </Button>
          </div>

          <div className="mx-auto flex h-full min-h-0 w-full max-w-4xl flex-col pb-3 sm:pb-5">
            <ChatConversation
              error={error}
              isLoadingChats={isLoadingChats}
              messages={messages}
              status={status}
            />

            <ChatComposer
              activeChatId={activeChatId}
              input={input}
              isChatBusy={isChatBusy}
              isLoadingChats={isLoadingChats}
              isModelSelectorOpen={isModelSelectorOpen}
              onInputChange={setInput}
              onModelSelectorOpenChange={setIsModelSelectorOpen}
              onSelectedModelChange={setSelectedModelId}
              onSubmit={handleSubmit}
              selectedModel={selectedModel}
              selectedModelId={selectedModelId}
              status={status}
            />
          </div>
        </section>
      </div>
    </main>
  );
};

export default RagChatBot;

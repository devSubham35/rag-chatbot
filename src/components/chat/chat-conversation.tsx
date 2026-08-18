"use client";

import { ConversationSkeleton } from "@/components/chat/chat-skeletons";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import type { ChatStatus, UIMessage } from "ai";
import { Loader } from "lucide-react";
import { Fragment } from "react";

type ChatConversationProps = {
  error?: Error;
  isLoadingChats: boolean;
  messages: UIMessage[];
  status: ChatStatus;
};

export const ChatConversation = ({
  error,
  isLoadingChats,
  messages,
  status,
}: ChatConversationProps) => (
  <Conversation className="scrollbar-none">
    <ConversationContent className="scrollbar-none">
      {isLoadingChats ? (
        <ConversationSkeleton />
      ) : (
        messages.length === 0 && (
          <div className="flex min-h-[calc(100svh-18rem)] items-center justify-center text-center">
            <p className="text-sm text-foreground/30">
              No chats yet. Ask something to get started.
            </p>
          </div>
        )
      )}

      {messages.map((message) => (
        <div key={message.id}>
          {message.parts.map((part, index) => {
            switch (part.type) {
              case "text":
                return (
                  <Fragment key={`${message.id}-${index}`}>
                    <Message from={message.role}>
                      <MessageContent>
                        <MessageResponse className="font-sans text-sm font-normal leading-6">
                          {part.text}
                        </MessageResponse>
                      </MessageContent>
                    </Message>
                  </Fragment>
                );
              default:
                return null;
            }
          })}
        </div>
      ))}

      {(status === "submitted" || status === "streaming") && (
        <Loader className="animate-spin" size={20} />
      )}

      {status === "error" && error && (
        <Message from="assistant">
          <MessageContent>
            <p className="text-sm leading-6 text-destructive">
              {error.message.includes("quota")
                ? "The AI provider quota is currently exhausted. Please wait a moment and try again."
                : "I could not generate a response. Please try again."}
            </p>
          </MessageContent>
        </Message>
      )}
    </ConversationContent>
    <ConversationScrollButton />
  </Conversation>
);

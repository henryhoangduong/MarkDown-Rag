"use client";

import FileSelect from "@/components/files-select";
import UseFileName from "@/hooks/use-file-name";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatBubble } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleAction } from "@/components/ui/chat/chat-bubble";
import { ChatBubbleMessage } from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import MessageLoading from "@/components/ui/chat/message-loading";
import useChatStore from "@/hooks/use-chat-store";
import { AnimatePresence, motion } from "framer-motion";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

export default function Page() {
  const messages = useChatStore((state) => state.chatBotMessages);
  const setMessages = useChatStore((state) => state.setchatBotMessages);
  const selectedUser = useChatStore((state) => state.selectedUser);
  const input = useChatStore((state) => state.input);
  const setInput = useChatStore((state) => state.setInput);
  const handleInputChange = useChatStore((state) => state.handleInputChange);
  const fileName = UseFileName();
  const [isLoading, setisLoading] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const getMessageVariant = (role: string) =>
    role === "ai" ? "received" : "sent";
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      handleSendMessage(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };
  const { mutate, isPending } = useMutation({
    mutationFn: (message: string) =>
      fetch(`/api/chat/files?fileName=${fileName}`, {
        method: "POST",
        body: JSON.stringify({
          message:message,
        }),
      }).then((res) => res.json()),
    onSuccess: (data) => {
      setMessages((messages) => [
        ...messages,
        {
          id: messages.length + 1,
          avatar: "",
          name: "ChatBot",
          role: "ai",
          message: data.response.answer,
        },
      ]);
    },
  });

  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    setisLoading(true);
    e.preventDefault();
    if (!input) return;

    setMessages((messages) => [
      ...messages,
      {
        id: messages.length + 1,
        avatar: selectedUser.avatar,
        name: selectedUser.name,
        role: "user",
        message: input,
      },
    ]);
    setInput("");
    formRef.current?.reset();
    if (isPending) return;
    mutate(input);
    setisLoading(false);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  return (
    <div className="flex h-full w-full flex-col">
      <FileSelect />
      <div className="flex-1 w-full overflow-y-auto bg-muted/40">
        <ChatMessageList ref={messagesContainerRef}>
          {/* Chat messages */}
          <AnimatePresence>
            {messages.map((message, index) => {
              const variant = getMessageVariant(message.role!);
              return (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                  transition={{
                    opacity: { duration: 0.1 },
                    layout: {
                      type: "spring",
                      bounce: 0.3,
                      duration: index * 0.05 + 0.2,
                    },
                  }}
                  style={{ originX: 0.5, originY: 0.5 }}
                  className="flex flex-col gap-2 p-4"
                >
                  <ChatBubble key={index} variant={variant}>
                    <Avatar>
                      <AvatarImage
                        src={message.role === "ai" ? "" : message.avatar}
                        alt="Avatar"
                        className={message.role === "ai" ? "dark:invert" : ""}
                      />
                      <AvatarFallback>
                        {message.role === "ai" ? "🤖" : "GG"}
                      </AvatarFallback>
                    </Avatar>
                    <ChatBubbleMessage isLoading={message.isLoading}>
                      {message.message}
                      {message.role === "ai" && (
                        <div className="flex items-center mt-1.5 gap-1">
                          {!message.isLoading && (
                            <>
                              {ChatAiIcons.map((icon, index) => {
                                const Icon = icon.icon;
                                return (
                                  <ChatBubbleAction
                                    variant="outline"
                                    className="size-6"
                                    key={index}
                                    icon={<Icon className="size-3" />}
                                    onClick={() =>
                                      console.log(
                                        "Action " +
                                          icon.label +
                                          " clicked for message " +
                                          index,
                                      )
                                    }
                                  />
                                );
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </ChatBubbleMessage>
                  </ChatBubble>
                </motion.div>
              );
            })}
            {isPending && (
              <div className="ml-5 flex items-center space-x-2">
                <MessageLoading />
              </div>
            )}
          </AnimatePresence>
        </ChatMessageList>
      </div>
      <div className="px-4 pb-4 bg-muted/40">
        <form
          ref={formRef}
          onSubmit={handleSendMessage}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            ref={inputRef}
            onKeyDown={handleKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="min-h-12 resize-none rounded-lg bg-background border-0 p-3 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon" onClick={handleClick}>
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5 cursor-pointer"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

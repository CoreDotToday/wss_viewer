import { useState, useCallback } from "react";
import { WebSocketMessage } from "@/types/websocket";

interface VoiceMessage {
  url: string;
  length: number;
}

export function useMessages() {
  const [messages, setMessages] = useState<string[]>([]);
  const [rawMessages, setRawMessages] = useState<WebSocketMessage[]>([]);
  const [completedMessages, setCompletedMessages] = useState<
    {
      id: string;
      content: string;
      timestamp: number;
      type?: "user" | "assistant" | "status";
    }[]
  >([]);
  const [currentStreamingMessage, setCurrentStreamingMessage] = useState<{
    id: string;
    content: string;
    isComplete: boolean;
  }>({
    id: "",
    content: "",
    isComplete: false,
  });

  const handleWebSocketMessage = useCallback(
    (
      message: WebSocketMessage | string,
      onVoiceReady?: (voiceMessage: VoiceMessage) => void
    ) => {
      if (typeof message === "string") {
        setCompletedMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: message,
            timestamp: Date.now(),
            type: "user",
          },
        ]);
        return;
      }

      setRawMessages((prev) => [...prev, message]);

      if (message.msgtype === "info") {
        setCompletedMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: `[${message.status}] ${message.msg}`,
            timestamp: Date.now(),
            type: "status",
          },
        ]);

        if (message.status === "voice_ready" && message.voice_url) {
          onVoiceReady?.({
            url: message.voice_url,
            length: message.voice_length || 0,
          });
        }
      }

      if (
        message.msgtype === "stream" &&
        message.event === "on_chat_model_stream"
      ) {
        const newContent = message.data?.chunk?.content || "";

        if (!currentStreamingMessage.id) {
          setCurrentStreamingMessage({
            id: message.sent_uid || crypto.randomUUID(),
            content: newContent,
            isComplete: false,
          });
        } else {
          setCurrentStreamingMessage((prev) => ({
            ...prev,
            content: prev.content + newContent,
          }));
        }
      }

      if (message.status === "END" && currentStreamingMessage.content) {
        setCompletedMessages((prev) => [
          ...prev,
          {
            id: currentStreamingMessage.id,
            content: currentStreamingMessage.content,
            timestamp: Date.now(),
            type: "assistant",
          },
        ]);
        setCurrentStreamingMessage({
          id: "",
          content: "",
          isComplete: false,
        });
      }
    },
    [currentStreamingMessage]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setRawMessages([]);
    setCompletedMessages([]);
    setCurrentStreamingMessage({
      id: "",
      content: "",
      isComplete: false,
    });
  }, []);

  return {
    messages,
    rawMessages,
    completedMessages,
    currentStreamingMessage,
    handleWebSocketMessage,
    clearMessages,
  };
}

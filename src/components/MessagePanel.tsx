import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TabType } from "@/types/ui";
import { WebSocketMessage } from "@/types/websocket";

interface MessagePanelProps {
  messages: string[];
  rawMessages: WebSocketMessage[];
  completedMessages: {
    id: string;
    content: string;
    timestamp: number;
  }[];
  currentStreamingMessage: {
    content: string;
    isComplete: boolean;
  };
  showMessages: boolean;
  autoScroll: boolean;
}

export function MessagePanel({
  messages,
  rawMessages,
  completedMessages,
  currentStreamingMessage,
  showMessages,
  autoScroll,
}: MessagePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("chat");

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentStreamingMessage, autoScroll, activeTab]);

  if (!showMessages) return null;

  return (
    <div className="flex-1 flex flex-col bg-muted/50 rounded-lg my-4">
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("chat")}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            activeTab === "chat"
              ? "border-b-2 border-primary"
              : "text-muted-foreground"
          )}
        >
          채팅
        </button>
        <button
          onClick={() => setActiveTab("raw")}
          className={cn(
            "px-4 py-2 text-sm font-medium",
            activeTab === "raw"
              ? "border-b-2 border-primary"
              : "text-muted-foreground"
          )}
        >
          RAW 데이터
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {activeTab === "chat" ? (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg",
                  message.startsWith("전송:")
                    ? "bg-blue-100 dark:bg-blue-900/30 ml-auto max-w-[80%]"
                    : "bg-gray-100 dark:bg-gray-900/30"
                )}
              >
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {message}
                </pre>
              </div>
            ))}

            {completedMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">
                    응답 완료 ({new Date(msg.timestamp).toLocaleTimeString()})
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-words text-sm">
                  {msg.content}
                </pre>
              </div>
            ))}

            {currentStreamingMessage.content &&
              !currentStreamingMessage.isComplete && (
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 opacity-90">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-muted-foreground">
                      응답 중...
                    </span>
                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <pre className="whitespace-pre-wrap break-words text-sm">
                    {currentStreamingMessage.content}
                  </pre>
                </div>
              )}
          </>
        ) : (
          <div className="bg-gray-100 dark:bg-gray-900/30 p-4 rounded-lg">
            <pre className="text-xs overflow-x-auto">
              {rawMessages.map((msg, index) => (
                <div key={index} className="mb-2">
                  {JSON.stringify(msg, null, 2)}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

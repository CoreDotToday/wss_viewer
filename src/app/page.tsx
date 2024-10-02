"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

type PresetMessage = {
  label: string;
  content: string;
};

const presetMessages: PresetMessage[] = [
  {
    label: "상태 조회",
    content: JSON.stringify({ action: "status" }, null, 2),
  },
  {
    label: "기본 메시지",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o-mini",
        room_uid: "3n9X1rcld22t",
        filename: "A.png",
        user_id: "user_123",
        questioner: "고객",
        visitor_name: "김철수",
        msg: "안녕하세요? Sample 1 메시지입니다.",
        api_key: "API 키",
        return_voice: 0,
      },
      null,
      2
    ),
  },
  {
    label: "전체 메시지",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "4b2T9kcpv88j",
        filename: "B.png",
        user_id: "user_456",
        questioner: "고객",
        visitor_name: "이영희",
        msg: "안녕하세요? Sample 2 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 1,
        stream: 1,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
  {
    label: "Completion 테스트",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "6x9V2jsld98h",
        user_id: "user_789",
        questioner: "고객",
        visitor_name: "박지민",
        msg: "안녕하세요? Sample 3 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        stream: 0,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 4",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "9u1V8pld33b",
        filename: "D.png",
        user_id: "user_101",
        questioner: "고객",
        visitor_name: "정호석",
        msg: "안녕하세요? Sample 4 메시지입니다.",
        api_key: "API 키",
        return_voice: 0,
        scene_number: 3,
        stream: 1,
        no_save: 1,
        no_history: 0,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 5",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "2b7V9kln66p",
        filename: "E.png",
        user_id: "user_202",
        questioner: "고객",
        visitor_name: "손흥민",
        msg: "안녕하세요? Sample 5 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 4,
        stream: 0,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 6",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "2b7V9kln66p",
        filename: "E.png",
        user_id: "user_202",
        questioner: "고객",
        visitor_name: "손흥민",
        msg: "안녕하세요? Sample 5 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 4,
        stream: 0,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 7",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "2b7V9kln66p",
        filename: "E.png",
        user_id: "user_202",
        questioner: "고객",
        visitor_name: "손흥민",
        msg: "안녕하세요? Sample 5 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 4,
        stream: 0,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 8",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "2b7V9kln66p",
        filename: "E.png",
        user_id: "user_202",
        questioner: "고객",
        visitor_name: "손흥민",
        msg: "안녕하세요? Sample 5 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 4,
        stream: 0,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
  {
    label: "Sample 9",
    content: JSON.stringify(
      {
        action: "sendmsg",
        model: "gpt-4o",
        room_uid: "2b7V9kln66p",
        filename: "E.png",
        user_id: "user_202",
        questioner: "고객",
        visitor_name: "손흥민",
        msg: "안녕하세요? Sample 5 메시지입니다.",
        api_key: "API 키",
        return_voice: 1,
        scene_number: 4,
        stream: 0,
        no_save: 1,
        no_history: 1,
      },
      null,
      2
    ),
  },
];

type StreamMessage = {
  status: string;
  event?: string;
  content?: string;
};

export default function WebSocketChat() {
  const [wsUrl, setWsUrl] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>("");
  const [isPresetOpen, setIsPresetOpen] = useState<boolean>(false);
  const [showMessages, setShowMessages] = useState<boolean>(false);
  const [enableVoice, setEnableVoice] = useState<boolean>(false);
  const [streamMessages, setStreamMessages] = useState<StreamMessage[]>([]);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const ws = useRef<WebSocket | null>(null);
  const audioQueue = useRef<string[]>([]);
  const [audioQueueState, setAudioQueueState] = useState<string[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const filteredMessagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessageRef = useRef<string>("");

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current && autoScroll) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const connectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }

    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
      setIsConnected(true);
      setMessages((prev) => [...prev, "Connected to WebSocket"]);
      toast({
        title: "Connected",
        description: "Successfully connected to WebSocket",
      });
    };

    ws.current.onmessage = (event: MessageEvent) => {
      const message = event.data;
      setMessages((prev) => {
        const newMessages = [...prev, message];
        setTimeout(() => scrollToBottom(messagesEndRef), 0);
        return newMessages;
      });

      try {
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.status === "START") {
          // Message stream starting
          currentMessageRef.current = "";

          // Optionally, add a new message to streamMessages indicating a new message has started
          setStreamMessages((prev) => [
            ...prev,
            {
              status: "in-progress",
              event: parsedMessage.event,
              content: "",
            },
          ]);
        }

        if (
          parsedMessage.event === "on_chat_model_stream" &&
          parsedMessage.data?.chunk?.content
        ) {
          // Append the chunk content to currentMessageRef.current
          currentMessageRef.current += parsedMessage.data.chunk.content;

          setStreamMessages((prev) => {
            const newStreamMessages = [...prev];
            // Check if the last message is the current in-progress message
            if (
              newStreamMessages.length > 0 &&
              newStreamMessages[newStreamMessages.length - 1].status ===
                "in-progress"
            ) {
              // Update the content of the last message
              newStreamMessages[newStreamMessages.length - 1].content =
                currentMessageRef.current;
            } else {
              // Add a new in-progress message if none exists
              newStreamMessages.push({
                status: "in-progress",
                event: parsedMessage.event,
                content: currentMessageRef.current,
              });
            }
            setTimeout(() => scrollToBottom(filteredMessagesEndRef), 0);
            return newStreamMessages;
          });
        }

        if (parsedMessage.status === "END") {
          // Message stream ended
          // Mark the last message as completed
          setStreamMessages((prev) => {
            const newStreamMessages = [...prev];
            if (
              newStreamMessages.length > 0 &&
              newStreamMessages[newStreamMessages.length - 1].status ===
                "in-progress"
            ) {
              newStreamMessages[newStreamMessages.length - 1].status =
                "completed";
            }
            return newStreamMessages;
          });
          // Reset current message
          currentMessageRef.current = "";
        }

        // Handle other status messages without resetting currentMessageRef.current
        if (
          parsedMessage.status &&
          parsedMessage.status !== "START" &&
          parsedMessage.status !== "END"
        ) {
          // Add the new status message to streamMessages
          const newStreamMessage: StreamMessage = {
            status: parsedMessage.status,
          };
          setStreamMessages((prev) => [...prev, newStreamMessage]);
          setTimeout(() => scrollToBottom(filteredMessagesEndRef), 0);
        }

        if (parsedMessage.status === "voice_ready" && parsedMessage.voice_url) {
          if (enableVoice) {
            audioQueue.current.push(parsedMessage.voice_url);
            setAudioQueueState([...audioQueue.current]); // Update the UI state
            playNextAudio();
          }
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
      setMessages((prev) => [...prev, "Disconnected from WebSocket"]);
      toast({
        title: "Disconnected",
        description: "WebSocket connection closed",
        variant: "destructive",
      });
    };

    ws.current.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
      setMessages((prev) => [...prev, "WebSocket error occurred"]);
      toast({
        title: "Error",
        description: "WebSocket error occurred",
        variant: "destructive",
      });
    };
  };

  const disconnectWebSocket = () => {
    if (ws.current) {
      ws.current.close();
    }
  };

  const sendMessage = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(inputMessage);
      setMessages((prev) => [...prev, `Sent: ${inputMessage}`]);
      toast({
        title: "Message Sent",
        description: "Your message was successfully sent",
      });
    } else {
      setMessages((prev) => [...prev, "Not connected. Message not sent."]);
      toast({
        title: "Error",
        description: "Not connected. Message not sent.",
        variant: "destructive",
      });
    }
  };

  const setPresetMessage = (content: string) => {
    setInputMessage(content);
  };

  const playNextAudio = () => {
    if (audioQueue.current.length > 0 && !audioElement.current) {
      const nextAudioUrl = audioQueue.current.shift();
      setAudioQueueState([...audioQueue.current]); // Update the UI state
      if (nextAudioUrl) {
        audioElement.current = new Audio(nextAudioUrl);
        audioElement.current.onended = () => {
          audioElement.current = null;
          playNextAudio();
        };
        audioElement.current.play();
      }
    }
  };

  const clearAllMessages = () => {
    setMessages([]);
    setStreamMessages([]);
    toast({
      title: "Messages Cleared",
      description: "All messages have been deleted",
    });
  };

  const clearAudioQueue = () => {
    audioQueue.current = [];
    setAudioQueueState([]);
    if (audioElement.current) {
      audioElement.current.pause();
      audioElement.current = null;
    }
    toast({
      title: "Audio Queue Cleared",
      description: "All audio files have been removed from the queue",
    });
  };

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // Auto-scroll when messages change
  useEffect(() => {
    if (autoScroll) {
      scrollToBottom(messagesEndRef);
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom(filteredMessagesEndRef);
    }
  }, [streamMessages, autoScroll]);

  return (
    <div className="flex flex-col h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4">WebSocket Chat</h1>
      <div className="flex space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Enter WebSocket URL"
          value={wsUrl}
          onChange={(e) => setWsUrl(e.target.value)}
          className="flex-grow"
        />
        <Button
          onClick={isConnected ? disconnectWebSocket : connectWebSocket}
          variant={isConnected ? "destructive" : "default"}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </Button>
      </div>
      <div className="flex space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="show-messages"
            checked={showMessages}
            onCheckedChange={(checked) => setShowMessages(checked === true)}
          />
          <label htmlFor="show-messages">메시지 보기</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="enable-voice"
            checked={enableVoice}
            onCheckedChange={(checked) => setEnableVoice(checked === true)}
          />
          <label htmlFor="enable-voice">음성 출력하기</label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="auto-scroll"
            checked={autoScroll}
            onCheckedChange={(checked) => setAutoScroll(checked === true)}
          />
          <label htmlFor="auto-scroll">자동 스크롤</label>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline">메시지 삭제하기</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                모든 메시지를 삭제하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 모든 메시지가 영구적으로
                삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllMessages}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <PanelGroup direction="vertical" className="flex-grow">
        <Panel defaultSize={50} minSize={20}>
          <ScrollArea className="h-full border rounded-md p-4 bg-secondary">
            {messages.map((msg, index) => (
              <div key={index} className="mb-2">
                {msg}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </Panel>
        <PanelResizeHandle className="h-2 bg-gray-200 hover:bg-gray-300 transition-colors" />
        <Panel defaultSize={50} minSize={20}>
          {showMessages ? (
            <ScrollArea className="h-full border rounded-md p-4 bg-secondary">
              {streamMessages.map((msg, index) => (
                <div key={index} className="mb-2">
                  {msg.status && msg.status !== "completed" && (
                    <>
                      <strong>Status:</strong> {msg.status}
                    </>
                  )}
                  <div>
                    {msg.content !== undefined && (
                      <span style={{ whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <div ref={filteredMessagesEndRef} />
            </ScrollArea>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              메시지 보기가 비활성화되었습니다.
            </div>
          )}
        </Panel>
      </PanelGroup>
      <div className="flex flex-col space-y-2 mt-4">
        <Textarea
          placeholder="Type your message here"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-grow"
        />
        <div className="flex justify-between items-center">
          <Button
            onClick={sendMessage}
            disabled={!inputMessage || !isConnected}
          >
            Send
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPresetOpen(!isPresetOpen)}
            className="flex items-center"
          >
            Presets{" "}
            {isPresetOpen ? (
              <ChevronUp className="ml-2" />
            ) : (
              <ChevronDown className="ml-2" />
            )}
          </Button>
        </div>
        <div
          className={`grid grid-cols-5 gap-2 overflow-hidden transition-all duration-300 ease-in-out ${
            isPresetOpen ? "max-h-40" : "max-h-0"
          }`}
        >
          {presetMessages.map((preset, index) => (
            <Button
              key={index}
              onClick={() => setPresetMessage(preset.content)}
              variant="outline"
              size="sm"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Audio Queue UI */}
      <div className="mt-4">
        <h2 className="text-xl font-bold mb-2">Audio Queue</h2>
        {audioQueueState.length > 0 ? (
          <ul className="list-disc list-inside">
            {audioQueueState.map((url, index) => (
              <li key={index}>{url}</li>
            ))}
          </ul>
        ) : (
          <p>No audio in queue.</p>
        )}
        {audioQueueState.length > 0 && (
          <Button variant="outline" onClick={clearAudioQueue} className="mt-2">
            Clear Audio Queue
          </Button>
        )}
      </div>
    </div>
  );
}

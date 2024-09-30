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
    label: "Status",
    content: JSON.stringify({ action: "status" }, null, 2),
  },
  {
    label: "Sample 1",
    content: JSON.stringify(
      {
        action: "sendmsg",
        room_uid: "51VPKp3F0yP3",
        api_key: "33b52d9512873d194f2",
        msg: "안녕 반가워요",
        userid: "abc",
      },
      null,
      2
    ),
  },
  // Add more preset messages here...
];

// Fill up to 10 preset messages
while (presetMessages.length < 10) {
  presetMessages.push({
    label: `Sample ${presetMessages.length + 1}`,
    content: JSON.stringify(
      {
        action: "sample",
        id: presetMessages.length + 1,
      },
      null,
      2
    ),
  });
}

type StreamMessage = {
  content: string;
  role: string;
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

      if (message.includes("<SOM>")) {
        currentMessageRef.current = message.replace("<SOM>", "");
      } else if (message.includes("<EOM>")) {
        currentMessageRef.current += message.replace("<EOM>", "");
        updateStreamMessages(currentMessageRef.current, "assistant");
        currentMessageRef.current = "";
      } else {
        currentMessageRef.current += message;
      }

      try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.status === "voice_ready" && parsedMessage.voice_url) {
          if (enableVoice) {
            audioQueue.current.push(parsedMessage.voice_url);
            playNextAudio();
          }
        }
      } catch (error) {
        // Not a JSON message, ignore
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

  const updateStreamMessages = (content: string, role: string) => {
    setStreamMessages((prev) => {
      const newStreamMessages = [...prev, { content, role }];
      setTimeout(() => scrollToBottom(filteredMessagesEndRef), 0);
      return newStreamMessages;
    });
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
    if (audioQueue.current.length > 0 && !audioElement.current?.src) {
      const nextAudioUrl = audioQueue.current.shift();
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

  useEffect(() => {
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

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
                  <strong>{msg.role}:</strong> {msg.content}
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
    </div>
  );
}

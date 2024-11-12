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
  const {
    messages,
    rawMessages,
    completedMessages,
    currentStreamingMessage,
    handleWebSocketMessage,
    clearMessages,
  } = useMessages();

  const {
    audioQueue,
    addToQueue,
    clearQueue,
    isPlaying,
    isInitialized,
    initializeAudio,
  } = useAudioPlayer();

  const [settings, setSettings] = useState({
    showMessages: true,
    enableVoice: true,
    autoScroll: true,
  });

  const onWebSocketMessage = useCallback(
    (message: string) => {
      try {
        const parsedMessage = JSON.parse(message) as WebSocketMessage;
        handleWebSocketMessage(parsedMessage, (voiceMessage) => {
          if (settings.enableVoice && voiceMessage.url && voiceMessage.length) {
            console.log("음성 재생 시도:", voiceMessage);
            addToQueue(voiceMessage.url, voiceMessage.length);
          }
        });
      } catch (error) {
        console.error("메시지 파싱 에러:", error);
      }
    },
    [handleWebSocketMessage, settings.enableVoice, addToQueue]
  );

  const { state, connect, disconnect, socket } = useWebSocket({
    onMessage: onWebSocketMessage,
  });

  const handleSendMessage = useCallback(
    (message: string) => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(message);
        handleWebSocketMessage(`전송: ${message}`);
      } else {
        handleWebSocketMessage("오류: WebSocket이 연결되지 않았습니다.");
      }
    },
    [socket, handleWebSocketMessage]
  );

  const handleInitializeAudio = async () => {
    const success = await initializeAudio();
    if (success) {
      console.log("오디오 초기화 성공");
    }
  };

  useEffect(() => {
    const handleInteraction = () => {
      if (settings.enableVoice) {
        initializeAudio();
      }
    };

    window.addEventListener("click", handleInteraction);
    window.addEventListener("touchstart", handleInteraction);

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("touchstart", handleInteraction);
    };
  }, [settings.enableVoice, initializeAudio]);

  return (
    <div className="flex flex-col h-screen p-4 bg-background">
      <h1 className="text-2xl font-bold mb-4">WebSocket 채팅</h1>

      <ChatInterface
        wsState={state}
        onConnect={connect}
        onDisconnect={disconnect}
        onSendMessage={handleSendMessage}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <MessagePanel
        messages={messages}
        rawMessages={rawMessages}
        completedMessages={completedMessages}
        currentStreamingMessage={currentStreamingMessage}
        showMessages={settings.showMessages}
        autoScroll={settings.autoScroll}
      />

      <AudioQueue
        queue={audioQueue}
        isPlaying={isPlaying}
        isInitialized={isInitialized}
        onClear={clearQueue}
        onInitialize={handleInitializeAudio}
      />
    </div>
  );
}

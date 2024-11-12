"use client";

import { useState, useCallback, useEffect } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ChatInterface } from "@/components/ChatInterface";
import { MessagePanel } from "@/components/MessagePanel";
import { AudioQueue } from "@/components/AudioQueue";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useMessages } from "@/hooks/useMessages";
import { WebSocketMessage } from "@/types/websocket";

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

import { useState, useRef, useCallback, useEffect } from "react";
import { WebSocketState } from "@/types/websocket";

interface UseWebSocketProps {
  onMessage?: (message: string) => void;
}

export function useWebSocket({ onMessage }: UseWebSocketProps = {}) {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    url: "",
  });
  const ws = useRef<WebSocket | null>(null);

  const connect = useCallback(
    (url: string) => {
      if (ws.current) {
        ws.current.close();
      }

      const socket = new WebSocket(url);
      ws.current = socket;

      socket.onopen = () => {
        setState((prev) => ({ ...prev, isConnected: true, url }));
        console.log("WebSocket 연결됨");
      };

      socket.onclose = () => {
        setState((prev) => ({ ...prev, isConnected: false }));
        console.log("WebSocket 연결 해제됨");
      };

      socket.onmessage = (event) => {
        console.log("메시지 수신:", event.data);
        onMessage?.(event.data);
      };

      socket.onerror = (error) => {
        console.error("WebSocket 에러:", error);
      };

      return socket;
    },
    [onMessage]
  );

  const disconnect = useCallback(() => {
    ws.current?.close();
  }, []);

  // 컴포넌트 언마운트 시 연결 해제
  useEffect(() => {
    return () => {
      ws.current?.close();
    };
  }, []);

  return {
    state,
    connect,
    disconnect,
    socket: ws.current,
  };
}

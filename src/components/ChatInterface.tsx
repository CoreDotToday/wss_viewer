import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { WebSocketState } from "@/types/websocket";

interface ChatInterfaceProps {
  wsState: WebSocketState;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
  onSendMessage: (message: string) => void;
  settings: {
    showMessages: boolean;
    enableVoice: boolean;
    autoScroll: boolean;
  };
  onSettingsChange: (settings: any) => void;
}

export function ChatInterface({
  wsState,
  onConnect,
  onDisconnect,
  onSendMessage,
  settings,
  onSettingsChange,
}: ChatInterfaceProps) {
  const [url, setUrl] = useState(
    "wss://ws.api.chldo.com/v4/?room_uid=GnF0K9GiYXlH&user_uid=demo"
  );
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="WebSocket URL"
          disabled={wsState.isConnected}
        />
        <Button
          onClick={() =>
            wsState.isConnected ? onDisconnect() : onConnect(url)
          }
        >
          {wsState.isConnected ? "연결 해제" : "연결"}
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.showMessages}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, showMessages: checked })
            }
          />
          <span>메시지 표시</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.enableVoice}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, enableVoice: checked })
            }
          />
          <span>음성 활성화</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.autoScroll}
            onCheckedChange={(checked) =>
              onSettingsChange({ ...settings, autoScroll: checked })
            }
          />
          <span>자동 스크롤</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              onSendMessage(message);
              setMessage("");
            }
          }}
        />
        <Button
          onClick={() => {
            onSendMessage(message);
            setMessage("");
          }}
          disabled={!wsState.isConnected}
        >
          전송
        </Button>
      </div>
    </div>
  );
}

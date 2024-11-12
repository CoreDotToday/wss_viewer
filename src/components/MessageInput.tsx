import { useState, useCallback, KeyboardEvent } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";

const PRESETS = {
  preset1: {
    action: "status",
  },
  preset2: {
    action: "sendmsg",
    room_uid: "51VPKp3F0yP1",
    api_key: "API키",
    msg: "안녕 반가워요",
    user_id: "demo",
    return_voice: 1,
    scene_number: 1,
    stream: 1,
    no_save: 1,
    no_history: 1,
  },
  preset3: {
    action: "sendmsg",
    room_uid: "51VPKp3F0yP1",
    api_key: "API키",
    msg: "안녕 반가워요",
    user_id: "demo",
  },
};

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = useCallback(() => {
    if (message.trim()) {
      onSend(message);
    }
  }, [message, onSend]);

  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handlePresetSelect = useCallback((preset: string) => {
    const selectedPreset = PRESETS[preset as keyof typeof PRESETS];
    setMessage(JSON.stringify(selectedPreset, null, 4));
  }, []);

  return (
    <div className="p-4 border-t">
      <div className="flex gap-2 mb-2">
        <Select onValueChange={handlePresetSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="프리셋 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preset1">Preset 1 (Status)</SelectItem>
            <SelectItem value="preset2">Preset 2 (Full Message)</SelectItem>
            <SelectItem value="preset3">Preset 3 (Simple Message)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          placeholder="메시지를 입력하세요..."
          className="flex-1 min-h-[100px]"
        />
        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          className="self-end"
        >
          전송
        </Button>
      </div>
    </div>
  );
}

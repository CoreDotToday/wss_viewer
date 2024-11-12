export interface WebSocketMessage {
  status: string;
  connection_id: string;
  stream_uid: string;
  scene_number: number;
  room_uid: string;
  msg: string;
  is_stream: boolean;
  msgtype: string;
  sent_uid?: string;
  event?: string;
  data?: {
    chunk?: {
      content: string;
    };
  };
  voice_url?: string;
  voice_length?: number;
}

export type StreamingMessage = {
  id: string;
  content: string;
  isComplete: boolean;
};

export type WebSocketState = {
  isConnected: boolean;
  url: string;
};

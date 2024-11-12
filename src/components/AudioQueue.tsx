import { cn } from "@/lib/utils";

interface AudioQueueProps {
  queue: { url: string; length: number }[];
  isPlaying: boolean;
  isInitialized: boolean;
  onClear: () => void;
  onInitialize: () => void;
}

export function AudioQueue({
  queue,
  isPlaying,
  isInitialized,
  onClear,
  onInitialize,
}: AudioQueueProps) {
  return (
    <div className="fixed bottom-4 right-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-lg">
      <div className="flex items-center gap-3">
        {!isInitialized && (
          <button
            onClick={onInitialize}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            음성 활성화
          </button>
        )}
        <div className="flex items-center gap-2">
          {isPlaying && (
            <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full" />
          )}
          <span className="text-sm">
            {isInitialized ? (isPlaying ? "재생 중" : "대기 중") : "비활성화"} (
            {queue.length} 개)
          </span>
        </div>
        {queue.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-600"
          >
            초기화
          </button>
        )}
      </div>
    </div>
  );
}

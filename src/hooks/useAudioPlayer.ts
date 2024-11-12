import { useState, useCallback, useRef, useEffect } from "react";

interface AudioItem {
  url: string;
  length: number;
}

export function useAudioPlayer() {
  const [audioQueue, setAudioQueue] = useState<AudioItem[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 오디오 초기화
  const initializeAudio = useCallback(async () => {
    try {
      if (!audioRef.current) {
        const audio = new Audio();

        // 이벤트 리스너 설정
        audio.addEventListener("play", () => {
          console.log("재생 시작");
          setIsPlaying(true);
        });

        audio.addEventListener("ended", () => {
          console.log("재생 완료");
          setIsPlaying(false);
          setAudioQueue((prev) => prev.slice(1)); // 재생 완료된 항목 제거
        });

        audio.addEventListener("error", (e) => {
          console.error("재생 오류:", e);
          setIsPlaying(false);
          setAudioQueue((prev) => prev.slice(1));
        });

        audioRef.current = audio;
      }

      setIsInitialized(true);
      return true;
    } catch (error) {
      console.error("오디오 초기화 실패:", error);
      return false;
    }
  }, []);

  // 큐 처리
  useEffect(() => {
    const playNext = async () => {
      if (
        !isInitialized ||
        !audioRef.current ||
        audioQueue.length === 0 ||
        isPlaying
      ) {
        return;
      }

      try {
        const currentItem = audioQueue[0];
        console.log("다음 항목 재생:", currentItem);

        audioRef.current.src = currentItem.url;
        const playPromise = audioRef.current.play();

        if (playPromise) {
          await playPromise;
        }
      } catch (error) {
        console.error("재생 시도 실패:", error);
        setAudioQueue((prev) => prev.slice(1));
      }
    };

    playNext();
  }, [audioQueue, isPlaying, isInitialized]);

  const addToQueue = useCallback((url: string, length: number) => {
    console.log("큐에 추가:", { url, length });
    setAudioQueue((prev) => [...prev, { url, length }]);
  }, []);

  const clearQueue = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setAudioQueue([]);
    setIsPlaying(false);
  }, []);

  return {
    audioQueue,
    isPlaying,
    isInitialized,
    addToQueue,
    clearQueue,
    initializeAudio,
  };
}

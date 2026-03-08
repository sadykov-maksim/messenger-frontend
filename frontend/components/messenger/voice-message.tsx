"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// Генерируем псевдослучайные высоты баров на основе url (стабильные между рендерами)
function generateBars(seed: string, count: number): number[] {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    return Array.from({ length: count }, (_, i) => {
        const x = Math.sin(hash + i * 127.1) * 43758.5453;
        const val = x - Math.floor(x);
        // Минимум 15%, максимум 100%, с "голосовой" формой (середина выше)
        const center = 1 - Math.abs((i / count) - 0.5) * 1.2;
        return Math.max(0.15, Math.min(1, val * 0.7 + center * 0.3));
    });
}

// ─── Component ────────────────────────────────────────────────────────────────

interface VoiceMessagePlayerProps {
    url: string;
    /** Опционально: показывает имя отправителя слева от плеера */
    isMine?: boolean;
}

export function VoiceMessagePlayer({ url, isMine = false }: VoiceMessagePlayerProps) {
    const audioRef = React.useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = React.useState(false);
    const [progress, setProgress] = React.useState(0); // 0..1
    const [duration, setDuration] = React.useState(0);
    const [currentTime, setCurrentTime] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const BAR_COUNT = 36;
    const bars = React.useMemo(() => generateBars(url, BAR_COUNT), [url]);

    // ── Audio events ──────────────────────────────────────────────────────────

    React.useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onLoaded = () => {
            setDuration(audio.duration || 0);
            setLoading(false);
        };
        const onTime = () => {
            setCurrentTime(audio.currentTime);
            setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
        };
        const onEnded = () => {
            setPlaying(false);
            setProgress(0);
            setCurrentTime(0);
            audio.currentTime = 0;
        };
        const onWaiting = () => setLoading(true);
        const onPlaying = () => setLoading(false);

        audio.addEventListener("loadedmetadata", onLoaded);
        audio.addEventListener("timeupdate", onTime);
        audio.addEventListener("ended", onEnded);
        audio.addEventListener("waiting", onWaiting);
        audio.addEventListener("playing", onPlaying);

        return () => {
            audio.removeEventListener("loadedmetadata", onLoaded);
            audio.removeEventListener("timeupdate", onTime);
            audio.removeEventListener("ended", onEnded);
            audio.removeEventListener("waiting", onWaiting);
            audio.removeEventListener("playing", onPlaying);
        };
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().catch(() => {});
            setPlaying(true);
        }
    };

    // Клик по waveform — перемотка
    const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !audio.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        audio.currentTime = ratio * audio.duration;
        setProgress(ratio);
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-2xl select-none",
                "min-w-[220px] max-w-[300px]",
                isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
            )}
        >
            {/* Hidden audio element */}
            <audio ref={audioRef} src={url} preload="metadata" />

            {/* Play/Pause button */}
            <button
                type="button"
                onClick={togglePlay}
                className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-transform active:scale-90",
                    isMine
                        ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                        : "bg-foreground/10 hover:bg-foreground/15 text-foreground"
                )}
            >
                {loading ? (
                    <Icon icon="lucide:loader-2" width={16} className="animate-spin" />
                ) : playing ? (
                    <Icon icon="lucide:pause" width={16} />
                ) : (
                    <Icon icon="lucide:play" width={16} className="translate-x-px" />
                )}
            </button>

            {/* Waveform + timer */}
            <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                {/* Waveform bars */}
                <div
                    className="flex items-center gap-px h-8 cursor-pointer"
                    onClick={handleWaveformClick}
                    title="Перемотать"
                >
                    {bars.map((height, i) => {
                        const barProgress = i / BAR_COUNT;
                        const isPast = barProgress <= progress;
                        const isActive = playing && Math.abs(barProgress - progress) < 1.5 / BAR_COUNT;

                        return (
                            <span
                                key={i}
                                className={cn(
                                    "flex-1 rounded-full transition-all duration-75",
                                    isActive
                                        ? isMine
                                            ? "bg-primary-foreground scale-y-110"
                                            : "bg-primary scale-y-110"
                                        : isPast
                                            ? isMine
                                                ? "bg-primary-foreground/90"
                                                : "bg-primary/80"
                                            : isMine
                                                ? "bg-primary-foreground/30"
                                                : "bg-foreground/20"
                                )}
                                style={{
                                    height: `${height * 100}%`,
                                    // Анимация активного бара
                                    ...(isActive && playing ? {
                                        animation: "voicePulse 0.4s ease-in-out infinite alternate",
                                    } : {}),
                                }}
                            />
                        );
                    })}
                </div>

                {/* Timer */}
                {/*<span className={cn(*/}
                {/*    "text-[10px] font-mono tabular-nums leading-none",*/}
                {/*    isMine ? "text-primary-foreground/70" : "text-muted-foreground"*/}
                {/*)}>*/}
                {/*    {playing || progress > 0*/}
                {/*        ? formatDuration(currentTime)*/}
                {/*        : formatDuration(duration)}*/}
                {/*</span>*/}
            </div>

            <style>{`
                @keyframes voicePulse {
                    from { transform: scaleY(1); }
                    to   { transform: scaleY(1.3); }
                }
            `}</style>
        </div>
    );
}
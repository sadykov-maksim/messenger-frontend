export function formatLastSeen(
    isOnline: boolean | null,
    lastSeen: string | null
): string {
    // Скрыл время
    if (isOnline === null) return "был(а) давно";

    if (isOnline) return "онлайн";

    if (!lastSeen) return "не в сети";

    const date = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1)   return "только что";
    if (diffMin < 60)  return `был(а) ${diffMin} мин. назад`;
    if (diffHours < 24) return `был(а) ${diffHours} ч. назад`;
    if (diffDays === 1) return "был(а) вчера";
    if (diffDays < 7)  return `был(а) ${diffDays} дн. назад`;

    return `был(а) ${date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}`;
}
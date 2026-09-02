"use client";

export function getInitials(name?: string | null): string {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

type AvatarProps = {
    name?: string | null;
    size?: "sm" | "md";
};

export function Avatar({ name, size = "md" }: AvatarProps) {
    const dims =
        size === "sm"
            ? "h-7 w-7 text-[11px] rounded-full"
            : "h-9 w-9 text-xs rounded-[10px]";
    return (
        <div
            className={`flex flex-shrink-0 items-center justify-center bg-gradient-to-br from-[#1D4ED8] to-[#0C447C] font-bold text-white ${dims}`}
        >
            {getInitials(name)}
        </div>
    );
}

import React from "react";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Avatar = ({ imageUrl, name, size = "md", className = "" }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  const getInitials = (name: string) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);

  // Deterministic background color based on name for initials
  const getBackgroundColor = (name: string) => {
    const colors = [
      "bg-blue-600/30",
      "bg-emerald-600/30",
      "bg-indigo-600/30",
      "bg-violet-600/30",
      "bg-sky-600/30",
      "bg-cyan-600/30",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const bgColor = getBackgroundColor(name);

  return (
    <div
      className={`rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10 ${sizeClasses[size]} ${className}`}
      role={!imageUrl ? "img" : undefined}
      aria-label={!imageUrl ? name : undefined}
    >
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center font-bold text-white/70 ${bgColor}`}>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;

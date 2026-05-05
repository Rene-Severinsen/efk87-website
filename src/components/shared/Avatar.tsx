import React from "react";

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: "sm" | "md" | "lg";
  shape?: "circle" | "rounded";
  className?: string;
  objectPosition?: string;
}

const Avatar = ({
  imageUrl,
  name,
  size = "md",
  shape = "circle",
  className = "",
  objectPosition = "center",
}: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-16 h-16 text-2xl",
  };

  const shapeClasses = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
  };

  const getInitials = (value: string) => {
    const trimmedName = value.trim();

    if (!trimmedName) {
      return "?";
    }

    const parts = trimmedName.split(/\s+/);

    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }

    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  const initials = getInitials(name);

  return (
    <div
      className={`${shapeClasses[shape]} flex-shrink-0 overflow-hidden flex items-center justify-center border border-white/10 ${sizeClasses[size]} ${className}`}
      role={!imageUrl ? "img" : undefined}
      aria-label={!imageUrl ? name : undefined}
    >
      {imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
          style={{ objectPosition: objectPosition || "center" }}
        />
      ) : (
        <div className="avatar-fallback grid h-full w-full place-items-center bg-slate-200 text-slate-900">
          <span className="avatar-fallback-initials block w-full text-center font-black leading-none">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};

export default Avatar;

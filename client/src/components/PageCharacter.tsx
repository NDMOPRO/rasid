
interface PageCharacterProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  position?: "inline" | "bottom-right" | "bottom-left";
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: "h-24 w-auto",
  md: "h-36 w-auto",
  lg: "h-48 w-auto",
};

/**
 * Displays the official Rasid character on pages.
 * Can be positioned inline or as a fixed decorative element.
 */
export function PageCharacter({
  src,
  alt = "شخصية راصد",
  size = "md",
  position = "inline",
  className = "",
  animate = true,
}: PageCharacterProps) {
  const sizeClass = sizeMap[size];

  if (position === "inline") {
    return animate ? (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} object-contain select-none ${className}`}
        draggable={false}
      />
    ) : (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} object-contain select-none ${className}`}
        draggable={false}
      />
    );
  }

  const posClasses = position === "bottom-right" 
    ? "fixed bottom-4 left-4 z-10" 
    : "fixed bottom-4 right-4 z-10";

  return animate ? (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain select-none ${posClasses} ${className}`}
      draggable={false}
    />
  ) : (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} object-contain select-none opacity-60 ${posClasses} ${className}`}
      draggable={false}
    />
  );
}

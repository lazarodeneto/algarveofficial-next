interface HeadingProps {
  children: React.ReactNode;
  variant?: "h1" | "h2" | "h3";
  className?: string;
}

const variantStyles = {
  h1: "text-4xl md:text-5xl font-semibold",
  h2: "text-2xl md:text-3xl font-semibold",
  h3: "text-lg md:text-xl font-medium",
};

export function Heading({ children, variant = "h1", className }: HeadingProps) {
  const Tag = variant === "h1" ? "h1" : variant === "h2" ? "h2" : "h3";
  return (
    <Tag className={`text-brand-ink ${variantStyles[variant]} ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
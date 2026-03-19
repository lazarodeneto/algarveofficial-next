import { cn } from "@/lib/utils";

interface GoogleIconProps {
  className?: string;
}

export function GoogleIcon({ className = "h-4 w-4" }: GoogleIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 533.5 544.3"
      className={cn("shrink-0", className)}
    >
      <path
        fill="#4285F4"
        d="M533.5 278.4c0-17.4-1.4-34.1-4-50.3H272v95.3h147.4c-6.4 34.5-25.8 63.7-55 83.2v68h88.9c52-47.8 80.2-118.3 80.2-196.2Z"
      />
      <path
        fill="#34A853"
        d="M272 544.3c74.1 0 136.3-24.5 181.7-66.5l-88.9-68c-24.7 16.6-56.2 26.4-92.8 26.4-71.3 0-131.7-48.1-153.3-112.8H27.1v70.9C72.2 482.9 165.3 544.3 272 544.3Z"
      />
      <path
        fill="#FBBC04"
        d="M118.7 323.4c-10.4-30.7-10.4-63.8 0-94.5V158H27.1c-37.8 75.3-37.8 164.9 0 240.2l91.6-70.8Z"
      />
      <path
        fill="#EA4335"
        d="M272 107.7c39.9-.6 78.1 14.1 107.3 41.1l80.2-80.2C406.2 23.7 341.3-.7 272 0 165.3 0 72.2 61.4 27.1 157.6l91.6 70.9C140.3 155.8 200.7 107.7 272 107.7Z"
      />
    </svg>
  );
}

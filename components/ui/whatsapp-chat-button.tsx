import { useEffect, useState } from "react";
import { X, ConciergeBell, Hand, SendHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WhatsAppChatButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
  onFirstOpen?: () => void;
}

export function WhatsAppChatButton({ 
  phoneNumber = "351910000000", // Default Portuguese number - replace with actual
  defaultMessage = "Hello! I'm interested in learning more about your premium services in Algarve.",
  onFirstOpen,
}: WhatsAppChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState(defaultMessage);

  useEffect(() => {
    setMessage(defaultMessage);
  }, [defaultMessage]);

  const handleToggle = () => {
    if (!isOpen) {
      onFirstOpen?.();
    }
    setIsOpen((prev) => !prev);
  };

  const handleOpenWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex-col items-end gap-3 hidden lg:flex">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="w-80 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden"
          >
            {/* Header - Premium Gold Style */}
            <div className="bg-gradient-to-r from-[#8f6b1f] via-[#d4a84b] to-[#8f6b1f] px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center">
                <ConciergeBell className="w-6 h-6 text-black" />
              </div>
              <div className="flex-1">
                <h3 className="text-black font-medium text-sm">AlgarveOfficial</h3>
                <p className="text-black/70 text-xs">VIP Concierge • Typically replies within minutes</p>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-black/70 hover:text-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-muted/30 dark:bg-muted/50 min-h-[120px]">
              <div className="bg-card rounded-lg p-3 shadow-sm max-w-[85%] border border-border">
                <p className="text-sm text-foreground inline-flex items-start gap-2">
                  <Hand className="h-4 w-4 mt-0.5 text-primary" />
                  <span>Welcome to AlgarveOfficial! How can we assist you with your premium experience in the Algarve?</span>
                </p>
                <span className="text-[10px] text-muted-foreground mt-1 block text-right">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-3 bg-card border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 text-sm bg-muted rounded-full border-none outline-none focus:ring-2 focus:ring-primary/50"
                  onKeyDown={(e) => e.key === "Enter" && handleOpenWhatsApp()}
                />
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-[#8f6b1f] via-[#d4a84b] to-[#8f6b1f] hover:from-[#a07b2f] hover:via-[#e4b85b] hover:to-[#a07b2f] transition-all flex items-center justify-center shadow-md shadow-primary/30"
                >
                  <SendHorizontal className="w-5 h-5 text-black" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - CSS Shake on Hover */}
      <button
        onClick={handleToggle}
        className="relative w-16 h-16 rounded-full bg-primary shadow-lg hover:shadow-xl shadow-primary/40 transition-all flex items-center justify-center overflow-hidden group hover-shake"
        style={{ transformOrigin: 'top center' }}
        aria-label="Open Concierge Chat"
      >
        {/* Glass overlay effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 via-transparent to-black/10 pointer-events-none" />
        
        {/* Inner glow ring */}
        <span className="absolute inset-1 rounded-full border border-white/20 pointer-events-none" />
        
        <span className="relative z-10">
          {isOpen ? (
            <X className="w-6 h-6 text-white drop-shadow-sm" />
          ) : (
            <ConciergeBell className="w-8 h-8 text-white drop-shadow-sm" />
          )}
        </span>
      </button>

    </div>
  );
}

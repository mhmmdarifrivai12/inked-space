import { MessageCircle } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";

export const FloatingWA = () => {
  const { content } = useSiteContent();
  return (
    <a
      href={`https://wa.me/${content.contact.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat WhatsApp"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-maroon text-primary-foreground dark:text-foreground flex items-center justify-center shadow-glow hover:scale-110 transition-transform duration-500"
    >
      <span className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
      <MessageCircle className="relative h-6 w-6" />
    </a>
  );
};

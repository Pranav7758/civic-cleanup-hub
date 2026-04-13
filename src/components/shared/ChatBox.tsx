import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ChatBoxProps {
  referenceId: string;
  receiverId?: string; // Optional because the referenceId might be enough to know who to notify later, but good for direct inserts
}

export function ChatBox({ referenceId, receiverId }: ChatBoxProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!referenceId) return;
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.getMessages(referenceId);
        setMessages(data || []);
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
    
    // Polyfill simple polling for real-time feel
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [referenceId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !receiverId) return;
    
    // Opportunistic update
    const tempMsg = {
      id: "temp-" + Date.now(),
      content: input,
      sender_id: profile?.user_id,
      sender_name: profile?.full_name,
      sender_avatar: profile?.avatar_url,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);
    setSending(true);
    setInput("");

    try {
      await apiClient.sendMessage(receiverId, tempMsg.content, referenceId);
    } catch (err: any) {
      toast({ title: "Failed to send", description: err.message, variant: "destructive" });
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally {
      setSending(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-muted/20 rounded-xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[400px] border border-border rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="bg-muted/40 p-3 border-b text-sm font-semibold flex items-center justify-between">
        Live Negotiation
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Connected
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground mt-10">
            No messages yet. Start the negotiation!
          </p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === profile?.user_id;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                {!isMe && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={msg.sender_avatar} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {msg.sender_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted rounded-tl-none text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={endRef} />
      </div>

      <div className="p-3 bg-muted/20 border-t flex gap-2">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="rounded-full bg-white border-timber/20"
          disabled={!receiverId}
        />
        <Button 
          size="icon" 
          className="rounded-full shrink-0" 
          onClick={handleSend} 
          disabled={!input.trim() || sending || !receiverId}
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

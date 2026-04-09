import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageCircle,
  Send,
  Phone,
  Video,
  Image,
  Paperclip,
  ChevronLeft,
  MoreVertical,
  Check,
  CheckCheck,
  Search,
} from "lucide-react";

interface ChatContact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  avatar: string;
}

interface ChatMessage {
  id: number;
  text: string;
  sent: boolean;
  time: string;
  read: boolean;
}

interface ChatPanelProps {
  userRole: "citizen" | "worker" | "ngo" | "scrap";
  onClose?: () => void;
}

export function ChatPanel({ userRole, onClose }: ChatPanelProps) {
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const contacts: ChatContact[] = [
    { id: "1", name: "Green Recyclers", role: "Scrap Dealer", lastMessage: "We'll be there by 3 PM", time: "2 min", unread: 2, online: true, avatar: "♻️" },
    { id: "2", name: "Hope Foundation", role: "NGO", lastMessage: "Thanks for the donation!", time: "1 hr", unread: 0, online: true, avatar: "❤️" },
    { id: "3", name: "Suresh Kumar", role: "Worker", lastMessage: "Pickup completed at Sector 15", time: "3 hr", unread: 0, online: false, avatar: "👷" },
    { id: "4", name: "EcoScrap Hub", role: "Scrap Dealer", lastMessage: "Current rate for aluminum is ₹80/kg", time: "1 day", unread: 1, online: false, avatar: "🏭" },
  ];

  const messages: ChatMessage[] = [
    { id: 1, text: "Hi! I have some old newspapers and cardboard to sell", sent: true, time: "2:30 PM", read: true },
    { id: 2, text: "Sure! How much weight approximately?", sent: false, time: "2:32 PM", read: true },
    { id: 3, text: "About 15 kg newspapers and 8 kg cardboard", sent: true, time: "2:33 PM", read: true },
    { id: 4, text: "Great! Current rates are ₹15/kg for newspapers and ₹10/kg for cardboard. Total would be around ₹305", sent: false, time: "2:35 PM", read: true },
    { id: 5, text: "That sounds good. Can you pick it up today?", sent: true, time: "2:36 PM", read: true },
    { id: 6, text: "We'll be there by 3 PM", sent: false, time: "2:38 PM", read: true },
  ];

  const handleSend = () => {
    if (!message.trim()) return;
    setMessage("");
  };

  if (selectedContact) {
    return (
      <div className="flex flex-col h-full bg-background">
        {/* Chat Header */}
        <div className="flex items-center gap-3 p-4 border-b bg-card">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedContact(null)}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="text-2xl">{selectedContact.avatar}</div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-sm">{selectedContact.name}</h3>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              {selectedContact.online && <span className="h-1.5 w-1.5 rounded-full bg-eco-green" />}
              {selectedContact.online ? "Online" : "Last seen 2h ago"}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="secondary" className="text-[10px]">Today</Badge>
            </div>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sent ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                  msg.sent
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className={`flex items-center justify-end gap-1 mt-1 ${msg.sent ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    <span className="text-[10px]">{msg.time}</span>
                    {msg.sent && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-3 border-t bg-card">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button size="icon" className="h-9 w-9 bg-gradient-eco shrink-0" onClick={handleSend} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-lg">Messages</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {contacts.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="relative">
                <div className="text-2xl">{contact.avatar}</div>
                {contact.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-eco-green border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{contact.name}</h4>
                  <span className="text-[10px] text-muted-foreground">{contact.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate pr-4">{contact.lastMessage}</p>
                  {contact.unread > 0 && (
                    <Badge className="h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary">{contact.unread}</Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

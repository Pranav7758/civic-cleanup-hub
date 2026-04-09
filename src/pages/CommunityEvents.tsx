import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  ChevronRight,
  Leaf,
  TreePine,
  Sparkles,
  CheckCircle,
  Target,
} from "lucide-react";

const CommunityEvents = () => {
  const navigate = useNavigate();

  const upcomingEvents = [
    {
      id: 1,
      title: "Sector 15 Mega Cleanup Drive",
      date: "Sun, 15 Dec 2024",
      time: "7:00 AM - 11:00 AM",
      location: "Community Park, Sector 15",
      participants: 125,
      maxParticipants: 200,
      reward: 200,
      organizer: "Municipal Corporation",
      joined: false,
      type: "cleanup",
    },
    {
      id: 2,
      title: "River Bank Restoration",
      date: "Sat, 21 Dec 2024",
      time: "6:30 AM - 10:00 AM",
      location: "South River Bank",
      participants: 80,
      maxParticipants: 150,
      reward: 300,
      organizer: "Green Earth Society",
      joined: true,
      type: "restoration",
    },
    {
      id: 3,
      title: "Tree Plantation Drive",
      date: "Sun, 28 Dec 2024",
      time: "8:00 AM - 12:00 PM",
      location: "City Forest Reserve",
      participants: 45,
      maxParticipants: 100,
      reward: 250,
      organizer: "Forest Department",
      joined: false,
      type: "plantation",
    },
  ];

  const pastEvents = [
    { title: "Old City Market Cleanup", date: "2 Dec 2024", participants: 180, pointsEarned: 200 },
    { title: "School Waste Awareness", date: "25 Nov 2024", participants: 95, pointsEarned: 150 },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "cleanup": return Leaf;
      case "restoration": return TreePine;
      case "plantation": return TreePine;
      default: return Sparkles;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader
        title="Community Events"
        subtitle="Join drives & earn extra points"
        moduleColor="citizen"
        showBack
        onBack={() => navigate("/citizen")}
        icon={<Calendar className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Your Impact */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-5">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm text-white/80">Events Attended</p>
                <p className="text-3xl font-display font-bold">12</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Points Earned</p>
                <p className="text-3xl font-display font-bold">2,400</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <div>
          <h2 className="font-display font-bold text-lg mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {upcomingEvents.map((event) => {
              const TypeIcon = getTypeIcon(event.type);
              return (
                <Card key={event.id} className="border-0 shadow-card hover:shadow-hover transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm">{event.title}</h3>
                        <p className="text-xs text-muted-foreground">{event.organizer}</p>
                      </div>
                      <Badge variant="outline" className="text-eco-green border-eco-green/30 bg-eco-green/10 text-[10px] shrink-0">
                        <Trophy className="h-2.5 w-2.5 mr-0.5" /> +{event.reward} pts
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{event.date}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{event.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{event.participants}/{event.maxParticipants}</span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${(event.participants / event.maxParticipants) * 100}%` }}
                      />
                    </div>

                    {event.joined ? (
                      <Button variant="outline" className="w-full" disabled>
                        <CheckCircle className="h-4 w-4 mr-2 text-eco-green" />
                        Registered
                      </Button>
                    ) : (
                      <Button className="w-full bg-gradient-eco">
                        Join Event
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <h2 className="font-display font-bold text-lg mb-4">Past Events</h2>
          <div className="space-y-3">
            {pastEvents.map((event, i) => (
              <Card key={i} className="border-0 shadow-card">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.date} • {event.participants} participants</p>
                  </div>
                  <Badge className="bg-eco-green/10 text-eco-green border-0">+{event.pointsEarned} pts</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CommunityEvents;

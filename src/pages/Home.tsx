import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Recycle, 
  Leaf, 
  Heart, 
  Package,
  Shield,
  ArrowRight,
  Sparkles,
  TreePine,
  Droplets,
  Wind,
  CheckCircle,
  Globe,
  Coins
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Globe,
      title: "Smart Reporting",
      description: "Report waste with GPS, photos, and real-time tracking"
    },
    {
      icon: Coins,
      title: "Earn Rewards",
      description: "Get government benefits and discounts for cleanliness"
    },
    {
      icon: Recycle,
      title: "Sell & Donate",
      description: "Sell scrap for cash or donate items to verified NGOs"
    },
    {
      icon: CheckCircle,
      title: "Verified Pickup",
      description: "Track your donations and see where they go"
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Citizens", icon: Users },
    { value: "2.5K", label: "Waste Workers", icon: Briefcase },
    { value: "₹2.5Cr", label: "Benefits Given", icon: Sparkles },
    { value: "500T", label: "Waste Recycled", icon: Recycle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-eco" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
        
        {/* Floating icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Leaf className="absolute top-20 left-[10%] h-12 w-12 text-white/20 animate-float" />
          <TreePine className="absolute top-40 right-[15%] h-16 w-16 text-white/15 animate-float" style={{ animationDelay: "1s" }} />
          <Droplets className="absolute bottom-32 left-[20%] h-10 w-10 text-white/20 animate-float" style={{ animationDelay: "2s" }} />
          <Wind className="absolute top-32 right-[30%] h-14 w-14 text-white/15 animate-float" style={{ animationDelay: "0.5s" }} />
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 text-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Smart Waste Management Platform
            </Badge>
            
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm shadow-lg">
                <Recycle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight">
                EcoConnect
              </h1>
            </div>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl font-light">
              Connecting citizens, workers, NGOs & dealers for a cleaner, greener future
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-xl text-lg px-8 h-14"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white/50 text-white hover:bg-white/10 text-lg px-8 h-14 bg-white/10 backdrop-blur-sm"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 50L48 45C96 40 192 30 288 35C384 40 480 60 576 65C672 70 768 60 864 50C960 40 1056 30 1152 35C1248 40 1344 60 1392 70L1440 80V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </header>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, i) => (
            <Card key={i} className="border-0 shadow-card bg-card hover:shadow-hover transition-shadow">
              <CardContent className="p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Why EcoConnect?</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Clean Communities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From reporting waste to earning rewards, we've got you covered
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-0 shadow-card hover:shadow-hover transition-all group">
              <CardContent className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-eco mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 pb-20">
        <Card className="border-0 shadow-hover overflow-hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-eco opacity-95" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptMCAwdi02aC02djZoNnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />
            
            <CardContent className="relative py-16 px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Make a Difference?
              </h2>
              <p className="text-white/90 text-lg max-w-xl mx-auto mb-8">
                Join thousands of citizens, workers, NGOs, and dealers working together for a cleaner tomorrow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-primary hover:bg-white/90 shadow-xl"
                  onClick={() => navigate("/login")}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Join as Citizen
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 bg-transparent"
                  onClick={() => navigate("/login")}
                >
                  <Briefcase className="mr-2 h-5 w-5" />
                  Other Portals
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-eco rounded-lg">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-foreground">EcoConnect</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              © 2024 Smart Waste Management Platform. Building a cleaner tomorrow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

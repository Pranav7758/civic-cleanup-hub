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
  Wind
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const portals = [
    {
      title: "Citizen Portal",
      description: "Report waste, earn rewards, access government benefits",
      icon: Users,
      gradient: "bg-gradient-eco",
      features: ["Report illegal dumping", "Cleanliness score & rewards", "Sell scrap & donate items"],
      route: "/login",
      buttonText: "Enter as Citizen",
    },
    {
      title: "Worker Portal",
      description: "Manage tasks, verify pickups, track performance",
      icon: Briefcase,
      gradient: "bg-gradient-ocean",
      features: ["View assigned tasks", "GPS verification", "Performance analytics"],
      route: "/worker-login",
      buttonText: "Enter as Worker",
    },
    {
      title: "NGO Portal",
      description: "Receive donations, distribute to needy, upload proofs",
      icon: Heart,
      gradient: "bg-gradient-sunset",
      features: ["Accept donation requests", "Schedule pickups", "Distribution tracking"],
      route: "/ngo-login",
      buttonText: "Enter as NGO",
    },
    {
      title: "Scrap Dealer",
      description: "Buy recyclables, manage pickups, set prices",
      icon: Package,
      gradient: "bg-gradient-golden",
      features: ["View scrap listings", "Price management", "Pickup scheduling"],
      route: "/scrap-login",
      buttonText: "Enter as Dealer",
    },
    {
      title: "Admin Dashboard",
      description: "Manage users, approve benefits, view analytics",
      icon: Shield,
      gradient: "bg-gradient-royal",
      features: ["User management", "Benefit approvals", "System analytics"],
      route: "/admin-login",
      buttonText: "Enter as Admin",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Citizens", icon: Users },
    { value: "2.5K", label: "Waste Workers", icon: Briefcase },
    { value: "₹2.5Cr", label: "Benefits Distributed", icon: Sparkles },
    { value: "500T", label: "Waste Recycled", icon: Recycle },
  ];

  return (
    <div className="min-h-screen bg-gradient-nature">
      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-eco opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 animate-float">
            <Leaf className="h-12 w-12 text-white/20" />
          </div>
          <div className="absolute top-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
            <TreePine className="h-16 w-16 text-white/15" />
          </div>
          <div className="absolute bottom-20 left-1/4 animate-float" style={{ animationDelay: "2s" }}>
            <Droplets className="h-10 w-10 text-white/20" />
          </div>
          <div className="absolute top-32 right-1/3 animate-float" style={{ animationDelay: "0.5s" }}>
            <Wind className="h-14 w-14 text-white/15" />
          </div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center space-y-6">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Smart Waste Management Platform
            </Badge>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Recycle className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                EcoConnect
              </h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl">
              Connecting citizens, workers, NGOs, and scrap dealers for a cleaner, 
              greener, and more sustainable future
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-4">
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 shadow-lg"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/50 text-white hover:bg-white/10"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <Card key={i} className="border-0 shadow-card bg-card/95 backdrop-blur-sm">
              <CardContent className="p-4 text-center">
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Portals Grid */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Portal</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Select your role to access personalized features and contribute to sustainable waste management
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal, i) => (
            <Card 
              key={i} 
              className="group hover:shadow-hover transition-all duration-300 border-0 shadow-card overflow-hidden cursor-pointer"
              onClick={() => navigate(portal.route)}
            >
              <div className={`h-2 ${portal.gradient}`} />
              <CardHeader className="pb-3">
                <div className={`w-14 h-14 rounded-xl ${portal.gradient} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                  <portal.icon className="h-7 w-7 text-white" />
                </div>
                <CardTitle className="text-xl">{portal.title}</CardTitle>
                <CardDescription>{portal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {portal.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button className="w-full group-hover:shadow-md transition-shadow">
                  {portal.buttonText}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Recycle className="h-6 w-6 text-primary" />
              <span className="font-bold text-foreground">EcoConnect</span>
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

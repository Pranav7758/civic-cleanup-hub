import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Briefcase, 
  Recycle, 
  Leaf, 
  ArrowRight,
  Sparkles,
  Globe,
  Coins,
  CheckCircle,
  Heart,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Globe, title: "Smart Reporting", description: "Report waste with GPS, photos, and real-time tracking" },
    { icon: Coins, title: "Earn Rewards", description: "Get government benefits and discounts for cleanliness" },
    { icon: Recycle, title: "Sell & Donate", description: "Sell scrap for cash or donate items to verified NGOs" },
    { icon: CheckCircle, title: "Verified Pickup", description: "Track your donations and see where they go" },
  ];

  const stats = [
    { value: "50K+", label: "Active Citizens", icon: Users },
    { value: "2.5K", label: "Waste Workers", icon: Briefcase },
    { value: "₹2.5Cr", label: "Benefits Given", icon: Sparkles },
    { value: "500T", label: "Waste Recycled", icon: Recycle },
  ];

  // Asymmetric border radius patterns for feature cards
  const cardRadii = [
    "rounded-tl-[3rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] rounded-br-[2.5rem]",
    "rounded-tl-[1.5rem] rounded-tr-[3rem] rounded-bl-[2.5rem] rounded-br-[1.5rem]",
    "rounded-tl-[2rem] rounded-tr-[2rem] rounded-bl-[3rem] rounded-br-[1rem]",
    "rounded-tl-[1rem] rounded-tr-[2.5rem] rounded-bl-[2rem] rounded-br-[3rem]",
  ];

  return (
    <div className="min-h-screen bg-rice-paper">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Organic background — moss + clay blobs */}
        <div className="absolute inset-0 bg-moss" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#7A9168] blob-1 blur-3xl opacity-40" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-clay blob-2 blur-3xl opacity-20" />
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="bg-white/15 text-white/90 border-white/20 backdrop-blur-sm px-5 py-2 text-sm rounded-full font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-2" />
              Smart Waste Management Platform
            </Badge>
            
            <div className="flex items-center gap-5">
              <div className="p-4 bg-white/15 blob-1 backdrop-blur-sm shadow-lg">
                <Recycle className="h-10 w-10 md:h-14 md:w-14 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tight">
                EcoConnect
              </h1>
            </div>
            
            <p className="text-lg md:text-2xl text-white/80 max-w-2xl font-light leading-relaxed">
              Connecting citizens, workers, NGOs & dealers for a cleaner, greener future
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                className="bg-white text-moss hover:bg-white/90 hover:scale-105 active:scale-95 shadow-float text-lg px-10 h-14 rounded-full font-bold transition-all duration-300 flex items-center justify-center gap-2"
                onClick={() => navigate("/login")}
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </button>
              <button 
                className="border-2 border-white/40 text-white hover:bg-white/10 hover:scale-105 active:scale-95 text-lg px-10 h-14 rounded-full font-bold bg-white/5 backdrop-blur-sm transition-all duration-300"
              >
                Watch Demo
              </button>
            </div>
          </div>
        </div>
        
        {/* Organic wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60C200 30 400 80 600 50C800 20 1000 70 1200 40C1300 30 1400 60 1440 60V100H0V60Z" fill="#FDFCF8"/>
          </svg>
        </div>
      </header>

      {/* Stats — floating cards with asymmetric radii */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map((stat, i) => (
            <Card key={i} className={`border-timber/30 shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 group ${cardRadii[i]}`}>
              <CardContent className="p-5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-moss/10 mb-3 group-hover:bg-moss transition-colors duration-300">
                  <stat.icon className="h-6 w-6 text-moss group-hover:text-white transition-colors duration-300" />
                </div>
                <p className="text-2xl md:text-3xl font-display font-bold text-foreground group-hover:scale-110 transition-transform duration-300">{stat.value}</p>
                <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features — earthy section with asymmetric card shapes */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full px-4 py-1.5 border-timber text-muted-foreground font-semibold">Why EcoConnect?</Badge>
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Everything for Clean Communities
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            From reporting waste to earning rewards — rooted in sustainability
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {features.map((feature, i) => (
            <Card key={i} className={`border-timber/30 shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-500 group ${cardRadii[i]}`}>
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-moss/10 mb-5 group-hover:bg-moss transition-all duration-300">
                  <feature.icon className="h-7 w-7 text-moss group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA — warm moss section with blob */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Card className="border-0 overflow-hidden rounded-[2.5rem] shadow-float">
          <div className="relative">
            <div className="absolute inset-0 bg-moss" />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-clay blob-3 blur-3xl opacity-15" />
            
            <CardContent className="relative py-20 px-8 text-center">
              <Heart className="h-10 w-10 text-white/30 mx-auto mb-6" />
              <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
                Ready to Make a Difference?
              </h2>
              <p className="text-white/75 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
                Join thousands of citizens, workers, NGOs, and dealers working together for a cleaner tomorrow
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  className="bg-white text-moss hover:bg-white/90 hover:scale-105 active:scale-95 shadow-lg px-10 h-14 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => navigate("/login")}
                >
                  <Users className="h-5 w-5" />
                  Join as Citizen
                </button>
                <button 
                  className="border-2 border-white/40 text-white hover:bg-white/10 hover:scale-105 active:scale-95 bg-transparent px-10 h-14 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                  onClick={() => navigate("/login")}
                >
                  <Briefcase className="h-5 w-5" />
                  Other Portals
                </button>
              </div>
            </CardContent>
          </div>
        </Card>
      </section>

      {/* Footer — simple, warm */}
      <footer className="bg-stone border-t border-timber/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-moss rounded-full shadow-sm">
                <Recycle className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg text-foreground">EcoConnect</span>
            </div>
            <p className="text-sm text-muted-foreground text-center font-medium">
              © 2024 Smart Waste Management Platform. Building a cleaner tomorrow.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

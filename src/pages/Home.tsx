import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Briefcase, Recycle, Leaf } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-white shadow-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-primary rounded-lg">
                <Recycle className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-civic-dark">SIH Waste Management</h1>
                <p className="text-sm text-muted-foreground">Smart India Hackathon 2024</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Leaf className="h-5 w-5 text-secondary" />
              <span className="text-sm text-muted-foreground">Building Sustainable Cities</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-civic-dark mb-4">
            Transforming Waste Management
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connecting citizens and workers for cleaner, smarter, and more sustainable communities
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Citizen Portal */}
          <Card className="group hover:shadow-hover transition-all duration-300 cursor-pointer border-0 shadow-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl text-civic-dark">Citizen Portal</CardTitle>
              <CardDescription className="text-base">
                Report issues, access services, and contribute to community cleanliness
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Report illegal dumping incidents</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Order compost kits and recycling materials</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Find nearby waste collection facilities</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/login')}
                className="w-full"
                size="lg"
              >
                Login as Citizen
              </Button>
            </CardContent>
          </Card>

          {/* Worker Portal */}
          <Card className="group hover:shadow-hover transition-all duration-300 cursor-pointer border-0 shadow-card">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-secondary/10 rounded-full w-fit group-hover:bg-secondary/20 transition-colors">
                <Briefcase className="h-12 w-12 text-secondary" />
              </div>
              <CardTitle className="text-2xl text-civic-dark">Worker Portal</CardTitle>
              <CardDescription className="text-base">
                Manage tasks, report progress, and maintain community standards
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-3 mb-6 text-sm text-muted-foreground">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>View and manage assigned tasks</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Report work completion and issues</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-secondary rounded-full"></div>
                  <span>Track performance and community impact</span>
                </div>
              </div>
              <Button 
                onClick={() => navigate('/worker-login')}
                variant="secondary"
                className="w-full"
                size="lg"
              >
                Login as Worker
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">5000+</div>
            <div className="text-sm text-muted-foreground">Active Citizens</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">1200+</div>
            <div className="text-sm text-muted-foreground">Waste Workers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">98%</div>
            <div className="text-sm text-muted-foreground">Issue Resolution</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-secondary">25 Tons</div>
            <div className="text-sm text-muted-foreground">Daily Processing</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2024 SIH Waste Management System. Building a cleaner tomorrow, today.
        </div>
      </footer>
    </div>
  );
};

export default Home;
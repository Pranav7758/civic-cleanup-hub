import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Briefcase } from "lucide-react";
import { toast } from "sonner";

const WorkerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    // Simulate login success
    toast.success("Worker login successful!");
    navigate('/worker-dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="shadow-card border-0">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-secondary/20 rounded-full w-fit">
              <Briefcase className="h-8 w-8 text-secondary" />
            </div>
            <CardTitle className="text-2xl text-civic-dark">Worker Portal</CardTitle>
            <CardDescription>
              Access your task management dashboard and work assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Worker Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" variant="secondary" className="w-full mt-6" size="lg">
                Access Worker Dashboard
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Button variant="link" className="text-sm">
                Need help accessing your account?
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Contact your supervisor for account issues
        </div>
      </div>
    </div>
  );
};

export default WorkerLogin;
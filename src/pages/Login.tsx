import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, Users, Briefcase, Heart, Package, Shield, Recycle,
  Mail, Lock, Eye, EyeOff, Loader2
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "citizen" | "worker" | "ngo" | "scrap_dealer" | "admin";

interface RoleConfig {
  id: UserRole;
  label: string;
  icon: React.ElementType;
  gradient: string;
  description: string;
}

const roles: RoleConfig[] = [
  { id: "citizen", label: "Citizen", icon: Users, gradient: "bg-gradient-eco", description: "Report waste, earn rewards" },
  { id: "worker", label: "Worker", icon: Briefcase, gradient: "bg-gradient-ocean", description: "Manage pickup tasks" },
  { id: "ngo", label: "NGO", icon: Heart, gradient: "bg-gradient-sunset", description: "Handle donations" },
  { id: "scrap_dealer", label: "Dealer", icon: Package, gradient: "bg-gradient-golden", description: "Buy recyclables" },
  { id: "admin", label: "Admin", icon: Shield, gradient: "bg-gradient-royal", description: "System management" },
];

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", phone: "" });

  const selectedRoleConfig = roles.find(r => r.id === selectedRole)!;

  // If already logged in, redirect
  if (user) {
    navigate("/citizen");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!isLogin && !formData.name) {
      toast.error("Please enter your name");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const route = await signIn(formData.email, formData.password);
        toast.success("Welcome back!");
        navigate(route);
      } else {
        await signUp(formData.email, formData.password, formData.name, selectedRole, formData.phone);
        toast.success("Account created! Please check your email to verify.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className={`absolute inset-0 ${selectedRoleConfig.gradient} transition-all duration-500`} />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <Button variant="ghost" className="text-white/80 hover:text-white hover:bg-white/10 -ml-4" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Home
            </Button>
          </div>
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm"><Recycle className="h-8 w-8 text-white" /></div>
              <span className="text-2xl font-bold text-white">EcoConnect</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-3">{isLogin ? "Welcome Back" : "Join the Movement"}</h1>
              <p className="text-lg text-white/80 max-w-md">
                {isLogin ? "Sign in to continue making a difference in your community" : "Create your account and start contributing to a cleaner environment"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    selectedRole === role.id ? "bg-white text-foreground shadow-lg scale-105" : "bg-white/20 text-white hover:bg-white/30"
                  }`}>
                  <role.icon className="h-4 w-4" /><span className="font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-white/60 text-sm">© 2024 EcoConnect. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Button variant="ghost" className="lg:hidden mb-6 -ml-2" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back
          </Button>
          <div className="lg:hidden mb-6">
            <Label className="text-sm text-muted-foreground mb-3 block">Select your role</Label>
            <div className="grid grid-cols-5 gap-2">
              {roles.map((role) => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                    selectedRole === role.id ? `${role.gradient} text-white shadow-lg` : "bg-muted hover:bg-muted/80"
                  }`}>
                  <role.icon className="h-5 w-5" /><span className="text-[10px] font-medium">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
          <Card className="border-0 shadow-card">
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-3 p-4 rounded-2xl ${selectedRoleConfig.gradient} shadow-lg`}>
                <selectedRoleConfig.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
              <CardDescription>as {selectedRoleConfig.label} • {selectedRoleConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? "login" : "signup"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" onClick={() => setIsLogin(true)}>Sign In</TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setIsLogin(false)}>Sign Up</TabsTrigger>
                </TabsList>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleInputChange} />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-10" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" value={formData.password} onChange={handleInputChange} />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} />
                    </div>
                  )}
                  <Button type="submit" className={`w-full ${selectedRoleConfig.gradient} hover:opacity-90`} size="lg" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </Button>
                </form>
              </Tabs>
              <div className="mt-6 text-center text-sm text-muted-foreground">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button className="text-primary font-medium hover:underline" onClick={() => setIsLogin(!isLogin)}>
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;

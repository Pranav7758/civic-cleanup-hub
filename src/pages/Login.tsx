import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { 
  ArrowLeft, Users, Briefcase, Heart, Package, Shield, Recycle,
  Mail, Lock, Eye, EyeOff, Loader2, Leaf
} from "lucide-react";
import { toast } from "sonner";

type UserRole = "citizen" | "worker" | "ngo" | "scrap_dealer" | "admin";

interface RoleConfig {
  id: UserRole;
  label: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const roles: RoleConfig[] = [
  { id: "citizen", label: "Citizen", icon: Users, color: "bg-moss", description: "Report waste, earn rewards" },
  { id: "worker", label: "Worker", icon: Briefcase, color: "bg-[#5A8A9E]", description: "Manage pickup tasks" },
  { id: "ngo", label: "NGO", icon: Heart, color: "bg-burnt-sienna", description: "Handle donations" },
  { id: "scrap_dealer", label: "Dealer", icon: Package, color: "bg-clay", description: "Buy recyclables" },
  { id: "admin", label: "Admin", icon: Shield, color: "bg-[#7A6890]", description: "System management" },
];

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user, roles: userRoles } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>("citizen");
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "", name: "", phone: "" });

  const selectedRoleConfig = roles.find(r => r.id === selectedRole)!;

  useEffect(() => {
    if (user && userRoles.length > 0) {
      if (userRoles.includes("admin")) navigate("/admin");
      else if (userRoles.includes("worker")) navigate("/worker");
      else if (userRoles.includes("ngo")) navigate("/ngo");
      else if (userRoles.includes("scrap_dealer")) navigate("/scrap");
      else navigate("/citizen");
    }
  }, [user, userRoles, navigate]);

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rice-paper">
        <Loader2 className="h-8 w-8 animate-spin text-moss" />
      </div>
    );
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
    <div className="min-h-screen bg-rice-paper flex">
      {/* Left Panel — organic earth */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className={`absolute inset-0 ${selectedRoleConfig.color} transition-all duration-700`} />
        {/* Organic blobs */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 blob-1 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-clay/20 blob-2 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white/5 blob-3 blur-2xl" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <button className="text-white/70 hover:text-white flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/10 transition-all duration-300 font-medium" onClick={() => navigate("/")}>
              <ArrowLeft className="h-4 w-4" />Back to Home
            </button>
          </div>
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/15 rounded-full backdrop-blur-sm"><Recycle className="h-8 w-8 text-white" /></div>
              <span className="text-2xl font-display font-bold text-white">EcoConnect</span>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{isLogin ? "Welcome Back" : "Join the Movement"}</h1>
              <p className="text-lg text-white/70 max-w-md leading-relaxed">
                {isLogin ? "Sign in to continue making a difference in your community" : "Create your account and start contributing to a cleaner environment"}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all duration-300 font-semibold ${
                    selectedRole === role.id ? "bg-white text-foreground shadow-float scale-105" : "bg-white/15 text-white hover:bg-white/25"
                  }`}>
                  <role.icon className="h-4 w-4" /><span>{role.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-white/40 text-sm font-medium">© 2024 EcoConnect. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <button className="lg:hidden mb-6 -ml-2 flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium px-3 py-2 rounded-full hover:bg-muted/40 transition-all duration-300" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />Back
          </button>
          
          {/* Mobile role selector */}
          <div className="lg:hidden mb-6">
            <Label className="text-sm text-muted-foreground mb-3 block font-semibold">Select your role</Label>
            <div className="grid grid-cols-5 gap-2">
              {roles.map((role) => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 ${
                    selectedRole === role.id ? `${role.color} text-white shadow-soft scale-105` : "bg-muted hover:bg-muted/80"
                  }`}>
                  <role.icon className="h-5 w-5" /><span className="text-[10px] font-semibold">{role.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <Card className="border-timber/30 shadow-soft rounded-[2rem]">
            <CardHeader className="text-center pb-2">
              <div className={`mx-auto mb-3 p-4 rounded-full ${selectedRoleConfig.color} shadow-soft`}>
                <selectedRoleConfig.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-display">{isLogin ? "Sign In" : "Create Account"}</CardTitle>
              <CardDescription className="font-medium">as {selectedRoleConfig.label} • {selectedRoleConfig.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={isLogin ? "login" : "signup"} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 rounded-full bg-muted/60 p-1">
                  <TabsTrigger value="login" onClick={() => setIsLogin(true)} className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Sign In</TabsTrigger>
                  <TabsTrigger value="signup" onClick={() => setIsLogin(false)} className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm font-semibold">Sign Up</TabsTrigger>
                </TabsList>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-semibold">Full Name</Label>
                      <Input id="name" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleInputChange} className="rounded-full h-12 bg-white/50 border-timber/50 focus-visible:ring-moss/30" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-semibold">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-11 rounded-full h-12 bg-white/50 border-timber/50 focus-visible:ring-moss/30" value={formData.email} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-semibold">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-11 pr-11 rounded-full h-12 bg-white/50 border-timber/50 focus-visible:ring-moss/30" value={formData.password} onChange={handleInputChange} />
                      <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="font-semibold">Phone Number</Label>
                      <Input id="phone" name="phone" type="tel" placeholder="+91 98765 43210" value={formData.phone} onChange={handleInputChange} className="rounded-full h-12 bg-white/50 border-timber/50 focus-visible:ring-moss/30" />
                    </div>
                  )}
                  <button type="submit" className={`w-full ${selectedRoleConfig.color} text-white rounded-full h-12 font-bold text-base shadow-soft hover:shadow-float hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2`} disabled={isLoading}>
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLogin ? "Sign In" : "Create Account"}
                  </button>
                </form>
              </Tabs>
              <div className="mt-6 text-center text-sm text-muted-foreground font-medium">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button className="text-moss font-bold hover:underline" onClick={() => setIsLogin(!isLogin)}>
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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import {
  GraduationCap,
  Recycle,
  Leaf,
  Droplets,
  AlertTriangle,
  CheckCircle,
  Play,
  Lock,
  ChevronRight,
  BookOpen,
  Timer,
  Award,
  ArrowRight,
  Trash2,
  Flame,
} from "lucide-react";

interface Module {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  lessons: number;
  progress: number;
  locked: boolean;
  color: string;
}

const CitizenTraining = () => {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  const modules: Module[] = [
    {
      id: 1,
      title: "Waste Segregation",
      description: "Learn to separate dry, wet, and hazardous waste correctly at source",
      icon: Trash2,
      duration: "25 min",
      lessons: 5,
      progress: 100,
      locked: false,
      color: "text-eco-green",
    },
    {
      id: 2,
      title: "Composting Basics",
      description: "Turn kitchen waste into nutrient-rich compost for your garden",
      icon: Leaf,
      duration: "20 min",
      lessons: 4,
      progress: 60,
      locked: false,
      color: "text-eco-emerald",
    },
    {
      id: 3,
      title: "Environmental Impact",
      description: "Understand how waste affects our water, air, and soil",
      icon: Droplets,
      duration: "15 min",
      lessons: 3,
      progress: 0,
      locked: false,
      color: "text-eco-sky",
    },
    {
      id: 4,
      title: "Hazardous Waste",
      description: "Properly handle batteries, chemicals, and medical waste",
      icon: AlertTriangle,
      duration: "18 min",
      lessons: 4,
      progress: 0,
      locked: true,
      color: "text-eco-rose",
    },
    {
      id: 5,
      title: "Platform Guide",
      description: "Master all features: reporting, scrap selling, donations, and rewards",
      icon: BookOpen,
      duration: "12 min",
      lessons: 3,
      progress: 0,
      locked: true,
      color: "text-eco-purple",
    },
  ];

  const completedCount = modules.filter(m => m.progress === 100).length;

  if (activeModule) {
    const lessons = [
      { title: "Introduction", duration: "3 min", completed: activeModule.progress >= 20 },
      { title: "Key Concepts", duration: "5 min", completed: activeModule.progress >= 40 },
      { title: "Practical Examples", duration: "7 min", completed: activeModule.progress >= 60 },
      { title: "Quiz & Assessment", duration: "5 min", completed: activeModule.progress >= 80 },
      ...(activeModule.lessons === 5 ? [{ title: "Summary & Tips", duration: "5 min", completed: activeModule.progress >= 100 }] : []),
    ];

    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader
          title={activeModule.title}
          subtitle="Training Module"
          moduleColor="citizen"
          showBack
          onBack={() => setActiveModule(null)}
          icon={<GraduationCap className="h-6 w-6 text-white" />}
        />

        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-eco p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <activeModule.icon className="h-8 w-8 text-white" />
                </div>
                <div className="text-white flex-1">
                  <h2 className="text-xl font-display font-bold">{activeModule.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{activeModule.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm flex items-center gap-1">
                      <Timer className="h-3.5 w-3.5" /> {activeModule.duration}
                    </span>
                    <span className="text-sm">{activeModule.lessons} lessons</span>
                  </div>
                </div>
              </div>
              <Progress value={activeModule.progress} className="h-2 mt-4 bg-white/20" />
              <p className="text-white/70 text-xs mt-2">{activeModule.progress}% completed</p>
            </div>
          </Card>

          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <Card
                key={i}
                className={`border-0 shadow-card cursor-pointer transition-all hover:shadow-hover ${
                  lesson.completed ? "opacity-75" : ""
                }`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    lesson.completed
                      ? "bg-eco-green/10"
                      : "bg-muted"
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 text-eco-green" />
                    ) : (
                      <Play className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{lesson.title}</p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </CardContent>
              </Card>
            ))}
          </div>

          {activeModule.progress < 100 && (
            <Button className="w-full bg-gradient-eco" size="lg">
              <Play className="h-5 w-5 mr-2" />
              {activeModule.progress > 0 ? "Continue Learning" : "Start Module"}
            </Button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader
        title="Digital Training"
        subtitle="Complete all modules to unlock features"
        moduleColor="citizen"
        showBack
        onBack={() => navigate("/citizen")}
        icon={<GraduationCap className="h-6 w-6 text-white" />}
      />

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Progress Overview */}
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <p className="text-sm text-white/80">Overall Progress</p>
                <p className="text-3xl font-display font-bold">{completedCount}/{modules.length}</p>
                <p className="text-white/70 text-sm">modules completed</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl">
                <Award className="h-10 w-10 text-white" />
              </div>
            </div>
            <Progress value={(completedCount / modules.length) * 100} className="h-2.5 bg-white/20" />
          </div>
        </Card>

        {completedCount < modules.length && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-eco-amber/10 border border-eco-amber/20">
            <AlertTriangle className="h-5 w-5 text-eco-amber shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Training Required</p>
              <p className="text-xs text-muted-foreground">Complete all modules to unlock reporting, wallet, and scrap features</p>
            </div>
          </div>
        )}

        {/* Modules */}
        <div className="space-y-3">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              className={`border-0 shadow-card cursor-pointer transition-all hover:shadow-hover ${
                mod.locked ? "opacity-60" : ""
              }`}
              onClick={() => !mod.locked && setActiveModule(mod)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${mod.progress === 100 ? "bg-eco-green/10" : "bg-muted"}`}>
                    {mod.locked ? (
                      <Lock className="h-6 w-6 text-muted-foreground" />
                    ) : mod.progress === 100 ? (
                      <CheckCircle className="h-6 w-6 text-eco-green" />
                    ) : (
                      <mod.icon className={`h-6 w-6 ${mod.color}`} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{mod.title}</h3>
                      {mod.progress === 100 && (
                        <Badge variant="outline" className="text-eco-green border-eco-green/30 bg-eco-green/10 text-[10px]">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {mod.duration}
                      </span>
                      <span className="text-[10px] text-muted-foreground">{mod.lessons} lessons</span>
                    </div>
                    {mod.progress > 0 && mod.progress < 100 && (
                      <Progress value={mod.progress} className="h-1.5 mt-2" />
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CitizenTraining;

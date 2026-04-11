import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AppHeader } from "@/components/layout/AppHeader";
import { useTrainingModules, useTrainingProgress, useUpdateTrainingProgress } from "@/hooks/useTraining";
import {
  GraduationCap, Recycle, Leaf, Droplets, AlertTriangle, CheckCircle, Play, Lock, ChevronRight, BookOpen, Timer, Award, Trash2,
} from "lucide-react";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Trash2, Leaf, Droplets, AlertTriangle, BookOpen, Recycle, GraduationCap,
};

const colorMap: Record<string, string> = {
  Trash2: "text-eco-green", Leaf: "text-eco-emerald", Droplets: "text-eco-sky", AlertTriangle: "text-eco-rose", BookOpen: "text-eco-purple",
};

const CitizenTraining = () => {
  const navigate = useNavigate();
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const { data: modules, isLoading: modulesLoading } = useTrainingModules();
  const { data: progressData } = useTrainingProgress();
  const updateProgress = useUpdateTrainingProgress();

  const getProgress = (moduleId: string) => {
    return (progressData || []).find((p: any) => p.module_id === moduleId);
  };

  const completedCount = (progressData || []).filter((p: any) => p.completed).length;
  const totalModules = (modules || []).length;

  const activeModule = (modules || []).find((m: any) => m.id === activeModuleId);

  const isModuleLocked = (mod: any, index: number) => {
    if (!mod.requires_previous || index === 0) return false;
    const prevModule = (modules || [])[index - 1];
    if (!prevModule) return false;
    const prevProgress = getProgress(prevModule.id);
    return !prevProgress?.completed;
  };

  const handleAdvanceLesson = async (moduleId: string, currentProgress: number, lessonCount: number) => {
    const increment = Math.ceil(100 / lessonCount);
    const newProgress = Math.min(currentProgress + increment, 100);
    try {
      await updateProgress.mutateAsync({ moduleId, progress: newProgress });
      if (newProgress >= 100) {
        toast.success("Module completed! 🎉");
      } else {
        toast.success("Lesson completed!");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (activeModule) {
    const prog = getProgress(activeModule.id);
    const currentProgress = prog?.progress || 0;
    const lessonCount = activeModule.lesson_count || 3;
    const lessons = Array.from({ length: lessonCount }, (_, i) => ({
      title: i === 0 ? "Introduction" : i === lessonCount - 1 ? "Quiz & Assessment" : `Lesson ${i + 1}`,
      duration: `${3 + i * 2} min`,
      completed: currentProgress >= ((i + 1) / lessonCount) * 100,
    }));

    const Icon = iconMap[activeModule.icon] || BookOpen;

    return (
      <div className="min-h-screen bg-background pb-6">
        <AppHeader title={activeModule.title} subtitle="Training Module" moduleColor="citizen" showBack onBack={() => setActiveModuleId(null)} icon={<GraduationCap className="h-6 w-6 text-white" />} />
        <main className="container mx-auto px-4 py-6 space-y-6">
          <Card className="border-0 shadow-card overflow-hidden">
            <div className="bg-gradient-eco p-6">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white/20 rounded-2xl"><Icon className="h-8 w-8 text-white" /></div>
                <div className="text-white flex-1">
                  <h2 className="text-xl font-display font-bold">{activeModule.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{activeModule.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-sm flex items-center gap-1"><Timer className="h-3.5 w-3.5" /> {activeModule.duration_minutes} min</span>
                    <span className="text-sm">{lessonCount} lessons</span>
                  </div>
                </div>
              </div>
              <Progress value={currentProgress} className="h-2 mt-4 bg-white/20" />
              <p className="text-white/70 text-xs mt-2">{currentProgress}% completed</p>
            </div>
          </Card>

          <div className="space-y-3">
            {lessons.map((lesson, i) => (
              <Card key={i} className={`border-0 shadow-card cursor-pointer transition-all hover:shadow-hover ${lesson.completed ? "opacity-75" : ""}`}
                onClick={() => !lesson.completed && handleAdvanceLesson(activeModule.id, currentProgress, lessonCount)}>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${lesson.completed ? "bg-eco-green/10" : "bg-muted"}`}>
                    {lesson.completed ? <CheckCircle className="h-5 w-5 text-eco-green" /> : <Play className="h-4 w-4 text-muted-foreground" />}
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

          {currentProgress < 100 && (
            <Button className="w-full bg-gradient-eco" size="lg" disabled={updateProgress.isPending}
              onClick={() => handleAdvanceLesson(activeModule.id, currentProgress, lessonCount)}>
              <Play className="h-5 w-5 mr-2" />{currentProgress > 0 ? "Continue Learning" : "Start Module"}
            </Button>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      <AppHeader title="Digital Training" subtitle="Complete all modules to unlock features" moduleColor="citizen" showBack onBack={() => navigate("/citizen")} icon={<GraduationCap className="h-6 w-6 text-white" />} />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <Card className="border-0 shadow-card overflow-hidden">
          <div className="bg-gradient-eco p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-white">
                <p className="text-sm text-white/80">Overall Progress</p>
                <p className="text-3xl font-display font-bold">{completedCount}/{totalModules}</p>
                <p className="text-white/70 text-sm">modules completed</p>
              </div>
              <div className="p-4 bg-white/20 rounded-2xl"><Award className="h-10 w-10 text-white" /></div>
            </div>
            <Progress value={totalModules ? (completedCount / totalModules) * 100 : 0} className="h-2.5 bg-white/20" />
          </div>
        </Card>

        {completedCount < totalModules && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-eco-amber/10 border border-eco-amber/20">
            <AlertTriangle className="h-5 w-5 text-eco-amber shrink-0 mt-0.5" />
            <div><p className="font-medium text-sm">Training Required</p><p className="text-xs text-muted-foreground">Complete all modules to unlock reporting, wallet, and scrap features</p></div>
          </div>
        )}

        <div className="space-y-3">
          {modulesLoading ? (
            <div className="text-center py-8"><p className="text-muted-foreground">Loading modules...</p></div>
          ) : (modules || []).map((mod: any, index: number) => {
            const prog = getProgress(mod.id);
            const pct = prog?.progress || 0;
            const locked = isModuleLocked(mod, index);
            const Icon = iconMap[mod.icon] || BookOpen;
            const color = colorMap[mod.icon] || "text-primary";

            return (
              <Card key={mod.id} className={`border-0 shadow-card cursor-pointer transition-all hover:shadow-hover ${locked ? "opacity-60" : ""}`}
                onClick={() => !locked && setActiveModuleId(mod.id)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${pct === 100 ? "bg-eco-green/10" : "bg-muted"}`}>
                      {locked ? <Lock className="h-6 w-6 text-muted-foreground" /> : pct === 100 ? <CheckCircle className="h-6 w-6 text-eco-green" /> : <Icon className={`h-6 w-6 ${color}`} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{mod.title}</h3>
                        {pct === 100 && <Badge variant="outline" className="text-eco-green border-eco-green/30 bg-eco-green/10 text-[10px]">Done</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{mod.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Timer className="h-3 w-3" /> {mod.duration_minutes} min</span>
                        <span className="text-[10px] text-muted-foreground">{mod.lesson_count} lessons</span>
                      </div>
                      {pct > 0 && pct < 100 && <Progress value={pct} className="h-1.5 mt-2" />}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CitizenTraining;

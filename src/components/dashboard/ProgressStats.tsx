
import { Problem, User } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Award, BookOpen, TrendingUp, Calendar } from "lucide-react";
import { subDays } from "date-fns";

interface ProgressStatsProps {
  problems: Problem[];
  user: User | null;
  className?: string;
}

export default function ProgressStats({ problems, user, className }: ProgressStatsProps) {
  if (!problems || !user) return null;
  
  const totalProblems = problems.length;
  const targetProblems = 3000;
  const remainingProblems = Math.max(0, targetProblems - totalProblems);
  const percentageComplete = (totalProblems / targetProblems) * 100;
  
  // Get problems completed today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaysProblems = problems.filter(problem => {
    const problemDate = new Date(problem.completed_at);
    return problemDate >= today;
  }).length;
  
  // Get problems completed in the last 7 days
  const lastWeek = subDays(new Date(), 7);
  const weeklyProblems = problems.filter(problem => {
    const problemDate = new Date(problem.completed_at);
    return problemDate >= lastWeek;
  }).length;
  
  // Average problems per day (based on the last 7 days)
  const averagePerDay = (weeklyProblems / 7).toFixed(1);
  
  // Estimated days to completion at current rate
  const daysToCompletion = averagePerDay && averagePerDay !== "0.0" 
    ? Math.ceil(remainingProblems / parseFloat(averagePerDay))
    : "—";
  
  return (
    <div className={className}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Completed</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProblems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {remainingProblems} remaining
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysProblems}</div>
            <p className="text-xs text-muted-foreground mt-1">
              problems solved today
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averagePerDay}</div>
            <p className="text-xs text-muted-foreground mt-1">
              problems per day
            </p>
          </CardContent>
        </Card>
        
        <Card className="transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Estimated Completion</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysToCompletion}</div>
            <p className="text-xs text-muted-foreground mt-1">
              days at current rate
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-4 transition-all hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle>Goal Progress</CardTitle>
          <CardDescription>
            {percentageComplete.toFixed(1)}% complete ({totalProblems} of {targetProblems})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProgressBar 
            value={totalProblems} 
            max={targetProblems} 
            size="lg"
          />
        </CardContent>
      </Card>
    </div>
  );
}

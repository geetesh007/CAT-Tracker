
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/badge";
import { getBothUsersProgress, User } from "@/lib/supabase";
import { Flame, Trophy, Medal } from "lucide-react";

type UserWithProgress = User & { completed: number };

export default function ProgressComparison({ className }: { className?: string }) {
  const [users, setUsers] = useState<UserWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getBothUsersProgress();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching user progress:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Refresh data every minute
    const interval = setInterval(fetchData, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle>Progress Comparison</CardTitle>
          <CardDescription>
            Loading user progress...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 bg-muted animate-pulse rounded-md" />
            <div className="h-16 bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (users.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle>Progress Comparison</CardTitle>
          <CardDescription>
            No users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Create accounts for both users to track progress
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const sortedUsers = [...users].sort((a, b) => b.completed - a.completed);
  const targetProblems = 3000;
  const leader = sortedUsers[0];
  const difference = users.length > 1 
    ? Math.abs(sortedUsers[0].completed - sortedUsers[1].completed)
    : 0;
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Progress Comparison</CardTitle>
            <CardDescription>
              See how you and your partner are doing
            </CardDescription>
          </div>
          
          {users.length > 1 && difference > 0 && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <span className="text-xs">{leader.full_name} leads by {difference}</span>
              <Flame className="h-3 w-3 text-primary ml-1" />
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedUsers.map((user, index) => (
            <div key={user.id} className="space-y-2 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {index === 0 && users.length > 1 && user.completed > 0 && (
                    <Trophy className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="font-medium">
                    {user.full_name || 'Anonymous'}
                  </span>
                </div>
                <span className="text-sm font-medium">
                  {user.completed} / {targetProblems}
                </span>
              </div>
              
              <ProgressBar
                value={user.completed}
                max={targetProblems}
                indicatorClassName={index === 0 ? "bg-primary" : "bg-muted-foreground"}
                className="transform transition-all duration-500"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{((user.completed / targetProblems) * 100).toFixed(1)}% complete</span>
                <span>{targetProblems - user.completed} remaining</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

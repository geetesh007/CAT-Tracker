
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProgressStats from "@/components/dashboard/ProgressStats";
import ProgressChart from "@/components/dashboard/ProgressChart";
import ProgressComparison from "@/components/dashboard/ProgressComparison";
import { Problem, User, addCompletedProblem, getCompletedProblems, supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [numProblems, setNumProblems] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate("/login");
          return;
        }
        
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        // Ensure notification_frequency has the correct type
        if (profile) {
          const typedProfile: User = {
            ...profile,
            notification_frequency: profile.notification_frequency as 'daily' | 'weekly' | 'monthly',
          };
          setUser(typedProfile);
        }
        
        // Get completed problems
        const problemsData = await getCompletedProblems(authUser.id);
        setProblems(problemsData);
      } catch (error) {
        console.error("Error checking auth:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up real-time subscription
    const problemsSubscription = supabase
      .channel('problems-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'problems' }, 
        async (payload) => {
          if (user) {
            const updatedProblems = await getCompletedProblems(user.id);
            setProblems(updatedProblems);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(problemsSubscription);
    };
  }, [navigate, user?.id]);
  
  const handleAddProblems = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add problems");
      return;
    }
    
    if (numProblems <= 0) {
      toast.error("Number of problems must be at least 1");
      return;
    }
    
    try {
      setSubmitting(true);
      
      const promises = [];
      for (let i = 0; i < numProblems; i++) {
        promises.push(addCompletedProblem(user.id, description, category));
      }
      
      await Promise.all(promises);
      
      // Refresh problems
      const updatedProblems = await getCompletedProblems(user.id);
      setProblems(updatedProblems);
      
      setDescription("");
      setNumProblems(1);
      toast.success(`Added ${numProblems} problem${numProblems > 1 ? 's' : ''} to your progress!`);
      
      // Celebration animation for milestone
      const totalCompleted = updatedProblems.length;
      if (totalCompleted % 100 === 0 && totalCompleted > 0) {
        toast.success(`🎉 Congratulations! You've completed ${totalCompleted} problems!`, {
          duration: 5000,
        });
      }
      
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding problems:", error);
      toast.error("Failed to add problems");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container px-4 md:px-6 py-8">
        <div className="flex flex-col space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground">
                Track your progress towards 3000 numerical problems
              </p>
            </div>
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              className="mt-4 md:mt-0"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Completed Problems
            </Button>
          </div>
          
          {showAddForm && (
            <Card className="animate-slide-up">
              <CardHeader>
                <CardTitle>Add Completed Problems</CardTitle>
                <CardDescription>
                  Record the problems you've completed
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleAddProblems}>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="numProblems">Number of Problems</Label>
                      <Input
                        id="numProblems"
                        type="number"
                        min="1"
                        max="100"
                        value={numProblems}
                        onChange={(e) => setNumProblems(parseInt(e.target.value) || 1)}
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category (Optional)</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Category</SelectItem>
                          <SelectItem value="arithmetic">Arithmetic</SelectItem>
                          <SelectItem value="algebra">Algebra</SelectItem>
                          <SelectItem value="geometry">Geometry</SelectItem>
                          <SelectItem value="statistics">Statistics</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Notes (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add any notes about these problems..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={submitting}
                      className="resize-none"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Progress"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}
          
          <ProgressStats problems={problems} user={user} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProgressChart problems={problems} user={user} />
            <ProgressComparison />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

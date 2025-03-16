
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [error, setError] = useState("");
  
  useEffect(() => {
    const checkUserCount = async () => {
      try {
        const { count, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact' });
          
        if (error) throw error;
        setUserCount(count || 0);
      } catch (error) {
        console.error("Error checking user count:", error);
      }
    };
    
    checkUserCount();
  }, []);
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (userCount >= 2) {
      setError("Registration is limited to 2 users only. Maximum users already reached.");
      return;
    }
    
    if (!email || !password || !fullName) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data?.user) {
        // Create profile record
        await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          notification_frequency: 'daily',
        });
        
        // Create notification preferences
        await supabase.from('notification_preferences').insert({
          user_id: data.user.id,
          frequency: 'daily',
          time: '09:00',
          enabled: true,
        });
        
        toast.success("Registration successful! Please log in.");
        navigate("/login");
      }
    } catch (error: any) {
      setError(error.message || "An error occurred during registration");
      toast.error(error.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Create an Account</CardTitle>
        <CardDescription className="text-center">
          Enter your details to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userCount >= 2 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Registration is limited to 2 users only. Maximum users already reached.
            </AlertDescription>
          </Alert>
        )}
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading || userCount >= 2}
              required
              className="transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || userCount >= 2}
              required
              className="transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || userCount >= 2}
                required
                className="pr-10 transition-all duration-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleShowPassword}
                disabled={userCount >= 2}
                className="absolute right-0 top-0 h-full px-3 py-2"
              >
                {showPassword ? (
                  <EyeOff size={16} className="text-muted-foreground" />
                ) : (
                  <Eye size={16} className="text-muted-foreground" />
                )}
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading || userCount >= 2}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}


import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    // Special case for the predefined user
    if (email === "geeteshpatil000@gmail.com" && password === "Geetesh") {
      try {
        setIsLoading(true);
        
        // Try to sign in with the predefined credentials
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error);
          
          // If the user doesn't exist yet, try to create it
          if (error.message === "Invalid login credentials") {
            // First, try to sign up this user
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  full_name: "Geetesh Patil",
                }
              }
            });
            
            if (signUpError) {
              setErrorMessage(signUpError.message);
              toast.error(signUpError.message);
              return;
            }
            
            if (signUpData.user) {
              toast.success("Account created and logged in successfully!");
              navigate("/dashboard");
              return;
            }
          } else {
            setErrorMessage(error.message);
            toast.error(error.message || "An error occurred during login");
          }
          return;
        }
        
        if (data.user) {
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setErrorMessage(error.message || "An unexpected error occurred");
        toast.error(error.message || "An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Regular login process for non-predefined users
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          console.error("Login error:", error);
          
          if (error.message === "Invalid login credentials") {
            setErrorMessage("The email or password you entered is incorrect. Please try again or register for a new account.");
            toast.error("Invalid login credentials");
          } else {
            setErrorMessage(error.message);
            toast.error(error.message || "An error occurred during login");
          }
          return;
        }
        
        if (data.user) {
          toast.success("Login successful!");
          navigate("/dashboard");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        setErrorMessage(error.message || "An unexpected error occurred");
        toast.error(error.message || "An error occurred during login");
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <Card className="w-full max-w-md mx-auto shadow-lg animate-fade-in glassmorphism">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              {errorMessage}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
              className="transition-all duration-200"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/reset-password" 
                className="text-xs text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="pr-10 transition-all duration-200"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleShowPassword}
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
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary hover:underline">
            Register
          </Link>
        </p>
        <p className="text-xs text-muted-foreground">
          Having trouble? Make sure you've registered an account first.
        </p>
      </CardFooter>
    </Card>
  );
}


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProfileForm from "@/components/profile/ProfileForm";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          navigate("/login");
          return;
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
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
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight mb-6">Profile</h1>
          <ProfileForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

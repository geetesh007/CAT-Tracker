
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowRight, BarChart3, UserRound, Bell } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-background py-20 md:py-32">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/20 -z-10" />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-6 animate-fade-in" style={{ "--index": "0" } as React.CSSProperties}>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Master the CAT Exam
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Track your progress towards solving 3000 numerical problems with a beautiful, intuitive dashboard.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center space-y-4 text-center animate-slide-up" style={{ "--index": "1" } as React.CSSProperties}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Progress Tracking</h3>
                  <p className="text-muted-foreground">
                    Track your journey towards mastering 3000 numerical problems with beautiful visualizations.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center animate-slide-up" style={{ "--index": "2" } as React.CSSProperties}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <UserRound className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Two-User System</h3>
                  <p className="text-muted-foreground">
                    Compare progress with your study partner and motivate each other to reach your goals.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center animate-slide-up" style={{ "--index": "3" } as React.CSSProperties}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Bell className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Customizable Notifications</h3>
                  <p className="text-muted-foreground">
                    Set up personalized reminders to keep your study schedule on track.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="bg-muted py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                  Ready to start your CAT preparation journey?
                </h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join now and track your progress towards mastering 3000 numerical problems.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link to="/register">
                    Create Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                  <Link to="/login">
                    Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

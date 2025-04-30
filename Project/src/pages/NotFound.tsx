
import { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative mx-auto w-24 h-24 mb-8">
          <Search className="w-full h-full text-muted-foreground/30" />
          <div className="absolute top-0 right-0 text-3xl font-bold bg-destructive text-destructive-foreground w-8 h-8 rounded-full flex items-center justify-center">
            !
          </div>
        </div>
        
        <h1 className="text-4xl font-bold">Page Not Found</h1>
        
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Button asChild className="gap-2">
            <Link to="/">
              <ArrowLeft size={16} />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

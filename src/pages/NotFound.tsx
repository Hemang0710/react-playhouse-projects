import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔍</div>
        <h1 className="mb-2 text-5xl font-bold gradient-text">404</h1>
        <p className="mb-6 text-lg text-muted-foreground">Page not found</p>
        <Button variant="hero" onClick={() => navigate('/')} className="gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;

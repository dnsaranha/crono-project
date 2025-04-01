
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Layout, BarChart, Trello, Menu } from "lucide-react";
import { CronoLogo } from "@/components/CronoLogo";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useMobile } from "@/hooks/use-mobile";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { isMobile } = useMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { name: "Gantt", icon: <Calendar className="h-4 w-4 mr-2" />, path: "/" },
    { name: "Grade", icon: <Layout className="h-4 w-4 mr-2" />, path: "/grade" },
    { name: "Linha do Tempo", icon: <BarChart className="h-4 w-4 mr-2" />, path: "/linha-do-tempo" },
    { name: "Quadro", icon: <Trello className="h-4 w-4 mr-2" />, path: "/quadro" },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link to="/" className="flex items-center">
          <CronoLogo />
        </Link>
        
        {isMobile ? (
          <>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            {mobileMenuOpen && (
              <div className="absolute top-16 right-0 left-0 bg-background z-50 border-b shadow-md">
                <div className="flex flex-col py-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "justify-start py-3 px-4",
                        currentPath === item.path && "text-primary font-semibold"
                      )}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.icon}
                      {item.name}
                    </Button>
                  ))}
                  
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center m-4"
                    onClick={() => {
                      navigate("/");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="mr-1">+</span> Nova Tarefa
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex space-x-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "nav-item flex items-center px-3 py-2 text-sm font-medium",
                    currentPath === item.path && "text-primary font-semibold active"
                  )}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  {item.name}
                </Button>
              ))}
            </div>

            <div className="ml-auto flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <span className="font-medium text-sm">Mais</span>
              </Button>
              
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-medium flex items-center"
                onClick={() => navigate("/")}
              >
                <span className="mr-1">+</span> Nova Tarefa
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;

import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Trophy, Menu, X, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    setLocation("/");
  }

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-serif font-bold text-xl text-primary">
            <Trophy className="w-6 h-6 text-accent" />
            <span>GolfGives</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/charities" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Charities
            </Link>
            <Link href="/draws" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Prize Draws
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
                {isAdmin && (
                  <Link href="/admin">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} data-testid="button-mobile-menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link href="/charities" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Charities</Link>
              <Link href="/draws" className="text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>Prize Draws</Link>
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Admin Panel</Button>
                    </Link>
                  )}
                  <Button variant="ghost" onClick={() => { handleLogout(); setMobileOpen(false); }} className="w-full">Sign Out</Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/register" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Join Now</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

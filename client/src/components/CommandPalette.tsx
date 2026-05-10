import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  ShoppingBag,
  Package,
  Users,
  LayoutDashboard,
  Heart,
  Search,
  Plus,
  Bell,
  LogOut,
  Shield,
  Sparkles,
} from "lucide-react";
import { aiApi } from "@/lib/api";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/context/AuthContext";

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
   const { state, logout, isAdmin } = useAuth();
  const [search, setSearch] = React.useState("");
  const [aiSuggestion, setAiSuggestion] = React.useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

     document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  React.useEffect(() => {
    if (!search || search.length < 3) {
      setAiSuggestion(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsAiLoading(true);
      try {
        const categories = ["Bags", "Handbags", "Backpacks", "Travel", "Accessories", "Leather", "Canvas"];
        const { suggestions } = await aiApi.searchAssistant(search, categories);
        setAiSuggestion(suggestions);
      } catch (err) {
        console.error("AI Search failed:", err);
      } finally {
        setIsAiLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
     <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {isAiLoading && (
          <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground animate-pulse">
            <Sparkles className="h-3 w-3 text-violet-500" />
            AI is thinking...
          </div>
        )}
        {aiSuggestion && !isAiLoading && (
          <CommandGroup heading="AI Suggestion">
            <CommandItem onSelect={() => runCommand(() => navigate(`/shop?q=${search}`))}>
              <Sparkles className="mr-2 h-4 w-4 text-violet-500" />
              <span>{aiSuggestion}</span>
            </CommandItem>
          </CommandGroup>
        )}
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/shop"))}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            <span>Shop All</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/profile"))}>
            <User className="mr-2 h-4 w-4" />
            <span>My Profile</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/wishlist"))}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Wishlist</span>
          </CommandItem>
        </CommandGroup>
        
        {isAdmin && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Administration">
              <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=dashboard"))}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span>Admin Dashboard</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=products"))}>
                <Package className="mr-2 h-4 w-4" />
                <span>Manage Products</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=orders"))}>
                <ShoppingBag className="mr-2 h-4 w-4" />
                <span>Manage Orders</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=customers"))}>
                <Users className="mr-2 h-4 w-4" />
                <span>Manage Customers</span>
              </CommandItem>
              <CommandItem onSelect={() => runCommand(() => navigate("/admin?tab=notifications"))}>
                <Bell className="mr-2 h-4 w-4" />
                <span>System Notifications</span>
              </CommandItem>
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate("/profile?tab=settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Account Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => { logout(); navigate("/"); })}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign Out</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}


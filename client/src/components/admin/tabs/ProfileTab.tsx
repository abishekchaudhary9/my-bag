import * as React from "react";
import { User, Camera, Settings, Shield, Package } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ProfileSettingsForm } from "@/components/profile/ProfileSettingsForm";
import { SecurityTabForm } from "@/components/profile/SecurityTabForm";
import { AddressesTabForm } from "@/components/profile/AddressesTabForm";
import { toast } from "sonner";

export function ProfileTab() {
  const { state, updateAvatar, deleteAvatar, updateProfile, changePassword } = useAuth();
  const [profileTab, setProfileTab] = React.useState<"settings" | "security" | "addresses">("settings");
  const [uploading, setUploading] = React.useState(false);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      await updateAvatar(file);
    } catch (err: any) {
      // toast is already handled in AuthContext
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      await deleteAvatar();
    } catch (err: any) {
      // toast is already handled in AuthContext
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-fade-up">
      {/* Header Profile Section */}
      <div className="flex flex-col md:flex-row gap-8 items-start pb-10 border-b border-border">
        <div className="relative group">
          <div className="h-32 w-32 rounded-full overflow-hidden border-2 border-border bg-secondary flex items-center justify-center">
            {state.user?.avatar ? (
              <img src={state.user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <User className="h-12 w-12 text-muted-foreground" strokeWidth={1} />
            )}
            {uploading && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center backdrop-blur-sm">
                <div className="h-5 w-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 h-10 w-10 bg-foreground text-background rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors shadow-xl">
            <Camera className="h-5 w-5" />
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h2 className="font-display text-4xl tracking-tight">{state.user?.firstName} {state.user?.lastName}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 bg-accent text-accent-foreground font-bold">Administrator</span>
              <span className="text-xs text-muted-foreground">{state.user?.email}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Status</span>
              <span className="flex items-center gap-1.5 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Active Session
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Role</span>
              <span className="text-sm font-medium">Full Access</span>
            </div>
          </div>

          {state.user?.avatar && (
            <button onClick={handleRemoveAvatar} className="text-[10px] uppercase tracking-widest text-destructive hover:underline font-bold">Remove photo</button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-12 pt-4">
        {/* Profile Sidebar Tabs */}
        <aside className="space-y-1">
          <button 
            onClick={() => setProfileTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest transition-all ${profileTab === "settings" ? "bg-foreground text-background font-bold shadow-lg" : "text-muted-foreground hover:bg-secondary/50"}`}
          >
            <Settings className="h-4 w-4" strokeWidth={1.5} /> General Settings
          </button>
          <button 
            onClick={() => setProfileTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest transition-all ${profileTab === "security" ? "bg-foreground text-background font-bold shadow-lg" : "text-muted-foreground hover:bg-secondary/50"}`}
          >
            <Shield className="h-4 w-4" strokeWidth={1.5} /> Security & Access
          </button>
          <button 
            onClick={() => setProfileTab("addresses")}
            className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] uppercase tracking-widest transition-all ${profileTab === "addresses" ? "bg-foreground text-background font-bold shadow-lg" : "text-muted-foreground hover:bg-secondary/50"}`}
          >
            <Package className="h-4 w-4" strokeWidth={1.5} /> Office Locations
          </button>
        </aside>

        {/* Profile Tab Content */}
        <div className="min-h-[400px]">
          {profileTab === "settings" && state.user && (
            <ProfileSettingsForm user={state.user} onUpdate={updateProfile} />
          )}
          {profileTab === "security" && (
            <SecurityTabForm onChangePassword={changePassword} />
          )}
          {profileTab === "addresses" && state.user && (
            <AddressesTabForm user={state.user} onUpdate={updateProfile} />
          )}
        </div>
      </div>
    </div>
  );
}


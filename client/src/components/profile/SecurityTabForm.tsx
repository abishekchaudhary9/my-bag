import { useState } from "react";
import { Shield, Bell, Eye } from "lucide-react";
import { toast } from "sonner";

interface SecurityTabProps {
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export function SecurityTabForm({ onChangePassword }: SecurityTabProps) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [twoFA, setTwoFA] = useState(false);
  const [emailNotif, setEmailNotif] = useState(true);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPw.length < 8 || !/[A-Z]/.test(newPw) || !/\d/.test(newPw)) {
      toast.error("Password must be at least 8 characters and include one uppercase letter and one number");
      return;
    }
    try {
      await onChangePassword(currentPw, newPw);
      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    }
  };

  return (
    <div className="max-w-lg space-y-10 animate-fade-up">
      {/* Password change */}
      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div className="eyebrow mb-6 text-muted-foreground">Change Password</div>
        <label className="block">
          <span className="eyebrow text-[10px]">Current Password</span>
          <input 
            type="password" 
            value={currentPw} 
            onChange={(e) => setCurrentPw(e.target.value)} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <label className="block">
          <span className="eyebrow text-[10px]">New Password</span>
          <input 
            type="password" 
            value={newPw} 
            onChange={(e) => setNewPw(e.target.value)} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <label className="block">
          <span className="eyebrow text-[10px]">Confirm New Password</span>
          <input 
            type="password" 
            value={confirmPw} 
            onChange={(e) => setConfirmPw(e.target.value)} 
            className="mt-2 w-full bg-transparent border-b border-border focus:border-accent py-2.5 text-base focus:outline-none transition-colors" 
          />
        </label>
        <button 
          type="submit" 
          className="bg-foreground text-background px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] hover:bg-accent hover:text-accent-foreground transition-all duration-300 shadow-sm"
        >
          Update Password
        </button>
      </form>

      {/* Security options */}
      <div className="space-y-5">
        <div className="eyebrow mb-4 text-muted-foreground">Security Settings</div>
        <div className="flex items-center justify-between p-4 border border-border bg-secondary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Two-Factor Authentication</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Add an extra layer of security</div>
            </div>
          </div>
          <button
            onClick={() => { setTwoFA(!twoFA); toast.success(twoFA ? "2FA disabled" : "2FA enabled"); }}
            className={`relative w-11 h-6 rounded-full transition-colors ${twoFA ? "bg-accent" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${twoFA ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border bg-secondary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Email Notifications</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Order updates and new arrivals</div>
            </div>
          </div>
          <button
            onClick={() => { setEmailNotif(!emailNotif); toast.success(emailNotif ? "Notifications disabled" : "Notifications enabled"); }}
            className={`relative w-11 h-6 rounded-full transition-colors ${emailNotif ? "bg-accent" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${emailNotif ? "translate-x-5" : ""}`} />
          </button>
        </div>

        <div className="flex items-center justify-between p-4 border border-border bg-secondary/5 rounded-lg opacity-80">
          <div className="flex items-center gap-3">
            <Eye className="h-5 w-5 text-accent" strokeWidth={1.5} />
            <div>
              <div className="text-sm font-medium">Login Activity</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Last login: Today from Chrome on Windows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


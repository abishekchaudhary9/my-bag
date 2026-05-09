import * as React from "react";
import { Panel } from "../AdminShared";
import { TableSkeleton } from "../AdminSkeletons";
import { notificationsApi } from "@/lib/api";
import { AdminTab } from "@/constants/adminConstants";

interface NotificationsTabProps {
  loading: boolean;
  notifications: any[];
  fetchNotifications: () => void;
  handleTabChange: (tab: AdminTab) => void;
  setOrderSearch: (s: string) => void;
}

export function NotificationsTab({
  loading,
  notifications,
  fetchNotifications,
  handleTabChange,
  setOrderSearch
}: NotificationsTabProps) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6">
      <Panel title="System Notifications" eyebrow="User activity alerts">
        {notifications.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground border border-dashed border-border">No recent notifications.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-left">
                <th className="pb-3 text-xs text-muted-foreground font-medium">Recipient</th>
                <th className="pb-3 text-xs text-muted-foreground font-medium">Title</th>
                <th className="pb-3 text-xs text-muted-foreground font-medium">Message</th>
                <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Date</th>
                <th className="pb-3 text-xs text-muted-foreground font-medium text-right">Actions</th>
              </tr></thead>
              <tbody>
                {notifications.map((n) => (
                  <tr key={n.id} className="border-b border-border/50">
                    <td className="py-3">
                      <div className="font-medium">{(n.first_name || n.last_name) ? `${n.first_name || ""} ${n.last_name || ""}` : "System User"}</div>
                      <div className="text-xs text-muted-foreground">{n.user_email || "System"}</div>
                    </td>
                    <td className="py-3 font-medium">{n.title}</td>
                    <td className="py-3 text-muted-foreground max-w-xs truncate">{n.message}</td>
                    <td className="py-3 text-right text-xs text-muted-foreground">
                      {n.created_at ? new Date(n.created_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="py-3 text-right">
                      {n.link && (
                        <button 
                          onClick={async () => {
                            if (!n.link) return;
                            
                            if (!n.is_read) {
                              notificationsApi.markRead(n.id)
                                .then(() => fetchNotifications())
                                .catch(err => console.error("Mark read failed:", err));
                            }
                            
                            if (n.link.startsWith("/admin")) {
                              const url = new URL(n.link, window.location.origin);
                              const targetTab = url.searchParams.get("tab") as AdminTab;
                              const id = url.searchParams.get("id");
                              
                              if (targetTab) {
                                handleTabChange(targetTab);
                                if (targetTab === "orders" && id) setOrderSearch(id);
                              }
                            } else if (n.link === "/orders") {
                              handleTabChange("orders");
                            } else {
                              window.location.href = n.link;
                            }
                          }}
                          className="text-xs text-accent font-medium hover:underline"
                        >
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

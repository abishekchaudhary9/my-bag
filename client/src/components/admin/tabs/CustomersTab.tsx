import * as React from "react";
import { 
  Users, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp 
} from "lucide-react";
import { MetricCard } from "../AdminShared";
import { TableSkeleton } from "../AdminSkeletons";
import { formatCurrency, parseCurrency } from "@/utils/adminUtils";

interface CustomersTabProps {
  loading: boolean;
  customers: any[];
  customerOrderCount: number;
  customerLifetimeValue: number;
}

export function CustomersTab({
  loading,
  customers,
  customerOrderCount,
  customerLifetimeValue
}: CustomersTabProps) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Users} label="Customers" value={customers.length} detail="Registered accounts" index={0} />
        <MetricCard icon={ShoppingBag} label="Orders" value={customerOrderCount} detail="Placed by customers" tone="text-blue-600" index={1} />
        <MetricCard icon={DollarSign} label="Lifetime Value" value={formatCurrency(customerLifetimeValue)} detail="Tracked customer spend" tone="text-emerald-600" index={2} />
        <MetricCard icon={TrendingUp} label="Avg. Customer" value={formatCurrency(customers.length ? customerLifetimeValue / customers.length : 0)} detail="Average total spend" tone="text-amber-600" index={3} />
      </div>

      {customers.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border text-muted-foreground">No customer profiles found.</div>
      ) : (
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/30 text-left">
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Customer</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Email/Phone</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Orders</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">LTV</th>
              <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest text-right">Status</th>
            </tr></thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">
                    <div className="text-sm">{customer.email}</div>
                    <div className="text-[10px] text-muted-foreground">{customer.phone}</div>
                  </td>
                  <td className="px-4 py-3">{customer.orders} orders</td>
                  <td className="px-4 py-3 font-medium font-display text-base">Rs {parseCurrency(customer.spent).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


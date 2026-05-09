import * as React from "react";
import { 
  Package, 
  Boxes, 
  AlertTriangle, 
  Plus, 
  Search, 
  Edit, 
  Trash2 
} from "lucide-react";
import { MetricCard } from "../AdminShared";
import { TableSkeleton } from "../AdminSkeletons";
import { formatCurrency } from "@/utils/adminUtils";

interface ProductsTabProps {
  loading: boolean;
  productList: any[];
  filteredProducts: any[];
  inventoryStats: { value: number; avg: number };
  searchQ: string;
  setSearchQ: (q: string) => void;
  setShowAddProduct: (show: boolean) => void;
  setEditProduct: (product: any) => void;
  setDeleteTarget: (product: any) => void;
}

export function ProductsTab({
  loading,
  productList,
  filteredProducts,
  inventoryStats,
  searchQ,
  setSearchQ,
  setShowAddProduct,
  setEditProduct,
  setDeleteTarget
}: ProductsTabProps) {
  if (loading) return <TableSkeleton />;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={Package} label="Products" value={productList.length} detail={`${filteredProducts.length} matching search`} index={0} />
        <MetricCard icon={Boxes} label="Inventory" value={formatCurrency(inventoryStats.value)} detail={`${inventoryStats.avg} avg. units in stock`} tone="text-blue-600" index={1} />
        <MetricCard icon={AlertTriangle} label="Low Stock" value={productList.filter(p => (Number(p.stock) || 0) <= 10).length} detail="Requires attention" tone="text-red-600" index={2} />
        <button onClick={() => setShowAddProduct(true)} className="flex flex-col items-center justify-center gap-2 border border-dashed border-border p-4 hover:border-foreground/40 hover:bg-secondary/30 transition-all group">
          <Plus className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-[10px] uppercase tracking-widest font-bold">Add Product</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search products by name..." className="w-full bg-background border border-border px-10 py-2.5 text-sm focus:border-foreground focus:outline-none" />
        </div>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-secondary/30 text-left">
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Image</th>
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Name</th>
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Category</th>
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Price</th>
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest">Stock</th>
            <th className="px-4 py-3 text-xs text-muted-foreground font-medium uppercase tracking-widest text-right">Actions</th>
          </tr></thead>
          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
                <td className="px-4 py-3">
                  <div className="h-12 w-10 bg-secondary overflow-hidden">
                    {p.colors?.[0]?.image && <img src={p.colors[0].image} alt="" className="h-full w-full object-cover" />}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                <td className="px-4 py-3">Rs {Number(p.price).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${(Number(p.stock) || 0) <= 10 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {p.stock} units
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditProduct(p)} className="p-1.5 hover:bg-secondary rounded transition-colors"><Edit className="h-4 w-4" strokeWidth={1.5} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:bg-secondary rounded text-destructive transition-colors"><Trash2 className="h-4 w-4" strokeWidth={1.5} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

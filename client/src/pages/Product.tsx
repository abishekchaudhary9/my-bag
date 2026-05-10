import { useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, Plus, Star, Truck, RotateCcw, Shield, ChevronRight } from "lucide-react";
import Layout from "@/components/layouts/Layout";
import ProductCard from "@/components/shop/ProductCard";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/context/AuthContext";
import { useProductPage } from "@/hooks/useProductPage";
import { toast } from "sonner";
import ProductGallery from "@/components/product/ProductGallery";
import ProductSidebar from "@/components/product/ProductSidebar";
import ProductDetailsSection from "@/components/product/ProductDetailsSection";
import ProductReviewsContainer from "@/components/product/ProductReviewsContainer";
import ProductQuestionsContainer from "@/components/product/ProductQuestionsContainer";

export default function ProductPage() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { addToCart, toggleWish, isWished, markViewed } = useStore();
  const { state: authState, isAdmin } = useAuth();
  const {
    product,
    loading,
    color,
    size,
    qty,
    setColor,
    setSize,
    setQty,
    recommended,
    canUseWishlist,
  } = useProductPage(slug);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!product?.id) return;
    markViewed(product.id);
  }, [product?.id, markViewed]);

  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.replace("#", "");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-2", "ring-accent", "ring-offset-[12px]");
          setTimeout(() => element.classList.remove("ring-2", "ring-accent", "ring-offset-[12px]"), 4000);
        }
      }, 600);
    }
  }, [loading]);

  if (loading) {
    return (
      <Layout>
        <div className="h-screen flex items-center justify-center">
          <div className="font-display text-4xl animate-pulse tracking-widest uppercase opacity-20">Maison</div>
        </div>
      </Layout>
    );
  }

  if (!product || !color) {
    return (
      <Layout>
        <div className="container-luxe py-40 text-center space-y-6">
          <h1 className="font-display text-4xl">The piece you seek is currently unavailable.</h1>
          <Link to="/shop" className="inline-block text-[10px] font-bold uppercase tracking-widest link-underline">Return to collection</Link>
        </div>
      </Layout>
    );
  }

  const handleAddToCart = () => {
    if (!authState.isAuthenticated) {
      navigate("/login");
      return;
    }

    addToCart(product, { color: color.name, size: size || "Universal", qty });
    toast.success("Added to Bag", { description: product.name });
  };

  return (
    <Layout>
      <div ref={containerRef}>
        <div className="container-luxe pt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to={`/shop?category=${product.category}`} className="hover:text-foreground capitalize">{product.category}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{product.name}</span>
        </div>

        <section className="container-luxe py-12 md:py-20 grid lg:grid-cols-12 gap-16 lg:gap-24">
          <div className="lg:col-span-7">
            <ProductGallery product={product} color={color} onSelectColor={setColor} />
          </div>
          <div className="lg:col-span-5">
            <ProductSidebar
              product={product}
              color={color}
              size={size}
              qty={qty}
              setSize={setSize}
              setQty={setQty}
              onSelectColor={setColor}
              canUseWishlist={canUseWishlist}
              isWished={isWished}
              toggleWish={toggleWish}
              addToCart={handleAddToCart}
              isAdmin={isAdmin}
              authState={authState}
            />
          </div>
        </section>

        <ProductDetailsSection product={product} />
        <ProductReviewsContainer productId={String(product.id || (product as any)._id)} />
        <ProductQuestionsContainer productId={String(product.id || (product as any)._id)} />

        {recommended.length > 0 && (
          <section className="container-luxe py-24 md:py-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-display text-3xl md:text-5xl">You may also like</h2>
              <Link to="/shop" className="text-[10px] font-bold uppercase tracking-widest link-underline">View all pieces</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recommended.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

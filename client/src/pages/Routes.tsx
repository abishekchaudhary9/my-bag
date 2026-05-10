import { BrowserRouter, Route, Routes } from "react-router-dom";
import Index from "./Index";
import NotFound from "./NotFound";
import Shop from "./Shop";
import ProductPage from "./Product";
import TrackOrder from "./TrackOrder";
import Cart from "./Cart";
import Wishlist from "./Wishlist";
import Journal from "./Journal";
import Login from "./Login";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";
import Checkout from "./Checkout";
import OrderConfirmation from "./OrderConfirmation";
import Orders from "./Orders";
import Profile from "./Profile";
import Admin from "./Admin";
import Verify from "./Verify";
import Contact from "./Contact";
import About from "./About";
import ShippingReturns from "./ShippingReturns";
import FAQ from "./FAQ";
import Privacy from "./Privacy";
import Terms from "./Terms";
import SizeGuide from "./SizeGuide";
import Offers from "./Offers";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import { CommandPalette } from "@/components/CommandPalette";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/track" element={<TrackOrder />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/account" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/order-confirmation/:orderId" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/shipping-returns" element={<ShippingReturns />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/size-guide" element={<SizeGuide />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

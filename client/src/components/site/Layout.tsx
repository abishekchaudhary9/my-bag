import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Marquee from "./Marquee";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Marquee />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
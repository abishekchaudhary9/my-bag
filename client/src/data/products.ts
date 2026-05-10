import toteBlack from "@/assets/bag-tote-black.jpg";
import toteCognac from "@/assets/bag-tote-cognac.jpg";
import toteCream from "@/assets/bag-tote-cream.jpg";
import backOlive from "@/assets/bag-backpack-olive.jpg";
import backBlack from "@/assets/bag-backpack-black.jpg";
import travelSand from "@/assets/bag-travel-sand.jpg";
import officeBrown from "@/assets/bag-office-brown.jpg";
import crossBurgundy from "@/assets/bag-cross-burgundy.jpg";
import collegeNavy from "@/assets/bag-college-navy.jpg";

export type ColorOption = { name: string; hex: string; image: string };
export type Category =
  | "handbags"
  | "backpacks"
  | "travel"
  | "office"
  | "college"
  | "fashion"
  | "accessories";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: Category;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  stock: number;
  material: string;
  sizes: string[];
  colors: ColorOption[];
  description: string;
  details: string[];
  isNew?: boolean;
  isBestseller?: boolean;
};

export const categories: { id: Category; label: string; blurb: string }[] = [
  { id: "handbags", label: "Handbags", blurb: "Everyday icons" },
  { id: "backpacks", label: "Backpacks", blurb: "Carry, considered" },
  { id: "travel", label: "Travel", blurb: "Made for the journey" },
  { id: "office", label: "Office", blurb: "Quiet authority" },
  { id: "college", label: "College", blurb: "Built for the campus" },
  { id: "fashion", label: "Fashion", blurb: "Statement pieces" },
  { id: "accessories", label: "Accessories", blurb: "Finishing touches" },
];

export const products: Product[] = [
  {
    id: "p1",
    slug: "atelier-tote",
    name: "Atelier Tote",
    tagline: "The everyday carry, perfected.",
    category: "handbags",
    price: 480,
    compareAt: 540,
    rating: 4.8,
    reviews: 214,
    stock: 12,
    material: "Full-grain Italian leather",
    sizes: ["Small", "Medium", "Large"],
    colors: [
      { name: "Onyx", hex: "#111111", image: toteBlack },
      { name: "Cognac", hex: "#9C5A2C", image: toteCognac },
      { name: "Sand", hex: "#D9B79A", image: toteCream },
    ],
    description:
      "A structured tote shaped from a single panel of full-grain leather, finished by hand in our Florentine atelier. Designed to soften, deepen, and grow more beautiful with every season.",
    details: [
      "Full-grain vegetable-tanned leather",
      "Cotton twill lining with interior zip pocket",
      "Solid brass hardware, hand-burnished",
      "Dimensions: 38 × 28 × 14 cm",
    ],
    isBestseller: true,
  },
  {
    id: "p2",
    slug: "voyager-backpack",
    name: "Voyager Backpack",
    tagline: "Quiet structure for loud days.",
    category: "backpacks",
    price: 395,
    rating: 4.7,
    reviews: 168,
    stock: 8,
    material: "Waxed canvas & leather",
    sizes: ["One size"],
    colors: [
      { name: "Olive", hex: "#5A6240", image: backOlive },
      { name: "Onyx", hex: "#111111", image: backBlack },
    ],
    description:
      "Waxed canvas paired with vegetable-tanned leather. Built to wear in, never out — a backpack designed for a decade of mornings.",
    details: [
      "16oz British waxed canvas",
      "Padded laptop sleeve fits up to 15\"",
      "Antique brass buckles",
      "Dimensions: 44 × 30 × 14 cm",
    ],
    isNew: true,
  },
  {
    id: "p3",
    slug: "horizon-carry-on",
    name: "Horizon Carry-On",
    tagline: "Travel light. Travel forever.",
    category: "travel",
    price: 620,
    rating: 4.9,
    reviews: 92,
    stock: 5,
    material: "Aerospace polycarbonate",
    sizes: ["Carry-on", "Check-in"],
    colors: [{ name: "Dune", hex: "#D8A87B", image: travelSand }],
    description:
      "An aerospace-grade polycarbonate shell with whisper-quiet Hinomoto wheels and a TSA-approved aluminum lock. Engineered for the long haul.",
    details: [
      "100% polycarbonate hardshell",
      "Hinomoto silent-glide spinner wheels",
      "TSA-approved combination lock",
      "Lifetime warranty",
    ],
  },
  {
    id: "p4",
    slug: "bureau-briefcase",
    name: "Bureau Briefcase",
    tagline: "Quiet authority, in leather.",
    category: "office",
    price: 540,
    rating: 4.8,
    reviews: 76,
    stock: 10,
    material: "Smooth calfskin",
    sizes: ["Standard"],
    colors: [{ name: "Espresso", hex: "#3B2418", image: officeBrown }],
    description:
      "A slim, double-zip briefcase shaped from smooth calfskin. Engineered for laptops up to 16\", with a tonal leather-lined interior.",
    details: [
      "Smooth Italian calfskin",
      "Padded compartment for 16\" laptop",
      "Detachable shoulder strap",
      "YKK Excella zippers",
    ],
    isBestseller: true,
  },
  {
    id: "p5",
    slug: "petite-crossbody",
    name: "Petite Crossbody",
    tagline: "Small bag. Big season.",
    category: "fashion",
    price: 320,
    rating: 4.6,
    reviews: 143,
    stock: 18,
    material: "Polished calfskin",
    sizes: ["One size"],
    colors: [{ name: "Bordeaux", hex: "#5B1A24", image: crossBurgundy }],
    description:
      "An evening-ready crossbody with a magnetic flap and slim adjustable strap. Just enough room for the essentials — phone, card holder, lipstick.",
    details: [
      "Polished calfskin with edge paint",
      "Magnetic flap closure",
      "Adjustable shoulder strap",
      "Dimensions: 20 × 16 × 6 cm",
    ],
    isNew: true,
  },
  {
    id: "p6",
    slug: "campus-daypack",
    name: "Campus Daypack",
    tagline: "Four years. One backpack.",
    category: "college",
    price: 180,
    compareAt: 220,
    rating: 4.7,
    reviews: 312,
    stock: 24,
    material: "Recycled ripstop nylon",
    sizes: ["One size"],
    colors: [{ name: "Midnight", hex: "#152038", image: collegeNavy }],
    description:
      "A clean, hard-wearing daypack in recycled ripstop nylon. Padded back panel, laptop sleeve, water-bottle pocket — everything you need, nothing you don't.",
    details: [
      "100% recycled ripstop nylon",
      "Padded sleeve fits 14\" laptop",
      "Water-resistant YKK zippers",
      "Lifetime repair program",
    ],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function recommend(p: Product, n = 3) {
  return products
    .filter((x) => x.id !== p.id)
    .sort((a, b) => (a.category === p.category ? -1 : 1))
    .slice(0, n);
}

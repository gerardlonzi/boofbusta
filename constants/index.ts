export const APP_NAME = "Boofbusta";
export const APP_TAGLINE = "Taste the Balance — Nourish Mind, Body, and Mood";
export const APP_DESCRIPTION =
  "Premium microdose products — lab-tested, responsibly sourced, crafted for the modern day.";

export const ROUTES = {
  home: "/",
  shop: "/shop",
  cart: "/cart",
  wishlist: "/wishlist",
  checkout: "/checkout",
  checkoutSuccess: "/checkout/success",
  checkoutError: "/checkout/error",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  account: "/account",
  accountOrders: "/account/orders",
  accountAddresses: "/account/addresses",
  accountWishlist: "/account/wishlist",
  accountReviews: "/account/reviews",
  accountSettings: "/account/settings",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminCategories: "/admin/categories",
  adminUsers: "/admin/users",
  adminOrders: "/admin/orders",
  adminCoupons: "/admin/coupons",
  adminReviews: "/admin/reviews",
} as const;

export const NAV_CATEGORIES = [
  { label: "Shrooms", slug: "shrooms" },
  { label: "Shroom Vape Pens", slug: "shroom-vape-pens" },
  { label: "Shroom Bars", slug: "shroom-bars" },
  { label: "Shroom Capsules", slug: "shroom-capsules" },
  { label: "DMT", slug: "dmt" },
  { label: "LSD", slug: "lsd" },
  { label: "Other Sparks", slug: "other-sparks" },
] as const;

export const TRUST_BADGES = [
  { title: "Free Shipping", desc: "Free shipping on all US orders" },
  { title: "100% Money Back", desc: "You have 10 days to return" },
  { title: "Support 24/7", desc: "Contact us 24 hours a day" },
  { title: "100% Payment Secure", desc: "Your payments are safe with us" },
] as const;

export const QUALITY_PILLARS = [
  { title: "Consistent potency", desc: "Precise dose formulations for predictable effects." },
  { title: "Third-party tested", desc: "Full lab reports available on each product page." },
  { title: "Discreet packaging", desc: "Travel-friendly, leak-resistant, and compact." },
  { title: "Secured Payment", desc: "Pay securely with crypto and get 10% off" },
] as const;

export const PAGINATION = {
  defaultLimit: 12,
  maxLimit: 48,
} as const;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
] as const;

export const GUEST_CART_KEY = "mdk-guest-cart";
export const GUEST_WISHLIST_KEY = "mdk-guest-wishlist";

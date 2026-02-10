import { Check, Star, Crown, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Zap,
    features: [
      "Create profile",
      "Browse profiles",
      "5 interests per day",
      "Basic search",
    ],
    notIncluded: ["View phone numbers", "Send messages", "Profile boost", "Premium badge"],
    variant: "outline" as const,
    popular: false,
  },
  {
    name: "Gold",
    price: "₹999",
    period: "3 months",
    icon: Star,
    features: [
      "Unlimited interests",
      "View phone numbers",
      "Send messages",
      "Profile boost",
      "Advanced search",
      "Priority support",
    ],
    notIncluded: ["Premium badge", "Search priority"],
    variant: "crimson" as const,
    popular: true,
  },
  {
    name: "Platinum",
    price: "₹1,999",
    period: "6 months",
    icon: Crown,
    features: [
      "All Gold features",
      "Premium verified badge",
      "Search priority",
      "Profile highlights",
      "Dedicated relationship manager",
      "Priority in matching",
      "24/7 premium support",
    ],
    notIncluded: [],
    variant: "hero" as const,
    popular: false,
  },
];

const Subscription = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="mb-3 font-display text-4xl font-bold text-foreground">
          Choose Your <span className="text-primary">Plan</span>
        </h1>
        <p className="mx-auto max-w-lg text-muted-foreground">
          Upgrade to unlock unlimited connections, messaging, and priority features to find your perfect match faster.
        </p>
      </motion.div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className={`relative rounded-2xl border bg-card p-8 transition-shadow hover:shadow-elegant ${
              plan.popular ? "border-primary shadow-elegant ring-2 ring-primary/20" : "border-border"
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                Most Popular
              </span>
            )}
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <plan.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
              </div>
            </div>
            <div className="mb-6">
              <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
              <span className="text-sm text-muted-foreground"> / {plan.period}</span>
            </div>
            <ul className="mb-8 flex flex-col gap-3">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-green-600 shrink-0" /> {f}
                </li>
              ))}
              {plan.notIncluded.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground/50 line-through">
                  <Check className="h-4 w-4 shrink-0 opacity-30" /> {f}
                </li>
              ))}
            </ul>
            <Button variant={plan.variant} size="lg" className="w-full">
              {plan.price === "₹0" ? "Current Plan" : "Upgrade Now"}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Subscription;

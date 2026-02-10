import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Search, Shield, Heart, Star, Users, CheckCircle, ArrowRight } from "lucide-react";
import ProfileCard from "@/components/ProfileCard";
import { mockProfiles } from "@/data/mockProfiles";
import heroBg from "@/assets/hero-bg.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const stats = [
  { label: "Verified Profiles", value: "50,000+", icon: Shield },
  { label: "Successful Matches", value: "12,000+", icon: Heart },
  { label: "Happy Families", value: "8,500+", icon: Users },
];

const features = [
  { title: "Verified Profiles", description: "Every profile goes through strict verification including mobile, email, and ID checks.", icon: Shield },
  { title: "Advanced Matching", description: "Our intelligent algorithm finds compatible matches based on your detailed preferences.", icon: Search },
  { title: "Privacy First", description: "Control who sees your photos, phone number, and personal details with granular settings.", icon: CheckCircle },
  { title: "Premium Experience", description: "Unlock unlimited connections, messaging, and priority visibility with our premium plans.", icon: Star },
];

const successStories = [
  { names: "Raj & Meera", location: "Mumbai", quote: "We found each other on VivahBandhan and knew instantly it was meant to be. Thank you for this beautiful journey!", image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop" },
  { names: "Amit & Pooja", location: "Delhi", quote: "After searching for months, VivahBandhan connected us. Our families are overjoyed. Highly recommended!", image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop" },
  { names: "Kiran & Deepa", location: "Bangalore", quote: "The verified profiles gave us confidence. We're now happily married thanks to this wonderful platform.", image: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400&h=300&fit=crop" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/40" />
        </div>
        <div className="container relative z-10 flex min-h-[85vh] flex-col items-start justify-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground backdrop-blur-sm">
              <Heart className="h-4 w-4 fill-current" /> India's Most Trusted Matrimony
            </span>
            <h1 className="mb-6 font-display text-5xl font-bold leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
              Find Your <br />
              <span className="text-gradient-gold">Perfect Match</span>
            </h1>
            <p className="mb-8 max-w-lg text-lg text-primary-foreground/80">
              Join lakhs of verified profiles and discover your life partner. Trusted by families across India for over a decade.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Create Free Profile <ArrowRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/search">
                <Button variant="heroOutline" size="xl">
                  <Search className="mr-1 h-5 w-5" /> Search Profiles
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="relative -mt-12 z-20">
        <div className="container">
          <div className="grid grid-cols-1 gap-4 rounded-2xl bg-card p-6 shadow-elegant md:grid-cols-3">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 rounded-xl p-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Profiles */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Featured <span className="text-primary">Profiles</span>
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Discover verified profiles of eligible singles looking for their perfect match
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockProfiles.slice(0, 6).map((profile, i) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <ProfileCard profile={profile} />
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/search">
              <Button variant="crimson" size="lg">View All Profiles <ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-muted/50 py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Why Choose <span className="text-primary">VivahBandhan</span>
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              We go beyond matchmaking — we build lasting relationships
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 text-center transition-shadow hover:shadow-elegant"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="mb-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Success <span className="text-primary">Stories</span>
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Real couples who found love through VivahBandhan
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {successStories.map((story, i) => (
              <motion.div
                key={story.names}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="overflow-hidden rounded-xl border border-border bg-card"
              >
                <img src={story.image} alt={story.names} className="h-48 w-full object-cover" loading="lazy" />
                <div className="p-5">
                  <p className="mb-3 text-sm text-muted-foreground italic leading-relaxed">"{story.quote}"</p>
                  <p className="font-display font-semibold text-foreground">{story.names}</p>
                  <p className="text-xs text-muted-foreground">{story.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-hero py-20">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-4 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Your Perfect Match is Waiting
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-primary-foreground/80">
              Join thousands of happy families who found love through VivahBandhan. Create your profile today — it's free!
            </p>
            <Link to="/register">
              <Button variant="hero" size="xl">
                Register Now — It's Free <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

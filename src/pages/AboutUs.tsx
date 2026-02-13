import { motion } from "framer-motion";
import { Heart, Shield, Users, Target, Eye, Award, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const values = [
  { icon: Shield, title: "Trust & Safety", desc: "Every profile is manually verified by our admin team before it appears on the platform." },
  { icon: Heart, title: "Meaningful Connections", desc: "We focus on quality over quantity — genuine matches that lead to lasting relationships." },
  { icon: Users, title: "Family Values", desc: "We understand the importance of family in Indian marriages and respect cultural traditions." },
  { icon: Award, title: "Privacy First", desc: "Your personal details are revealed only after mutual interest and admin approval." },
];
const milestones = [
  { year: "2020", event: "VivahBandhan was founded with a mission to make matrimony safe and trustworthy." },
  { year: "2021", event: "Crossed 10,000 registered profiles with multi-level verification system." },
  { year: "2023", event: "Launched Gold & Platinum premium plans with advanced matching features." },
  { year: "2025", event: "50,000+ verified profiles and 12,000+ successful matches across India." },
];
const AboutUs = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    {/* Hero */}
    <section className="bg-gradient-hero py-20">
      <div className="container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Heart className="mx-auto mb-4 h-12 w-12 text-primary-foreground/80 fill-current" />
          <h1 className="mb-4 font-display text-4xl font-bold text-primary-foreground md:text-5xl">
            About <span className="text-gradient-gold">VivahBandhan</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-primary-foreground/80">
            India's most trusted matrimony platform — where verified profiles meet meaningful connections.
          </p>
        </motion.div>
      </div>
    </section>
    {/* Vision & Mission */}
    <section className="py-20">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To be India's most trusted and secure matrimony platform where every individual finds their ideal life partner through a safe, transparent, and admin-verified matchmaking process. We envision a world where marriages are built on trust, mutual respect, and genuine compatibility.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl border border-border bg-card p-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
              <Target className="h-7 w-7 text-accent" />
            </div>
            <h2 className="mb-3 font-display text-2xl font-bold text-foreground">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To provide a safe, verified, and family-friendly matrimony service that connects compatible individuals across India. We are committed to manually verifying every profile, protecting user privacy, and ensuring that every connection is meaningful and respectful of cultural values and traditions.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
    {/* What Makes Us Different */}
    <section className="bg-muted/50 py-20">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">What Makes Us <span className="text-primary">Different</span></h2>
          <p className="mx-auto max-w-md text-muted-foreground">Our core values that set us apart from other matrimony platforms</p>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-xl border border-border bg-card p-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <v.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="mb-2 font-display text-lg font-semibold text-foreground">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    {/* How It Works */}
    <section className="py-20">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">Our <span className="text-primary">Journey</span></h2>
        </motion.div>
        <div className="mx-auto max-w-2xl space-y-6">
          {milestones.map((m, i) => (
            <motion.div key={m.year} initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-4 rounded-xl border border-border bg-card p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{m.year}</div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-3">{m.event}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    {/* Process */}
    <section className="bg-muted/50 py-20">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
          <h2 className="mb-3 font-display text-3xl font-bold text-foreground">How <span className="text-primary">VivahBandhan</span> Works</h2>
        </motion.div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { step: "1", title: "Register & Verify", desc: "Create your profile with email & mobile OTP verification." },
            { step: "2", title: "Admin Approval", desc: "Our team reviews and approves your profile for search visibility." },
            { step: "3", title: "Send Interest", desc: "Browse profiles and send interest. Admin approves the interest request." },
            { step: "4", title: "Connect & Chat", desc: "Once interest is accepted, view full details and start messaging." },
          ].map((item, i) => (
            <motion.div key={item.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">{item.step}</div>
              <h3 className="mb-1 font-display text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
    <Footer />
  </div>
);
export default AboutUs;
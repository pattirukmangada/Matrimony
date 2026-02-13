import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
const contactInfo = [
  { icon: Mail, label: "Email", value: "support@vivahbandhan.com", href: "mailto:support@vivahbandhan.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, label: "Address", value: "Mumbai, Maharashtra, India", href: "#" },
  { icon: Clock, label: "Working Hours", value: "Mon–Sat, 10 AM – 7 PM IST", href: "#" },
];
const ContactUs = () => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    // Simulate — in production this would call a backend endpoint
    setTimeout(() => {
      toast({ title: "Message Sent!", description: "We'll get back to you within 24 hours." });
      setName(""); setEmail(""); setSubject(""); setMessage("");
      setLoading(false);
    }, 1000);
  };
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="bg-gradient-hero py-16">
        <div className="container text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="mb-3 font-display text-4xl font-bold text-primary-foreground md:text-5xl">Contact <span className="text-gradient-gold">Us</span></h1>
            <p className="mx-auto max-w-lg text-primary-foreground/80">Have questions? We'd love to hear from you. Reach out and our team will respond promptly.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-16">
        <div className="container">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Contact info cards */}
            <div className="space-y-4">
              {contactInfo.map((c, i) => (
                <motion.a
                  key={c.label}
                  href={c.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-elegant"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.label}</p>
                    <p className="text-sm text-muted-foreground">{c.value}</p>
                  </div>
                </motion.a>
              ))}
            </div>
            {/* Contact form */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-8">
              <h2 className="mb-6 font-display text-2xl font-bold text-foreground">Send us a <span className="text-primary">Message</span></h2>
              <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name">Full Name *</Label>
                  <Input id="c-name" placeholder="Your name" className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} disabled={loading} />
                </div>
                <div>
                  <Label htmlFor="c-email">Email *</Label>
                  <Input id="c-email" type="email" placeholder="your@email.com" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-subject">Subject</Label>
                  <Input id="c-subject" placeholder="What's this about?" className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} disabled={loading} />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="c-msg">Message *</Label>
                  <Textarea id="c-msg" placeholder="Write your message here..." rows={5} className="mt-1.5" value={message} onChange={(e) => setMessage(e.target.value)} disabled={loading} />
                </div>
                <div className="sm:col-span-2">
                  <Button variant="crimson" size="lg" type="submit" className="w-full sm:w-auto" disabled={loading}>
                    {loading ? "Sending..." : <><Send className="mr-1 h-4 w-4" /> Send Message</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default ContactUs;
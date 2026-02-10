import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container py-12">
      <div className="grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="font-display text-lg font-bold">
              Vivah<span className="text-primary">Bandhan</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            India's most trusted matrimony service. Find your perfect life partner with verified profiles.
          </p>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h4>
          <div className="flex flex-col gap-2">
            {["Search Profiles", "Premium Plans", "Success Stories", "Help"].map((l) => (
              <a key={l} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Information</h4>
          <div className="flex flex-col gap-2">
            {["About Us", "Privacy Policy", "Terms of Service", "Contact"].map((l) => (
              <a key={l} href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 text-sm font-semibold text-foreground">Contact Us</h4>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <p>support@vivahbandhan.com</p>
            <p>+91 98765 43210</p>
            <p>Mumbai, Maharashtra, India</p>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        © 2026 VivahBandhan. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;

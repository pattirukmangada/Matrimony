import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep(step + 1);
    } else {
      console.log("Registration submitted");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-hero lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Heart className="mx-auto mb-6 h-16 w-16 text-primary-foreground/80 fill-current animate-float" />
          <h2 className="mb-4 font-display text-4xl font-bold text-primary-foreground">Begin Your Journey</h2>
          <p className="max-w-sm text-primary-foreground/70">
            Create your profile and find your soulmate among thousands of verified profiles.
          </p>
        </motion.div>
      </div>

      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="font-display text-xl font-bold">Vivah<span className="text-primary">Bandhan</span></span>
          </Link>

          {/* Steps indicator */}
          <div className="mb-8 flex gap-2">
            {[1, 2].map((s) => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>

          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            {step === 1 ? "Create Account" : "Basic Details"}
          </h1>
          <p className="mb-8 text-muted-foreground">
            {step === 1 ? "Enter your credentials to get started" : "Tell us a bit about yourself"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {step === 1 && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Enter your full name" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your@email.com" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input id="mobile" type="tel" placeholder="+91 98765 43210" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <Label>Gender</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" className="mt-1.5" />
                </div>
                <div>
                  <Label>Religion</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select religion" /></SelectTrigger>
                    <SelectContent>
                      {["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Other"].map((r) => (
                        <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="City, State" className="mt-1.5" />
                </div>
              </>
            )}
            <Button variant="crimson" size="lg" type="submit" className="mt-2 w-full">
              {step === 1 ? "Continue" : "Create Profile"} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
            {step > 1 && (
              <Button variant="ghost" type="button" onClick={() => setStep(step - 1)}>Go Back</Button>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">Sign In</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will connect to PHP API
    console.log("Login submitted");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left decorative panel */}
      <div className="hidden w-1/2 bg-gradient-hero lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Heart className="mx-auto mb-6 h-16 w-16 text-primary-foreground/80 fill-current animate-float" />
          <h2 className="mb-4 font-display text-4xl font-bold text-primary-foreground">Welcome Back</h2>
          <p className="max-w-sm text-primary-foreground/70">
            Your journey to finding the perfect life partner continues here.
          </p>
        </motion.div>
      </div>

      {/* Login form */}
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
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Sign In</h1>
          <p className="mb-8 text-muted-foreground">Enter your credentials to access your account</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="email">Email or Mobile</Label>
              <Input
                id="email"
                type="text"
                placeholder="Enter email or mobile number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" /> Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Forgot Password?</a>
            </div>
            <Button variant="default" size="lg" type="submit" className="w-full">Sign In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-primary hover:underline">Register Free</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;

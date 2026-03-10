import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AuthAPI, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await AuthAPI.login({ email, password });

      // Optional: store token if returned
      if (res?.token) {
        localStorage.setItem("token", res.token);
      }

      toast({
        title: "Welcome back!",
        description: "Login successful",
      });

      // ✅ Redirect to dashboard
      navigate("/dashboard/profile");

    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Login failed. Check your connection.";

      toast({
        title: "Login Failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen">
      
      {/* LEFT PANEL */}
      <div className="hidden w-1/2 bg-gradient-hero lg:flex lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <Heart className="mx-auto mb-6 h-16 w-16 text-primary-foreground/80 fill-current animate-float" />

          <h2 className="mb-4 font-display text-4xl font-bold text-primary-foreground">
            Welcome Back
          </h2>

          <p className="max-w-sm text-primary-foreground/70">
            Your journey to finding the perfect life partner continues here.
          </p>
        </motion.div>
      </div>

      {/* LOGIN FORM */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >

          {/* Logo */}
          <Link to="/" className="mb-8 flex items-center gap-2">
            <Heart className="h-7 w-7 text-primary fill-primary" />
            <span className="font-display text-xl font-bold">
              Vivah<span className="text-primary">Bandhan</span>
            </span>
          </Link>

          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">
            Sign In
          </h1>

          <p className="mb-8 text-muted-foreground">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* EMAIL */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5"
                disabled={loading}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <Label htmlFor="password">Password</Label>

              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* REMEMBER + FORGOT */}
            <div className="flex items-center justify-between text-sm">

              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-border" />
                Remember me
              </label>

              <a href="#" className="text-primary hover:underline">
                Forgot Password?
              </a>

            </div>

            {/* USER LOGIN */}
            <Button
              variant="crimson"
              size="lg"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            {/* ADMIN LOGIN */}
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="w-full"
              onClick={handleAdminLogin}
            >
              Admin Login
            </Button>

          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Register Free
            </Link>
          </p>

        </motion.div>
      </div>
    </div>
  );
};

export default Login;
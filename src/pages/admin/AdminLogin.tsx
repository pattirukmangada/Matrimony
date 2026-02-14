import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AdminAPI, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await AdminAPI.login({ email, password });

      if (response.user.role !== "admin") {
        throw new Error("Unauthorized access");
      }

      localStorage.setItem("admin_token", response.token);

      toast({
        title: "Admin Login Successful",
        description: "Welcome to dashboard",
      });

      navigate("/admin/dashboard");
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : "Invalid admin credentials";

      toast({
        title: "Access Denied",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-zinc-900 p-8 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-500" />
          <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <Label className="text-zinc-300">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="mt-1.5 bg-zinc-800 text-white border-zinc-700"
            />
          </div>

          <div>
            <Label className="text-zinc-300">Password</Label>
            <div className="relative mt-1.5">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-zinc-800 text-white border-zinc-700"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {loading ? "Authenticating..." : "Secure Login"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;

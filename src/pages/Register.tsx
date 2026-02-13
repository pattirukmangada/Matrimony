import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Eye, EyeOff, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { AuthAPI, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Step 1
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // Step 2
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [religion, setReligion] = useState("");
  const [location, setLocation] = useState("");

  // Step 3 (Email OTP only)
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);

  /* ---------------- SUBMIT HANDLER ---------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (!fullName || !email || !mobile || !password) {
        toast({ title: "Error", description: "All fields required", variant: "destructive" });
        return;
      }

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        toast({ title: "Error", description: "Enter valid 10-digit mobile number", variant: "destructive" });
        return;
      }

      if (password.length < 8) {
        toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
        return;
      }

      setStep(2);
      return;
    }

    if (step === 2) {
      if (!gender || !dob || !religion || !location) {
        toast({ title: "Error", description: "All fields required", variant: "destructive" });
        return;
      }

      if (loading) return;
      setLoading(true);

      try {
        await AuthAPI.register({
          full_name: fullName,
          email,
          mobile,
          password,
          gender,
          dob,
          religion,
          location,
        });

        setStep(3);

        toast({
          title: "Registration Successful!",
          description: "OTP sent to your email",
        });

      } catch (err) {
        const msg =
          err instanceof ApiError ? err.message : "Registration failed";
        toast({ title: "Error", description: msg, variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
  };

  /* ---------------- EMAIL OTP VERIFY ---------------- */

  const handleVerifyOTP = async () => {
    if (emailOtp.length !== 6) {
      toast({ title: "Error", description: "Enter valid 6-digit OTP", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      const res = await AuthAPI.verifyOTP({
        identifier: email,
        type: "email",
        otp: emailOtp,
      });

      if (res.success) {
        setEmailVerified(true);
        setEmailOtp("");

        toast({
          title: "Account Activated!",
          description: "Redirecting to login...",
        });

        setTimeout(() => navigate("/login"), 1500);
      }
    } catch {
      toast({ title: "Error", description: "Verification failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md">

        <Link to="/" className="mb-8 flex items-center gap-2">
          <Heart className="h-7 w-7 text-primary fill-primary" />
          <span className="font-display text-xl font-bold">
            Vivah<span className="text-primary">Bandhan</span>
          </span>
        </Link>

        {/* Step Indicator */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <h2 className="mb-6 text-center text-xl font-semibold">
          {step === 1 && "Create Account"}
          {step === 2 && "Basic Details"}
          {step === 3 && "Verify Email OTP"}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
              />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <Input
                type="tel"
                placeholder="Mobile (10-digit)"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                disabled={loading}
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={loading}
              />
              <Input
                placeholder="Religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                disabled={loading}
              />
              <Input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </>
          )}

          {/* STEP 3 - EMAIL OTP */}
          {step === 3 && (
            <>
              <Input
                placeholder="Enter 6-digit Email OTP"
                maxLength={6}
                value={emailOtp}
                onChange={(e) =>
                  setEmailOtp(e.target.value.replace(/\D/g, ""))
                }
                disabled={emailVerified || loading}
              />
              <Button
                type="button"
                onClick={handleVerifyOTP}
                disabled={emailVerified || loading}
              >
                {emailVerified ? "✓ Email Verified" : "Verify Email"}
              </Button>
            </>
          )}

          {step <= 2 && (
            <Button type="submit" disabled={loading}>
              {loading
                ? "Processing..."
                : step === 1
                ? "Continue"
                : "Create Profile"}{" "}
              {!loading && <ArrowRight size={16} />}
            </Button>
          )}

          {step > 1 && step <= 2 && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(step - 1)}
              disabled={loading}
            >
              Go Back
            </Button>
          )}
        </form>
      </motion.div>
    </div>
  );
};

export default Register;

import { useState, useEffect } from "react";
import { Search as SearchIcon, SlidersHorizontal, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProfileCard, { type ProfileData } from "@/components/ProfileCard";
import { SearchAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
/**
 * Public Profiles page — shows only admin-approved profiles.
 * No login required. Interest actions require login.
 */
const Profiles = () => {
  const { toast } = useToast();
  const [showFilters, setShowFilters] = useState(false);
  const [profiles, setProfiles] = useState<ProfileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  // Filters
  const [location, setLocation] = useState("");
  const [religion, setReligion] = useState("");
  const [education, setEducation] = useState("");
  const [ageMin, setAgeMin] = useState("");
  const [ageMax, setAgeMax] = useState("");
  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await SearchAPI.search({
        city: location || undefined,
        religion: religion && religion !== "any" ? religion : undefined,
        education: education && education !== "any" ? education : undefined,
        age_min: ageMin ? Number(ageMin) : undefined,
        age_max: ageMax ? Number(ageMax) : undefined,
      });
      const data = (res as any).profiles || [];
      setTotal((res as any).total || data.length);
      setProfiles(
        data.map((p: any) => ({
          id: String(p.user_id || p.id),
          name: p.full_name || "User",
          age: p.age || 0,
          gender: p.gender || "",
          location: [p.city, p.state].filter(Boolean).join(", ") || "India",
          education: p.education || "",
          profession: p.profession || "",
          religion: p.religion || "",
          height: "",
          imageUrl: p.profile_image || "",
          verified: [
            p.mobile_verified && "mobile",
            p.email_verified && "email",
            p.id_verified && "id",
            p.premium_verified && "premium",
          ].filter(Boolean) as ProfileData["verified"],
          hasAccess: false, // Public view — no access until interest accepted
        }))
      );
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to load profiles" });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchProfiles(); }, []);
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-2 flex items-center gap-2">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">Verified <span className="text-primary">Profiles</span></h1>
          </div>
          <p className="mb-8 text-muted-foreground">Browse admin-approved profiles. Login to send interest and view full details.</p>
        </motion.div>
        {/* Search & filter bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by location..." className="pl-10" value={location} onChange={(e) => setLocation(e.target.value)} />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button variant="crimson" onClick={fetchProfiles} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SearchIcon className="mr-2 h-4 w-4" />} Search
          </Button>
        </div>
        {showFilters && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Age Range</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input type="number" placeholder="Min" min={18} max={60} value={ageMin} onChange={(e) => setAgeMin(e.target.value)} />
                  <Input type="number" placeholder="Max" min={18} max={60} value={ageMax} onChange={(e) => setAgeMax(e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Religion</Label>
                <Select value={religion} onValueChange={setReligion}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["any", "hindu", "muslim", "christian", "sikh", "jain"].map((r) => (
                      <SelectItem key={r} value={r}>{r === "any" ? "Any" : r.charAt(0).toUpperCase() + r.slice(1)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Education</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["any", "B.Tech", "MBA", "MBBS", "CA", "M.Tech", "PhD"].map((e) => (
                      <SelectItem key={e} value={e.toLowerCase()}>{e === "any" ? "Any" : e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="crimson" className="w-full" onClick={fetchProfiles} disabled={loading}>Apply</Button>
              </div>
            </div>
          </motion.div>
        )}
        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : profiles.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">{total} verified profile{total !== 1 && "s"}</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {profiles.map((profile, i) => (
                <motion.div key={profile.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <ProfileCard profile={profile} />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-20 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">No profiles found. Check back soon!</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
export default Profiles;

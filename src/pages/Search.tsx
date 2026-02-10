import { useState } from "react";
import { Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import ProfileCard from "@/components/ProfileCard";
import { mockProfiles } from "@/data/mockProfiles";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const SearchPage = () => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Search <span className="text-primary">Profiles</span></h1>
          <p className="mb-8 text-muted-foreground">Find your perfect match with advanced filters</p>
        </motion.div>

        {/* Search bar */}
        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, location, profession..." className="pl-10" />
          </div>
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button variant="crimson"><SearchIcon className="mr-2 h-4 w-4" /> Search</Button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-8 overflow-hidden rounded-xl border border-border bg-card p-6"
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>Age Range</Label>
                <div className="mt-1.5 flex gap-2">
                  <Input type="number" placeholder="Min" min={18} max={60} />
                  <Input type="number" placeholder="Max" min={18} max={60} />
                </div>
              </div>
              <div>
                <Label>Religion</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["Any", "Hindu", "Muslim", "Christian", "Sikh", "Jain"].map((r) => (
                      <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Location</Label>
                <Input placeholder="City or State" className="mt-1.5" />
              </div>
              <div>
                <Label>Education</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["Any", "B.Tech", "MBA", "MBBS", "CA", "M.Tech", "PhD"].map((e) => (
                      <SelectItem key={e} value={e.toLowerCase()}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Marital Status</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["Any", "Never Married", "Divorced", "Widowed"].map((m) => (
                      <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Income</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>
                    {["Any", "3-5 LPA", "5-10 LPA", "10-20 LPA", "20+ LPA"].map((inc) => (
                      <SelectItem key={inc} value={inc.toLowerCase()}>{inc}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Caste</Label>
                <Input placeholder="Any caste" className="mt-1.5" />
              </div>
              <div className="flex items-end">
                <Button variant="crimson" className="w-full">Apply Filters</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Results */}
        <p className="mb-4 text-sm text-muted-foreground">{mockProfiles.length} profiles found</p>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockProfiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <ProfileCard profile={profile} />
            </motion.div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SearchPage;

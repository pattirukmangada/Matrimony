import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VerificationBadge from "@/components/VerificationBadge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Edit, MapPin, Briefcase, GraduationCap, Heart, User } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
  const profile = {
    name: "Priya Sharma",
    age: 26,
    gender: "Female",
    dob: "15 March 1999",
    height: "5'5\"",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Hindi",
    maritalStatus: "Never Married",
    location: "Mumbai, Maharashtra",
    education: "MBA, Finance",
    profession: "Investment Banker",
    company: "JP Morgan",
    income: "15-20 LPA",
    about: "I'm a cheerful, family-oriented person who believes in building a strong, loving relationship. I enjoy reading, traveling, and trying new cuisines. Looking for a life partner who values family, honesty, and mutual respect.",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop",
    verified: ["mobile", "email", "premium"] as const,
    partnerPreferences: {
      ageRange: "27-32",
      religion: "Hindu",
      education: "Graduate / Post Graduate",
      location: "Mumbai, Pune, Bangalore",
      expectations: "Looking for someone who is kind, ambitious, and family-oriented.",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Profile header */}
          <div className="mb-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 md:flex-row md:items-start">
            <div className="relative shrink-0">
              <img
                src={profile.imageUrl}
                alt={profile.name}
                className="h-48 w-48 rounded-2xl object-cover shadow-elegant"
              />
              <button className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold text-foreground">{profile.name}, {profile.age}</h1>
                {profile.verified.map((v) => (
                  <VerificationBadge key={v} type={v} compact />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>
                <span className="flex items-center gap-1"><GraduationCap className="h-3.5 w-3.5" />{profile.education}</span>
                <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{profile.profession}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.verified.map((v) => (
                  <VerificationBadge key={v} type={v} />
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button variant="crimson"><Edit className="mr-1 h-4 w-4" /> Edit Profile</Button>
                <Button variant="outline"><Heart className="mr-1 h-4 w-4" /> Send Interest</Button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="about" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-3 bg-muted">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="preferences">Partner Preferences</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-3 font-display text-lg font-semibold text-foreground">About Me</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{profile.about}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Basic Details</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    { label: "Date of Birth", value: profile.dob },
                    { label: "Height", value: profile.height },
                    { label: "Religion", value: profile.religion },
                    { label: "Caste", value: profile.caste },
                    { label: "Mother Tongue", value: profile.motherTongue },
                    { label: "Marital Status", value: profile.maritalStatus },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Education & Career</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    { label: "Education", value: profile.education },
                    { label: "Profession", value: profile.profession },
                    { label: "Company", value: profile.company },
                    { label: "Annual Income", value: profile.income },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold text-foreground">Partner Preferences</h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {[
                    { label: "Age Range", value: profile.partnerPreferences.ageRange },
                    { label: "Religion", value: profile.partnerPreferences.religion },
                    { label: "Education", value: profile.partnerPreferences.education },
                    { label: "Location", value: profile.partnerPreferences.location },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-0.5 text-sm font-medium text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Expectations</p>
                  <p className="mt-0.5 text-sm text-foreground">{profile.partnerPreferences.expectations}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gallery">
              <div className="rounded-xl border border-border bg-card p-6 text-center">
                <User className="mx-auto mb-3 h-12 w-12 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Photo gallery will be available after API integration</p>
                <Button variant="outline" className="mt-4"><Camera className="mr-1 h-4 w-4" /> Upload Photos</Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;

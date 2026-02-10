import { Heart, MapPin, Briefcase, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import VerificationBadge from "./VerificationBadge";

export interface ProfileData {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  education: string;
  profession: string;
  religion: string;
  height: string;
  imageUrl: string;
  verified: ("mobile" | "email" | "id" | "premium")[];
}

interface ProfileCardProps {
  profile: ProfileData;
}

const ProfileCard = ({ profile }: ProfileCardProps) => (
  <div className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
    <div className="relative aspect-[3/4] overflow-hidden">
      <img
        src={profile.imageUrl}
        alt={profile.name}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {profile.verified.map((v) => (
            <VerificationBadge key={v} type={v} compact />
          ))}
        </div>
        <h3 className="mt-1.5 font-display text-lg font-semibold text-primary-foreground">
          {profile.name}, {profile.age}
        </h3>
      </div>
    </div>
    <div className="p-4">
      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>
        <span className="flex items-center gap-1.5"><GraduationCap className="h-3.5 w-3.5" />{profile.education}</span>
        <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{profile.profession}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="crimson" size="sm" className="flex-1">
          <Heart className="mr-1 h-3.5 w-3.5" /> Send Interest
        </Button>
        <Button variant="outline" size="sm" className="flex-1">View Profile</Button>
      </div>
    </div>
  </div>
);

export default ProfileCard;

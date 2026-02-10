import { type ProfileData } from "@/components/ProfileCard";

export const mockProfiles: ProfileData[] = [
  {
    id: "1",
    name: "Priya Sharma",
    age: 26,
    gender: "Female",
    location: "Mumbai, Maharashtra",
    education: "MBA, Finance",
    profession: "Investment Banker",
    religion: "Hindu",
    height: "5'5\"",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=533&fit=crop",
    verified: ["mobile", "email", "premium"],
  },
  {
    id: "2",
    name: "Rahul Verma",
    age: 29,
    gender: "Male",
    location: "Bangalore, Karnataka",
    education: "B.Tech, Computer Science",
    profession: "Software Engineer",
    religion: "Hindu",
    height: "5'10\"",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=533&fit=crop",
    verified: ["mobile", "email", "id"],
  },
  {
    id: "3",
    name: "Ananya Patel",
    age: 25,
    gender: "Female",
    location: "Ahmedabad, Gujarat",
    education: "MBBS, Medicine",
    profession: "Doctor",
    religion: "Hindu",
    height: "5'4\"",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=533&fit=crop",
    verified: ["mobile", "email"],
  },
  {
    id: "4",
    name: "Arjun Reddy",
    age: 30,
    gender: "Male",
    location: "Hyderabad, Telangana",
    education: "M.Tech, AI/ML",
    profession: "Data Scientist",
    religion: "Hindu",
    height: "5'11\"",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=533&fit=crop",
    verified: ["mobile", "email", "id", "premium"],
  },
  {
    id: "5",
    name: "Sneha Iyer",
    age: 27,
    gender: "Female",
    location: "Chennai, Tamil Nadu",
    education: "CA, Chartered Accountant",
    profession: "Finance Manager",
    religion: "Hindu",
    height: "5'3\"",
    imageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=533&fit=crop",
    verified: ["mobile", "premium"],
  },
  {
    id: "6",
    name: "Vikram Singh",
    age: 31,
    gender: "Male",
    location: "Delhi, NCR",
    education: "MBA, Marketing",
    profession: "Business Analyst",
    religion: "Sikh",
    height: "6'0\"",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=533&fit=crop",
    verified: ["mobile", "email", "id"],
  },
];

import img1 from "@/assets/hero-bg.png"
import img2 from "@/assets/hero-1.png"
import img3 from "@/assets/hero-2.png"
import img4 from "@/assets/hero-3.png"
import img5 from "@/assets/hero-4.png"
import img6 from "@/assets/hero-5.png"

export const heroImages = [img1, img2, img3, img4, img5, img6]

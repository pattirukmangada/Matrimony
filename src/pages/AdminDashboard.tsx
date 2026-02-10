import { Users, UserCheck, Crown, TrendingUp, ShieldCheck, Image, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

const statsData = [
  { label: "Total Users", value: "52,340", icon: Users, change: "+12%" },
  { label: "Active Users", value: "38,120", icon: UserCheck, change: "+8%" },
  { label: "Premium Users", value: "4,560", icon: Crown, change: "+23%" },
  { label: "Today's Registrations", value: "147", icon: TrendingUp, change: "+5%" },
];

const pendingItems = [
  { type: "ID Verification", user: "Rahul Mehta", id: "VB-4521", time: "2 hours ago" },
  { type: "Photo Approval", user: "Sneha Gupta", id: "VB-4519", time: "3 hours ago" },
  { type: "ID Verification", user: "Amit Kumar", id: "VB-4517", time: "5 hours ago" },
  { type: "Photo Approval", user: "Deepika Roy", id: "VB-4515", time: "6 hours ago" },
];

const recentUsers = [
  { name: "Priya Sharma", email: "priya@email.com", plan: "Gold", status: "Active" },
  { name: "Rahul Verma", email: "rahul@email.com", plan: "Free", status: "Active" },
  { name: "Ananya Patel", email: "ananya@email.com", plan: "Platinum", status: "Active" },
  { name: "Vikram Singh", email: "vikram@email.com", plan: "Gold", status: "Suspended" },
];

const AdminDashboard = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Admin <span className="text-primary">Dashboard</span></h1>
        <p className="mb-8 text-muted-foreground">Manage users, verifications, and platform analytics</p>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Pending approvals */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Pending Approvals
            </h3>
            <div className="flex flex-col gap-3">
              {pendingItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {item.type === "ID Verification" ? (
                        <ShieldCheck className="h-4 w-4 text-accent" />
                      ) : (
                        <Image className="h-4 w-4 text-accent" />
                      )}
                      <span className="text-sm font-medium text-foreground">{item.user}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.type} • {item.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="crimson" size="sm">Approve</Button>
                    <Button variant="outline" size="sm">Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent users */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Recent Users
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.email} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <p className="font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </td>
                      <td>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.plan === "Platinum" ? "bg-primary/10 text-primary" :
                          user.plan === "Gold" ? "bg-accent/20 text-accent-foreground" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      <td>
                        <span className={`text-xs ${user.status === "Active" ? "text-green-600" : "text-destructive"}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>
                        <Button variant="ghost" size="sm">
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default AdminDashboard;

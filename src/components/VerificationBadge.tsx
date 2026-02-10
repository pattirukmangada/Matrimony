import { BadgeCheck, Mail, Phone, Shield } from "lucide-react";

type VerificationType = "mobile" | "email" | "id" | "premium";

const badgeConfig: Record<VerificationType, { icon: React.ElementType; label: string; className: string }> = {
  mobile: { icon: Phone, label: "Mobile Verified", className: "bg-green-100 text-green-700" },
  email: { icon: Mail, label: "Email Verified", className: "bg-blue-100 text-blue-700" },
  id: { icon: Shield, label: "ID Verified", className: "bg-accent/20 text-accent-foreground" },
  premium: { icon: BadgeCheck, label: "Premium", className: "bg-primary/10 text-primary" },
};

interface VerificationBadgeProps {
  type: VerificationType;
  compact?: boolean;
}

const VerificationBadge = ({ type, compact = false }: VerificationBadgeProps) => {
  const config = badgeConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <span title={config.label} className={`inline-flex items-center justify-center rounded-full p-1 ${config.className}`}>
        <Icon className="h-3.5 w-3.5" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
};

export default VerificationBadge;

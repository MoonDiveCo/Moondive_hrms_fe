import {
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";

const ICONS = {
  success: CheckCircle,
  warning: AlertTriangle,
  info: Clock,
  default: Info,
};

export default function StatusBadge({
  label,
  variant = "default",
  size = "sm",
  showIcon = true,
}) {
  const Icon = ICONS[variant];

  const base =
    "inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap";

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-orange-100 text-orange-700",
    info: "bg-blue-100 text-blue-700",
    default: "bg-gray-100 text-gray-700",
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {showIcon && Icon && <Icon size={14} />}
      {label}
    </span>
  );
}

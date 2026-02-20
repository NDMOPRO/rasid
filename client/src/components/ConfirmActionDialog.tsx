import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, Trash2, Shield, RefreshCw, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "danger" | "warning" | "info" | "default";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  icon?: LucideIcon;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

const variantConfig: Record<ConfirmVariant, { icon: LucideIcon; color: string; btnClass: string }> = {
  danger: { icon: Trash2, color: "text-red-500", btnClass: "bg-red-600 hover:bg-red-700 text-white" },
  warning: { icon: AlertTriangle, color: "text-amber-500", btnClass: "bg-amber-600 hover:bg-amber-700 text-white" },
  info: { icon: Shield, color: "text-blue-500", btnClass: "bg-blue-600 hover:bg-blue-700 text-white" },
  default: { icon: RefreshCw, color: "text-primary", btnClass: "bg-primary hover:bg-primary/90 text-primary-foreground" },
};

export default function ConfirmActionDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "تأكيد",
  cancelLabel = "إلغاء",
  variant = "default",
  icon,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  const config = variantConfig[variant];
  const Icon = icon || config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl" className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-muted", config.color)}>
              <Icon className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-lg">{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:flex-row-reverse">
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn("min-w-[100px]", config.btnClass)}
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
          <AlertDialogCancel
            onClick={onCancel}
            className="min-w-[100px]"
          >
            {cancelLabel}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

import { type ReactNode, type ElementType, isValidElement } from "react";
import { Inbox } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ElementType | ReactNode;
  action?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const renderIcon = () => {
    if (!icon) return <Inbox className="h-6 w-6" aria-hidden="true" />;
    if (isValidElement(icon)) return icon;
    if (typeof icon === "function" || typeof icon === "object") {
      const IconComponent = icon as ElementType;
      return <IconComponent className="h-6 w-6" aria-hidden="true" />;
    }
    return <Inbox className="h-6 w-6" aria-hidden="true" />;
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-lg border border-dashed border-border bg-surface/40",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised text-muted-foreground mb-4"
      >
        {renderIcon()}
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action ? (
        <div>{action}</div>
      ) : actionLabel && onAction ? (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

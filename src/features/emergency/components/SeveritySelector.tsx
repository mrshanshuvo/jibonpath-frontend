"use client";

import { useRef, type KeyboardEvent } from "react";
import { AlertTriangle, HeartPulse, Flame, Activity } from "lucide-react";
import { Priority } from "@/types/entities.types";
import { cn } from "@/lib/utils";

interface SeverityLevel {
  priority: Priority;
  label: string;
  desc: string;
  icon: typeof Flame;
  color: string;
  bg: string;
  activeRing: string;
}

const SEVERITY_LEVELS: SeverityLevel[] = [
  {
    priority: Priority.CRITICAL,
    label: "Critical / Resuscitation",
    desc: "Unconscious, cardiac arrest, stroke, severe trauma, choking",
    icon: Flame,
    color: "text-emergency",
    bg: "bg-emergency/10 border-emergency/40 hover:border-emergency",
    activeRing: "ring-2 ring-emergency bg-emergency/15",
  },
  {
    priority: Priority.HIGH,
    label: "High Priority / Acute",
    desc: "Severe chest pain, heavy bleeding, difficulty breathing, major fracture",
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning/10 border-warning/40 hover:border-warning",
    activeRing: "ring-2 ring-warning bg-warning/15",
  },
  {
    priority: Priority.MEDIUM,
    label: "Medium / Urgent Care",
    desc: "Persistent high fever, deep lacerations, asthma attack, severe abdominal pain",
    icon: Activity,
    color: "text-info",
    bg: "bg-info/10 border-info/40 hover:border-info",
    activeRing: "ring-2 ring-info bg-info/15",
  },
  {
    priority: Priority.LOW,
    label: "Standard / Medical Transfer",
    desc: "Scheduled hospital transfer, mild non-acute conditions, routine transport",
    icon: HeartPulse,
    color: "text-success",
    bg: "bg-success/10 border-success/40 hover:border-success",
    activeRing: "ring-2 ring-success bg-success/15",
  },
];

export interface SeveritySelectorProps {
  value: Priority;
  onChange: (priority: Priority) => void;
  error?: string;
  disabled?: boolean;
}

export function SeveritySelector({
  value,
  onChange,
  error,
  disabled,
}: SeveritySelectorProps) {
  const optionsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const max = SEVERITY_LEVELS.length - 1;
    let next: number | null = null;

    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = index === max ? 0 : index + 1;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = index === 0 ? max : index - 1;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = max;
        break;
      default:
        return;
    }

    e.preventDefault();
    onChange(SEVERITY_LEVELS[next].priority);
    optionsRef.current[next]?.focus();
  };

  const errorId = error ? "severity-error" : undefined;
  const helpId = "severity-help";
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div
      role="radiogroup"
      aria-labelledby="severity-label"
      aria-describedby={describedBy}
      aria-invalid={error ? true : undefined}
      className="space-y-4"
    >
      <div>
        <span
          id="severity-label"
          className="block text-xs font-bold uppercase tracking-wider text-foreground"
        >
          Step 1: Patient Condition & Severity Level
        </span>
        <p id={helpId} className="text-xs text-muted-foreground mt-0.5">
          How serious is it? This helps us send the right ambulance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SEVERITY_LEVELS.map((level, index) => {
          const Icon = level.icon;
          const isSelected = value === level.priority;

          return (
            <button
              key={level.priority}
              ref={(el) => {
                optionsRef.current[index] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(level.priority)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 text-left transition-all duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
                level.bg,
                isSelected ? level.activeRing : "hover:opacity-100",
              )}
            >
              <div
                aria-hidden="true"
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/80 shadow-sm",
                  level.color,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="font-bold text-sm text-foreground">
                  {level.label}
                </div>
                <div className="text-xs text-muted-foreground leading-normal mt-0.5">
                  {level.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-xs text-destructive font-medium"
        >
          {error}
        </p>
      )}
    </div>
  );
}

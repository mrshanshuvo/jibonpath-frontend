import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/config/routes";
import { Ambulance, ArrowLeft, PhoneCall } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emergency/15 text-emergency mb-6 shadow-xl shadow-emergency/20 animate-pulse">
        <Ambulance className="h-10 w-10" />
      </div>

      <p className="text-xs uppercase tracking-widest font-semibold text-emergency mb-2">
        404 — Coordinates Not Located
      </p>
      <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-4">
        Emergency Route Not Found
      </h1>
      <p className="text-sm text-muted-foreground max-w-md mb-8 leading-relaxed">
        The requested medical dispatch coordinates or portal page could not be located.
        If this is an active life-threatening emergency, contact 999 immediately.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <Link href={ROUTES.home}>
          <Button variant="primary" size="lg" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Return to Operations Base
          </Button>
        </Link>
        <a href="tel:999">
          <Button
            variant="outline"
            size="lg"
            className="border-emergency text-emergency hover:bg-emergency/10"
            leftIcon={<PhoneCall className="h-4 w-4" />}
          >
            Emergency 999 Hotline
          </Button>
        </a>
      </div>
    </div>
  );
}

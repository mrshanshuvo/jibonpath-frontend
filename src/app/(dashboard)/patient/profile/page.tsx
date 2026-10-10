"use client";

import { useState } from "react";
import { useAuthUser, useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api-client";
import { Button, Input, Card, Badge } from "@/components/ui";
import { User, Mail, Phone, MapPin, Save } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { ApiResponse } from "@/types/api.types";
import type { User as UserModel } from "@/types/entities.types";

export default function PatientProfilePage() {
  const user = useAuthUser();
  const updateUser = useAuthStore((state) => state.updateUser);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch<ApiResponse<UserModel>>("/users/me", {
        name,
        phone,
        address,
      });
      if (res.data) {
        updateUser(res.data);
        toast.success("Profile information updated successfully!");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update profile";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Patient Account & Profile
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your contact credentials and default pickup address for rapid
          emergency dispatch.
        </p>
      </div>

      <Card className="p-6 space-y-6">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 pb-4 border-b border-border/60">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary font-bold text-xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <Badge variant="default" size="sm">
                {user.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {user.email}
            </p>
            <span className="text-3xs text-muted-foreground mt-1 block">
              Member since: {formatDateTime(user.createdAt)}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Legal Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            required
            disabled={isSaving}
          />

          <Input
            label="Email Address (Login Identifier)"
            value={user.email}
            disabled
            leftIcon={<Mail className="h-4 w-4" />}
            helperText="Email cannot be changed directly for security and audit integrity."
          />

          <Input
            label="Primary Emergency Contact Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="017XXXXXXXX"
            leftIcon={<Phone className="h-4 w-4" />}
            disabled={isSaving}
          />

          <Input
            label="Residential / Default Pickup Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="e.g. Dhanmondi, Dhaka"
            leftIcon={<MapPin className="h-4 w-4" />}
            disabled={isSaving}
          />

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

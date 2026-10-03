"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal, Button, Input } from "@/components/ui";
import {
  AmbulanceStatus,
  AmbulanceType,
  type Ambulance,
} from "@/types/entities.types";
import {
  createAmbulanceSchema,
  type CreateAmbulanceInput,
} from "../types";
import {
  useCreateAmbulance,
  useUpdateAmbulance,
} from "../api/fleet.queries";
import { Ambulance as AmbulanceIcon, Plus, Save } from "lucide-react";

interface AmbulanceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  ambulance?: Ambulance | null;
}

export function AmbulanceFormModal({
  isOpen,
  onClose,
  ambulance,
}: AmbulanceFormModalProps) {
  const isEditing = Boolean(ambulance);
  const createMutation = useCreateAmbulance();
  const updateMutation = useUpdateAmbulance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateAmbulanceInput>({
    resolver: zodResolver(createAmbulanceSchema),
    defaultValues: {
      registrationNumber: "",
      model: "",
      type: AmbulanceType.BASIC,
      status: AmbulanceStatus.AVAILABLE,
    },
  });

  useEffect(() => {
    if (ambulance) {
      reset({
        registrationNumber: ambulance.registrationNumber,
        model: ambulance.model,
        type: ambulance.type,
        status: ambulance.status,
      });
    } else {
      reset({
        registrationNumber: "",
        model: "",
        type: AmbulanceType.BASIC,
        status: AmbulanceStatus.AVAILABLE,
      });
    }
  }, [ambulance, reset]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: CreateEmergencyInput) => {
    if (isEditing && ambulance) {
      updateMutation.mutate(
        { id: ambulance.id, input: data },
        {
          onSuccess: () => {
            onClose();
          },
        },
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Fleet Vehicle" : "Register New Ambulance"}
      description={
        isEditing
          ? "Update registration number, medical life-support tier, or rotation status."
          : "Add a newly commissioned emergency response unit into the active rotation."
      }
    >
      <form onSubmit={handleSubmit(onSubmit as never)} className="space-y-4">
        <Input
          label="Registration Number / License Plate"
          placeholder="e.g. DHAKA-METRO-CHA-11-2045"
          required
          leftIcon={<AmbulanceIcon className="h-4 w-4" />}
          error={errors.registrationNumber?.message}
          disabled={isPending}
          {...register("registrationNumber")}
        />

        <Input
          label="Vehicle Model & Chassis"
          placeholder="e.g. Toyota HiAce GL High-Roof 2024"
          required
          error={errors.model?.message}
          disabled={isPending}
          {...register("model")}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Equipment Tier
            </label>
            <select
              className="w-full h-10 rounded-md border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isPending}
              {...register("type")}
            >
              <option value={AmbulanceType.BASIC}>Basic Life Support (BLS)</option>
              <option value={AmbulanceType.ADVANCED_LIFE_SUPPORT}>
                Advanced Cardiac Life Support (ACLS)
              </option>
              <option value={AmbulanceType.INTENSIVE_CARE}>
                Intensive Care Unit (ICU)
              </option>
            </select>
            {errors.type && (
              <p className="text-xs text-rose-500 font-medium">{errors.type.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Operational Status
            </label>
            <select
              className="w-full h-10 rounded-md border border-border bg-surface px-3 py-2 text-xs sm:text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isPending}
              {...register("status")}
            >
              <option value={AmbulanceStatus.AVAILABLE}>AVAILABLE</option>
              <option value={AmbulanceStatus.DISPATCHED}>DISPATCHED</option>
              <option value={AmbulanceStatus.MAINTENANCE}>MAINTENANCE</option>
              <option value={AmbulanceStatus.RETIRED}>RETIRED</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isPending}
            leftIcon={
              isEditing ? (
                <Save className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )
            }
          >
            {isEditing ? "Save Changes" : "Commission Vehicle"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
type CreateEmergencyInput = CreateAmbulanceInput;

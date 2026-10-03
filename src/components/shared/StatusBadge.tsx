import * as React from "react";
import { Badge, type BadgeProps } from "./Badge";
import {
  Priority,
  RequestStatus,
  DispatchStatus,
  AmbulanceStatus,
  PaymentStatus,
} from "@/types/entities.types";
import {
  getPriorityConfig,
  getRequestStatusConfig,
  getDispatchStatusConfig,
  getAmbulanceStatusConfig,
  getPaymentStatusConfig,
  type StatusConfig,
} from "@/config/status-styles";

export type StatusBadgeProps = (
  | { domain: "priority"; value: Priority }
  | { domain: "request"; value: RequestStatus }
  | { domain: "dispatch"; value: DispatchStatus }
  | { domain: "ambulance"; value: AmbulanceStatus }
  | { domain: "payment"; value: PaymentStatus }
) & {
  className?: string;
  size?: BadgeProps["size"];
  pulse?: boolean;
};

export function StatusBadge(props: StatusBadgeProps) {
  const { className, size = "default", pulse } = props;

  let config: StatusConfig;
  switch (props.domain) {
    case "priority":
      config = getPriorityConfig(props.value);
      break;
    case "request":
      config = getRequestStatusConfig(props.value);
      break;
    case "dispatch":
      config = getDispatchStatusConfig(props.value);
      break;
    case "ambulance":
      config = getAmbulanceStatusConfig(props.value);
      break;
    case "payment":
      config = getPaymentStatusConfig(props.value);
      break;
  }

  const Icon = config.icon;

  return (
    <Badge
      variant={config.variant}
      appearance={config.appearance}
      size={size}
      pulse={pulse}
      icon={<Icon className="h-3 w-3" />}
      className={className}
    >
      {config.label}
    </Badge>
  );
}

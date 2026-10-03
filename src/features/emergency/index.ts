// Public API for the emergency feature (STANDARDS §1 Law 3).

// Components — all client components (RequestCard and RequestList both
// have "use client" at the top, so a single barrel is safe per §5 rule 4)
export { EmergencyBookingWizard } from "./components/EmergencyBookingWizard";
export { RequestCard } from "./components/RequestCard";
export { RequestList } from "./components/RequestList";

// API hooks
export {
  useCreateRequest,
  useMyRequests,
  useCancelRequest,
} from "./api/emergency.queries";

// Types — schema stays internal
export type {
  CreateEmergencyRequestInput,
  RequestQueryParams,
  RequestsApiResponse,
} from "./types";

// Intentionally NOT exported:
// - SeveritySelector (wizard-internal)
// - ReviewStep (wizard-internal)
// - useReverseGeocode (wizard-internal)
// - createEmergencyRequestSchema (implementation detail)
// - emergencyKeys / query key factories (implementation details)

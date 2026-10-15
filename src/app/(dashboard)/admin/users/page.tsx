import { UserManagementTable } from "@/features/admin";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          User Directory & Authorization
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage system accounts, assign RBAC access roles (PATIENT, DRIVER,
          ADMIN), and control account status.
        </p>
      </div>

      <UserManagementTable />
    </div>
  );
}

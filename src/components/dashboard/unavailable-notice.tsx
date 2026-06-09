import { Construction } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

/**
 * Shown for dashboard areas whose backend endpoints are not yet implemented
 * (the API exposes booking creation and payments, but no booking listing or
 * analytics read endpoints). The typed clients are ready to wire up when they
 * land — see README "Backend gaps".
 */
export function UnavailableNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <EmptyState
      icon={<Construction />}
      title={title}
      description={description}
    />
  );
}

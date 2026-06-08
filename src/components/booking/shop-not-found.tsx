import Link from "next/link";
import { StoreIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export function ShopNotFound({ slug }: { slug: string }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b border-border/70">
        <div className="container flex h-14 items-center">
          <Logo size="sm" />
        </div>
      </header>
      <div className="container flex max-w-lg items-center justify-center py-20">
        <EmptyState
          icon={<StoreIcon />}
          title="Shop not found"
          description={`We couldn't find a shop at "${slug}". Double-check the link from the business and try again.`}
          action={
            <Button asChild variant="outline">
              <Link href="/">Back to Bookly</Link>
            </Button>
          }
        />
      </div>
    </div>
  );
}

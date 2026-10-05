"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewOpportunityRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/recruiter/roles/new");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 border-border border-t-primary rounded-full animate-spin" />
    </div>
  );
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export function useUpdateListingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "draft" | "pending_review" | "published" | "rejected";
    }) => {
const res = await fetch(`/api/admin/listings/${id}`, {
  method: "PATCH",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ status }),
});

if (!res.ok) {
  throw new Error("Failed to update listing");
}

return res.json();    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

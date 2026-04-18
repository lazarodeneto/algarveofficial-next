import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      return await callAdminListingsApi(
        `/api/admin/listings/${id}`,
        "PATCH",
        { status }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      toast.success("Status updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

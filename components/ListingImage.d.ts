declare module "@/components/ListingImage" {
  import type { FC } from "react";

  export interface ListingImageProps {
    src?: string | null;
    category?: string | null;
    categoryImageUrl?: string | null;
    listingId?: string;
    fallbackSrc?: string;
    alt?: string;
    className?: string;
  }

  const ListingImage: FC<ListingImageProps>;
  export default ListingImage;
}

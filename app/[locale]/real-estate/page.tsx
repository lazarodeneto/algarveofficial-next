import RealEstateDirectory from "@/legacy-pages/public/RealEstateDirectory";

export const revalidate = 3600;

export default function RealEstatePage() {
  return <RealEstateDirectory />;
}

import dynamic from "next/dynamic";

export const revalidate = 3600;

const RegionsSection = dynamic(() => import("@/components/sections/RegionsSection"));
const CategoriesSection = dynamic(() => import("@/components/sections/CategoriesSection"));
const CitiesSection = dynamic(() => import("@/components/sections/CitiesSection"));
const CuratedExcellence = dynamic(() => import("@/components/sections/CuratedExcellence"));
const SignatureMapSection = dynamic(() => import("@/components/sections/SignatureMapSection"));
const AllListingsSection = dynamic(() => import("@/components/sections/AllListingsSection"));

export default function HomePage() {
  return (
    <main>
      <h1>AlgarveOfficial</h1>

      <RegionsSection />
      <CategoriesSection />
      <CuratedExcellence context={{ type: "home" }} limit={4} />
      <SignatureMapSection />
      <CitiesSection />
      <AllListingsSection />
    </main>
  );
}
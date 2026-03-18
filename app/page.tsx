import dynamic from "next/dynamic";

export const revalidate = 3600;

const RegionsSection = dynamic(() =>
  import("@/components/sections/RegionsSection").then(m => m.RegionsSection)
);

const CategoriesSection = dynamic(() =>
  import("@/components/sections/CategoriesSection").then(m => m.CategoriesSection)
);

const CitiesSection = dynamic(() =>
  import("@/components/sections/CitiesSection").then(m => m.CitiesSection)
);

const CuratedExcellence = dynamic(() =>
  import("@/components/sections/CuratedExcellence").then(m => m.CuratedExcellence)
);

const SignatureMapSection = dynamic(() =>
  import("@/components/sections/SignatureMapSection").then(m => m.SignatureMapSection)
);

const AllListingsSection = dynamic(() =>
  import("@/components/sections/AllListingsSection").then(m => m.AllListingsSection)
);

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
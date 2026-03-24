import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export default async function DirectoryPage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .limit(24);

  console.log("SERVER listings:", listings);

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <main style={{ padding: "40px" }}>
      <h1>Directory</h1>

      {!listings || listings.length === 0 ? (
        <p>No listings found</p>
      ) : (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>
              {listing.name || listing.Nome || "Unnamed"}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
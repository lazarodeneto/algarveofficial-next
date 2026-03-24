import { supabase } from "@/lib/supabase";

export default async function DirectoryPage() {
  let listings: any[] = [];

  try {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .limit(24);

    if (error) {
      console.error("Supabase error:", error);
    }

    listings = data || [];
  } catch (e) {
    console.error("Server crash:", e);
  }

  return (
    <main style= {{ padding: "40px" }
}>
  <h1>Directory </h1>

{
  listings.length === 0 ? (
    <p>No listings found </p>
      ) : (
    <ul>
    {
      listings.map((listing) => (
        <li key= { listing.id } >
        { listing.name || listing.Nome || "Unnamed" }
        </li>
      ))
    }
    </ul>
  )
}
</main>
  );
}
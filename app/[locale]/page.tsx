import { supabase } from "@/lib/supabase";

export default async function DirectoryPage() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .limit(10);

  if (error) {
    return <div>Error loading listings</div>;
  }

  return (
    <main>
      <h1>Directory</h1>

      {data && data.length > 0 ? (
        <ul>
          {data.map((item: any) => (
            <li key={item.id}>
              {item.name || item.Nome || "Unnamed"}
            </li>
          ))}
        </ul>
      ) : (
        <p>No listings</p>
      )}
    </main>
  );
}
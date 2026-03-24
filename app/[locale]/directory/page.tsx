import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function DirectoryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select("id, name, Nome")
    .limit(10);

  if (error) {
    console.error(error);
    return <div>Error loading</div>;
  }

  return (
    <main>
      <h1>Directory</h1>

      {data?.length ? (
        <ul>
          {data.map((item) => (
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
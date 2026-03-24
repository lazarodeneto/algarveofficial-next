# 🏆 SSR Best Practices for Next.js 16 + Turbopack

## Core Principles

### 1. ✅ DO: Create State Per-Render (for SSR apps)
```tsx
// ✅ CORRECT
export function Component() {
  const queryClient = useMemo(() => new QueryClient(), []);
  // Each render gets fresh instance
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}
```

### 2. ❌ DON'T: Create Singletons at Module Scope
```tsx
// ❌ WRONG - will pollute cache across requests
const queryClient = new QueryClient();

export function Component() {
  return <QueryClientProvider client={queryClient}>...</QueryClientProvider>;
}
```

### 3. ✅ DO: Defer Client Hooks to useEffect/useState
```tsx
// ✅ CORRECT
export function Component() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;  // Server renders null, client renders content
  return <div>{pathname}</div>;
}
```

### 4. ❌ DON'T: Use Client Hooks Directly in Server Tree
```tsx
// ❌ WRONG - usePathname() doesn't exist on server
export function Component() {
  const pathname = usePathname();  // undefined on server
  return <div>{pathname}</div>;    // Server/client mismatch
}
```

---

## Pattern: Safe SSR Architecture

### Root Layout (Server)
```tsx
// app/layout.tsx
export default async function RootLayout({ children }: RootLayoutProps) {
  const data = await fetchData(); // OK - server-side data fetch

  return (
    <html>
      <body>
        <AppProviders>  {/* Client boundary here */}
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

### AppProviders (Client)
```tsx
// components/providers/AppProviders.tsx
"use client";

export function AppProviders({ children }: Props) {
  // ✅ Create fresh instance per render
  const queryClient = useMemo(() => new QueryClient(), []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### Layout with Client State (Client)
```tsx
// components/layout/PublicSiteFrame.tsx
"use client";

export function PublicSiteFrame({ children }: Props) {
  const [mounted, setMounted] = useState(false);

  // ✅ Defer client-only logic to useEffect
  useEffect(() => setMounted(true), []);

  // ✅ Server renders minimal HTML (just children)
  if (!mounted) return <>{children}</>;

  // ✅ Client renders enhanced version
  return <div className="with-sidebar">{children}</div>;
}
```

### Page (Server)
```tsx
// app/[locale]/directory/page.tsx
export const revalidate = 3600;  // ISR: revalidate every hour

export default async function DirectoryPage() {
  // ✅ Server-side data fetching
  const data = await fetchFromSupabase();

  // ✅ Server renders content immediately
  return (
    <main>
      <h1>Directory</h1>
      {data.map(item => <div key={item.id}>{item.name}</div>)}
    </main>
  );
}
```

---

## Testing Checklist

- [ ] `npm run build` completes without errors
- [ ] `curl http://localhost:3000/page` includes page content (not empty)
- [ ] Browser DevTools console has no hydration warnings
- [ ] Page renders with & without JavaScript (test in browser + curl)
- [ ] Development mode works
- [ ] Production mode works
- [ ] Multiple concurrent requests don't pollute each other's cache
- [ ] Redirects work correctly

---

## Common Pitfalls & Solutions

### Pitfall 1: Module-Scoped Singletons
```tsx
// ❌ BAD
const store = new Store();
const db = new Database();

export function Component() {
  return <StoreProvider store={store}>...</StoreProvider>;
}
```

**Why It's Bad:** Singleton persists across requests, causing cache pollution
**Solution:** Create instances inside component using useMemo()

---

### Pitfall 2: Client Hooks Without Mounting Check
```tsx
// ❌ BAD
export function Nav() {
  const pathname = usePathname();  // undefined on server
  return <div className={pathname === "/admin" ? "hidden" : ""}>...</div>;
}
```

**Why It's Bad:** Server/client mismatch on className
**Solution:** Add mounted state and useEffect

```tsx
// ✅ GOOD
export function Nav() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div>...</div>;  // Server default
  return <div className={pathname === "/admin" ? "hidden" : ""}>...</div>;
}
```

---

### Pitfall 3: Async Operations Blocking Render
```tsx
// ❌ BAD
export function Component() {
  const [data, setData] = useState(null);

  useEffect(async () => {
    const result = await fetchData();  // Could throw!
    setData(result);
  }, []);

  return <div>{data.name}</div>;  // Crashes if fetch fails
}
```

**Why It's Bad:** If fetchData() throws, component crashes
**Solution:** Add error handling

```tsx
// ✅ GOOD
export function Component() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchData();
        setData(result);
      } catch (e) {
        setError(e);
        // Component still renders, just with error state
      }
    };
    load();
  }, []);

  if (error) return <div>Error loading</div>;
  if (!data) return <div>Loading...</div>;
  return <div>{data.name}</div>;
}
```

---

### Pitfall 4: Nested Client Boundaries
```tsx
// ❌ BAD - creates performance issues
"use client";
export function Outer() {
  return (
    "use client";
    <Inner />
  );
}

export function Inner() {
  const [state, setState] = useState();
  return <div>{state}</div>;
}
```

**Why It's Bad:** Unnecessary client boundaries, slower hydration
**Solution:** Only mark necessary components as "use client"

```tsx
// ✅ GOOD
"use client";
export function Outer() {
  const [state, setState] = useState();
  return <Inner state={state} setState={setState} />;
}

export function Inner({ state, setState }) {
  return <div>{state}</div>;
}
```

---

### Pitfall 5: External Data in Component Body
```tsx
// ❌ BAD
let cache = {};
export function Component({ id }) {
  if (cache[id]) return <div>{cache[id]}</div>;
  // ...
}
```

**Why It's Bad:** Cache persists across requests, causes pollution
**Solution:** Use proper caching at fetch layer, not component

```tsx
// ✅ GOOD
// Use Next.js built-in fetch caching
const response = await fetch(url, {
  next: { revalidate: 3600 }  // ISR
});
```

---

## Performance Optimization

### 1. ISR (Incremental Static Regeneration)
```tsx
// Revalidate every hour
export const revalidate = 3600;

// Or conditional revalidation
export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 3600;
```

### 2. Cache Control Headers
```tsx
import { headers } from 'next/headers';

export default async function Page() {
  const h = await headers();

  // Browser cache: 1 hour, CDN cache: 24 hours
  h.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');

  return <div>Page</div>;
}
```

### 3. Avoid Double Fetching
```tsx
// ❌ BAD - fetches twice
export default async function Page() {
  const data = await fetchData();  // Server fetch

  return (
    <div>
      <Content data={data} />  {/* Client might refetch */}
    </div>
  );
}

function Content({ data }) {
  useEffect(() => {
    // ❌ Don't refetch - use server data!
    fetchData().then(setData);
  }, []);
}
```

```tsx
// ✅ GOOD - fetch once
export default async function Page() {
  const data = await fetchData();  // Server fetch

  return (
    <div>
      <Content data={data} />  {/* Pass server data */}
    </div>
  );
}

function Content({ data }) {
  // ✅ Use passed prop, no refetch needed
  return <div>{data.name}</div>;
}
```

---

## Monitoring & Debugging

### Check for SSR Issues
```bash
# Does HTML contain page content?
curl https://yoursite.com/page | grep "content"

# Any hydration errors?
npm run dev  # Check console for "Text content did not match"
```

### Check for Cache Issues
```bash
# Are requests getting stale data?
# Test with multiple requests:
for i in {1..5}; do
  curl -s https://yoursite.com/page | grep "timestamp"
done
# Should show different timestamps if dynamic, same if static
```

### Check Build Output
```bash
npm run build

# Look for route markers:
# ○ = Static (prerendered)
# ƒ = Dynamic (server-rendered)
# Directory page should be: ƒ /[locale]/directory
```

---

## Migration Checklist

If migrating existing pages to SSR-safe:

- [ ] Review all "use client" components
- [ ] Check for module-scoped singletons
- [ ] Check for client hooks without mounting checks
- [ ] Check for unhandled async errors
- [ ] Test with `curl` to verify SSR
- [ ] Check browser console for hydration errors
- [ ] Monitor Core Web Vitals (should improve)
- [ ] Test with multiple concurrent requests
- [ ] Verify ISR works (pages update on schedule)

---

## Quick Diagnosis: "Is My Page SSR Working?"

Run this command:
```bash
curl -s https://yoursite.com/page | wc -l

# If < 100 lines: Probably not SSR (mostly client rendering)
# If > 1000 lines: Probably SSR (lots of server content)
```

Check for key content:
```bash
curl -s https://yoursite.com/page | grep -E "<h1|<title|<meta.*og:"

# If empty: SSR not working
# If filled: SSR working
```

---

## Resources

- [Next.js Rendering Documentation](https://nextjs.org/docs/app/building-your-application/rendering)
- [React Server Components](https://react.dev/reference/react/use-client)
- [ISR Documentation](https://nextjs.org/docs/app/building-your-application/data-fetching/incremental-static-regeneration)
- [Hydration Debugging](https://nextjs.org/docs/messages/react-hydration-error)

---

**Last Updated:** March 24, 2026
**Framework:** Next.js 16 + Turbopack + React 19

import{a}from"./query-vendor-B8a1lXFD.js";import{a as r,s}from"./index-BQI6dTkf.js";function d(){const{user:e}=r();return a({queryKey:["owner-listings",e==null?void 0:e.id],queryFn:async()=>{if(!(e!=null&&e.id))throw new Error("Not authenticated");const{data:t,error:i}=await s.from("listings").select(`
          *,
          city:cities(id, name, slug),
          category:categories(id, name, slug),
          region:regions(id, name, slug),
          images:listing_images(id, image_url, alt_text, is_featured, display_order)
        `).eq("owner_id",e.id).order("created_at",{ascending:!1});if(i)throw i;return t||[]},enabled:!!(e!=null&&e.id)})}export{d as u};

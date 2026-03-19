import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "../listings/TagInput";
import type { ListingFormData } from "@/types/listing";
import type { City, PremiumRegion, Category } from "@/types/admin";

interface BasicsStepProps {
  data: ListingFormData;
  onChange: (field: keyof ListingFormData, value: unknown) => void;
  cities: City[];
  regions: PremiumRegion[];
  categories: Category[];
  errors: Record<string, string>;
  isAdmin?: boolean;
}

export function BasicsStep({
  data,
  onChange,
  cities,
  regions,
  categories,
  errors,
  isAdmin = false,
}: BasicsStepProps) {
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    onChange("name", name);
    if (!data.slug || data.slug === generateSlug(data.name)) {
      onChange("slug", generateSlug(name));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-medium font-serif">Basic Information</h3>
        <p className="text-sm text-muted-foreground">
          Enter the essential details for this listing
        </p>
      </div>

      <div className="grid gap-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={data.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g., Villa Azure Ocean"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">
            URL Slug <span className="text-destructive">*</span>
            {!isAdmin && (
              <span className="text-xs text-muted-foreground ml-2">
                (auto-generated)
              </span>
            )}
          </Label>
          <Input
            id="slug"
            value={data.slug}
            onChange={(e) => onChange("slug", generateSlug(e.target.value))}
            placeholder="villa-azure-ocean"
            disabled={!isAdmin}
            className={errors.slug ? "border-destructive" : ""}
          />
          {errors.slug && (
            <p className="text-xs text-destructive">{errors.slug}</p>
          )}
          <p className="text-xs text-muted-foreground">
            algarveofficial.com/listings/{data.slug || "your-slug"}
          </p>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="short_description">
            Short Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="short_description"
            value={data.short_description}
            onChange={(e) => onChange("short_description", e.target.value)}
            placeholder="A brief, compelling summary (2-3 sentences)"
            className={`min-h-[80px] ${errors.short_description ? "border-destructive" : ""}`}
            maxLength={300}
          />
          <div className="flex justify-between">
            {errors.short_description ? (
              <p className="text-xs text-destructive">{errors.short_description}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-muted-foreground">
              {data.short_description?.length || 0}/300
            </span>
          </div>
        </div>

        {/* Full Description */}
        <div className="space-y-2">
          <Label htmlFor="full_description">Full Description</Label>
          <Textarea
            id="full_description"
            value={data.full_description || ""}
            onChange={(e) => onChange("full_description", e.target.value)}
            placeholder={"Detailed description of the listing...\n\nUse a blank line or // to start a new paragraph.\nUse **double asterisks** for bold text."}
            className="min-h-[150px]"
          />
          <p className="text-xs text-muted-foreground">
            Formatting: blank lines or <code>{"//"}</code> create new paragraphs, and <code>**bold text**</code> is rendered in bold.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.category_id}
              onValueChange={(value) => onChange("category_id", value)}
            >
              <SelectTrigger className={errors.category_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {[...categories].sort((a, b) => a.name.localeCompare(b.name)).map((category) => (
                  <SelectItem 
                    key={category.id} 
                    value={category.id}
                    className={'is_active' in category && !category.is_active ? 'text-muted-foreground' : ''}
                  >
                    {category.name}
                    {'is_active' in category && !category.is_active && (
                      <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p className="text-xs text-destructive">{errors.category_id}</p>
            )}
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">
              City <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.city_id}
              onValueChange={(value) => onChange("city_id", value)}
            >
              <SelectTrigger className={errors.city_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select city..." />
              </SelectTrigger>
              <SelectContent>
                {[...cities].sort((a, b) => a.name.localeCompare(b.name)).map((city) => (
                  <SelectItem 
                    key={city.id} 
                    value={city.id}
                    className={!city.is_active ? 'text-muted-foreground' : ''}
                  >
                    {city.name}
                    {city.municipality && (
                      <span className="text-muted-foreground ml-2">
                        ({city.municipality})
                      </span>
                    )}
                    {!city.is_active && (
                      <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.city_id && (
              <p className="text-xs text-destructive">{errors.city_id}</p>
            )}
          </div>
        </div>

        {/* Premium Region */}
        <div className="space-y-2">
          <Label htmlFor="region">Premium Region</Label>
          <Select
            value={data.luxury_region_id || "none"}
            onValueChange={(value) =>
              onChange("luxury_region_id", value === "none" ? undefined : value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select region (optional)..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No region</SelectItem>
              {[...regions].sort((a, b) => a.name.localeCompare(b.name)).map((region) => {
                const isInactive = region.is_active === false;
                return (
                  <SelectItem
                    key={region.id}
                    value={region.id}
                    className={isInactive ? "text-muted-foreground" : ""}
                  >
                    {region.name}
                    {isInactive && (
                      <span className="ml-2 text-xs text-muted-foreground">(inactive)</span>
                    )}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Recommended for premium navigation and VIP area visibility
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <TagInput
            value={data.tags || []}
            onChange={(tags) => onChange("tags", tags)}
            placeholder="Add tags for better searchability..."
          />
        </div>
      </div>
    </div>
  );
}

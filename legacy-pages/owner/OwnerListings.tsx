import { useState } from "react";
import Link from "next/link";
import { m } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Eye,
  MoreHorizontal,
  Search,
  Filter,
  Plus,
  ExternalLink,
  Loader2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TierBadgeOwner } from "@/components/owner/TierBadgeOwner";
import { StatusBadgeOwner } from "@/components/owner/StatusBadgeOwner";
import { ClaimStatusBadgeOwner } from "@/components/owner/ClaimStatusBadgeOwner";
import { OwnerTierUpgradeActions } from "@/components/owner/OwnerTierUpgradeActions";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { useLocalePath } from "@/hooks/useLocalePath";
import { useOwnerListings } from "@/hooks/useOwnerListings";
import {
  getBusinessClaimTierLabel,
  getOwnerDisplayTier,
  normalizeBusinessClaimTier,
  type BusinessClaimTier,
} from "@/lib/listings/claim-tier";

function readName(value: unknown): string | null {
  if (value && typeof value === "object" && "name" in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === "string" ? name : null;
  }
  return null;
}

function getClaimSelectedTier(listing: unknown): BusinessClaimTier | null {
  if (!listing || typeof listing !== "object" || !("latest_claim" in listing)) {
    return null;
  }

  const latestClaim = (listing as { latest_claim?: { selected_tier?: unknown } | null }).latest_claim;
  return normalizeBusinessClaimTier(latestClaim?.selected_tier);
}

export default function OwnerListings() {
  const { t } = useTranslation();
  const l = useLocalePath();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { data: listings = [], isLoading } = useOwnerListings();
  
  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (listing.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || listing.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 justify-between"
      >
        <div>
          <h1 className="text-2xl font-serif font-medium text-foreground">{t('owner.listings.title')}</h1>
          <p className="text-muted-foreground">
            {t('owner.listings.subtitle')}
          </p>
        </div>
      </m.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('owner.listings.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder={t('owner.listings.filterByStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('owner.listings.allStatuses')}</SelectItem>
            <SelectItem value="published">{t('owner.listings.published')}</SelectItem>
            <SelectItem value="pending_review">{t('owner.listings.underReview')}</SelectItem>
            <SelectItem value="draft">{t('owner.listings.draft')}</SelectItem>
            <SelectItem value="rejected">{t('owner.listings.needsChanges')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Listings Grid */}
      <div className="grid gap-4">
        {filteredListings.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">{t('owner.listings.noListings')}</p>
              <Button asChild>
                <Link href={l("/owner/support")}>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('owner.listings.requestNewListing')}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredListings.map((listing, index) => {
            const selectedTier = getClaimSelectedTier(listing);
            const displayTier = getOwnerDisplayTier(listing.tier, selectedTier);

            return (
              <m.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-card border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      {listing.featured_image_url ? (
                        <ImageWithFallback
                          src={listing.featured_image_url}
                          alt={listing.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">{t('owner.listings.noImage')}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                        <div className="space-y-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-medium text-foreground min-w-0 line-clamp-2 sm:line-clamp-1 break-words">{listing.name}</h3>
                            <TierBadgeOwner tier={displayTier} size="sm" />
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadgeOwner status={listing.status} size="sm" />
                            <ClaimStatusBadgeOwner status={listing.claim_status} size="sm" />
                            {listing.is_curated && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                                {t('owner.listings.curatedExcellence')}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2 self-end sm:self-auto lg:shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={l(`/owner/listings/${listing.id}`)}>
                              <Settings className="h-4 w-4 sm:mr-2" />
                              <span className="hidden sm:inline">{t('owner.listings.manage', { defaultValue: 'Manage' })}</span>
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={l(`/listing/${listing.slug}`)} className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  {t('owner.listings.preview')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={l(`/listing/${listing.slug}`)} target="_blank" className="flex items-center gap-2">
                                  <ExternalLink className="h-4 w-4" />
                                  {t('owner.listings.viewPublicPage')}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={l(`/owner/listings/${listing.id}/edit`)} className="flex items-center gap-2">
                                  <Settings className="h-4 w-4" />
                                  {t('common.edit', { defaultValue: 'Edit' })}
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {listing.short_description || listing.description || t('owner.listings.noDescription')}
                      </p>
                      
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                        <span>{readName(listing.city) || readName((listing as any).cities) || t('owner.listings.unknownCity')}</span>
                        <span>•</span>
                        <span>{readName(listing.category) || readName((listing as any).categories) || t('owner.listings.unknownCategory')}</span>
                        <span>•</span>
                        <span>{t('owner.listings.updated')} {new Date(listing.updated_at).toLocaleDateString()}</span>
                        {selectedTier && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              {t('owner.listings.selectedTier', { defaultValue: 'Selected tier' })}
                              <span>{getBusinessClaimTierLabel(selectedTier)}</span>
                            </span>
                          </>
                        )}
                      </div>

                      {listing.claim_status === "claimed" ? (
                        <OwnerTierUpgradeActions
                          listingId={listing.id}
                          currentTier={displayTier}
                          className="mt-4 rounded-lg border border-dashed border-primary/25 bg-primary/5 p-3"
                        />
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </m.div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            <strong>{t('owner.listings.noteLabel')}</strong> {t('owner.listings.noteText')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

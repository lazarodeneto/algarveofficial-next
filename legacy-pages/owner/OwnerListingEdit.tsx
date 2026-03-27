import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  Phone,
  Mail,
  Globe,
  MapPin,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { TierBadgeOwner } from "@/components/owner/TierBadgeOwner";
import { StatusBadgeOwner } from "@/components/owner/StatusBadgeOwner";
import { OwnerListingImageManager } from "@/components/owner/OwnerListingImageManager";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { extractIdParam } from "@/lib/routeParams";
import { useLocalePath } from "@/hooks/useLocalePath";

export default function OwnerListingEdit() {
  const params = useParams<Record<string, string | string[] | undefined>>();
  const id = extractIdParam(params);
  const router = useRouter();
  const l = useLocalePath();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Fetch listing from Supabase
  const { data: listing, isLoading } = useQuery({
    queryKey: ['owner-listing', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          cities:city_id(id, name),
          categories:category_id(id, name),
          regions:region_id(id, name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    contact_phone: '',
    contact_email: '',
    website_url: '',
    instagram_url: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
  });

  // Load listing data into form
  useEffect(() => {
    if (listing) {
      setFormData({
        name: listing.name || '',
        description: listing.description || '',
        short_description: listing.short_description || '',
        contact_phone: listing.contact_phone || '',
        contact_email: listing.contact_email || '',
        website_url: listing.website_url || '',
        instagram_url: listing.instagram_url || '',
        facebook_url: listing.facebook_url || '',
        twitter_url: listing.twitter_url || '',
        youtube_url: listing.youtube_url || '',
      });
    }
  }, [listing]);

  // Save draft mutation
  const saveDraft = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('listings')
        .update({
          name: formData.name,
          description: formData.description,
          short_description: formData.short_description,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          website_url: formData.website_url || null,
          instagram_url: formData.instagram_url || null,
          facebook_url: formData.facebook_url || null,
          twitter_url: formData.twitter_url || null,
          youtube_url: formData.youtube_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('owner_id', user?.id); // Ensure owner can only update their own
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      toast.success("Changes saved as draft");
    },
    onError: (error) => {
      toast.error("Failed to save: " + (error as Error).message);
    },
  });

  // Submit for review mutation
  const submitForReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('listings')
        .update({
          name: formData.name,
          description: formData.description,
          short_description: formData.short_description,
          contact_phone: formData.contact_phone || null,
          contact_email: formData.contact_email || null,
          website_url: formData.website_url || null,
          instagram_url: formData.instagram_url || null,
          facebook_url: formData.facebook_url || null,
          twitter_url: formData.twitter_url || null,
          youtube_url: formData.youtube_url || null,
          status: 'pending_review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('owner_id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-listing', id] });
      queryClient.invalidateQueries({ queryKey: ['owner-listings'] });
      toast.success("Listing submitted for review");
    },
    onError: (error) => {
      toast.error("Failed to submit: " + (error as Error).message);
    },
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSaving = saveDraft.isPending;
  const isSubmitting = submitForReview.isPending;
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground mb-4">Listing not found</p>
        <Button onClick={() => router.push(l('/owner/listings'))}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
      </div>
    );
  }
  
  const city = listing.cities as any;
  const category = listing.categories as any;
  const region = listing.regions as any;

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4"
      >
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(l('/owner/listings'))}
          className="w-fit"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>
        
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-semibold text-foreground">
              Edit Listing
            </h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <TierBadgeOwner tier={listing.tier} size="sm" />
              <StatusBadgeOwner status={listing.status} size="sm" />
              {listing.is_curated && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  Signature Selection
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={`/listing/${listing.slug}`} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </a>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Read-only Info */}
      <Card className="bg-muted/30 border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{city?.name || 'Unknown'}</span>
            </div>
            <Separator orientation="vertical" className="h-5" />
            <div>
              <span className="text-muted-foreground">Category:</span>{' '}
              <span className="font-medium">{category?.name || 'Unknown'}</span>
            </div>
            {region && (
              <>
                <Separator orientation="vertical" className="h-5" />
                <div>
                  <span className="text-muted-foreground">Region:</span>{' '}
                  <span className="font-medium">{region.name}</span>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            To change location or category, please contact support.
          </p>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Update your listing's name and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Listing Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="Enter listing name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            <Input
              id="short_description"
              value={formData.short_description}
              onChange={(e) => updateField('short_description', e.target.value)}
              placeholder="Brief tagline for your listing"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Full Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your business..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Write a compelling description that highlights what makes your business special.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How customers can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <Input
                id="phone"
                value={formData.contact_phone}
                onChange={(e) => updateField('contact_phone', e.target.value)}
                placeholder="+351 xxx xxx xxx"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Website
            </Label>
            <Input
              id="website"
              value={formData.website_url}
              onChange={(e) => updateField('website_url', e.target.value)}
              placeholder="https://www.example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Social Media</CardTitle>
          <CardDescription>Connect your social profiles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram_url}
                onChange={(e) => updateField('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={formData.facebook_url}
                onChange={(e) => updateField('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={formData.twitter_url}
                onChange={(e) => updateField('twitter_url', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.youtube_url}
                onChange={(e) => updateField('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photos */}
      {id && <OwnerListingImageManager listingId={id} />}

      {/* Tier & Curated Info (Read-only) */}
      <Card className="bg-amber-500/5 border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Membership Status
            <TierBadgeOwner tier={listing.tier} size="sm" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your current membership tier determines your visibility and available features.
            {listing.tier !== 'signature' && (
              <> Upgrade to increase your reach and unlock premium benefits.</>
            )}
          </p>
          
          {listing.tier === 'signature' && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm">
                <strong className="text-amber-400">Signature Selection Eligibility:</strong>{' '}
                {listing.is_curated ? (
                  <span className="text-primary">Your listing is featured in the VIP section!</span>
                ) : (
                  <span className="text-muted-foreground">
                    As a Signature member, your listing is eligible for editorial selection.
                  </span>
                )}
              </p>
            </div>
          )}
          
          <Button variant="outline" asChild>
            <a href={l("/owner/membership")}>View Membership Options</a>
          </Button>
        </CardContent>
      </Card>

      {/* Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border p-4 z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => saveDraft.mutate()}
            disabled={isSaving || isSubmitting}
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Draft
          </Button>
          
          {listing.status !== 'pending_review' && (
            <Button
              onClick={() => submitForReview.mutate()}
              disabled={isSaving || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Submit for Review
            </Button>
          )}
          
          {listing.status === 'pending_review' && (
            <Button disabled className="bg-yellow-500/20 text-yellow-400">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Under Review
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

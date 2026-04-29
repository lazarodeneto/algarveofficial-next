export interface HomeQuickLinkCardDefinition {
  id: "stay" | "see-do" | "events" | "real-estate";
  title: string;
  translationKey: string;
  imageSettingKey: string;
  videoSettingKey: string;
  categorySlug: string;
  fallbackImageUrl: string;
  imagePosition?: string;
  customHref?: string;
}

export const HOME_QUICK_LINKS_CATEGORY = "homepage";

export const HOME_QUICK_LINK_CARDS: HomeQuickLinkCardDefinition[] = [
  {
    id: "see-do",
    title: "Experiences",
    translationKey: "categoryNames.things-to-do",
    imageSettingKey: "home_card_see_do_image",
    videoSettingKey: "home_card_see_do_video",
    categorySlug: "things-to-do",
    fallbackImageUrl: "/home-quick-links/things-to-do.svg",
    imagePosition: "center",
    customHref: "/directory?category=things-to-do",
  },
  {
    id: "stay",
    title: "Stay",
    translationKey: "categoryNames.places-to-stay",
    imageSettingKey: "home_card_stay_image",
    videoSettingKey: "home_card_stay_video",
    categorySlug: "places-to-stay",
    fallbackImageUrl: "/home-quick-links/places-to-stay.svg",
    imagePosition: "center",
    customHref: "/directory?category=places-to-stay",
  },
  {
    id: "events",
    title: "Events",
    translationKey: "nav.events",
    imageSettingKey: "home_card_events_image",
    videoSettingKey: "home_card_events_video",
    categorySlug: "events",
    fallbackImageUrl: "/home-quick-links/whats-on.svg",
    imagePosition: "center",
    customHref: "/events",
  },
  {
    id: "real-estate",
    title: "Real Estate",
    translationKey: "categoryNames.real-estate",
    imageSettingKey: "home_card_real_estate_image",
    videoSettingKey: "home_card_real_estate_video",
    categorySlug: "real-estate",
    fallbackImageUrl: "/home-quick-links/places-to-stay.svg",
    imagePosition: "center",
    customHref: "/directory?category=real-estate",
  },
];

export const HOME_QUICK_LINK_SETTING_KEYS = HOME_QUICK_LINK_CARDS.flatMap((card) => [
  card.imageSettingKey,
  card.videoSettingKey,
]);

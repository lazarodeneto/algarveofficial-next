export interface HomeQuickLinkCardDefinition {
  id: "stay" | "eat-drink" | "see-do" | "golf" | "real-estate" | "events";
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
    id: "stay",
    title: "Stay",
    translationKey: "sections.homepage.quickLinks.items.stay.title",
    imageSettingKey: "home_card_stay_image",
    videoSettingKey: "home_card_stay_video",
    categorySlug: "places-to-stay",
    fallbackImageUrl: "/home-quick-links/places-to-stay.svg",
    imagePosition: "center",
    customHref: "/directory?category=places-to-stay",
  },
  {
    id: "eat-drink",
    title: "Eat & Drink",
    translationKey: "sections.homepage.quickLinks.items.eatDrink.title",
    imageSettingKey: "home_card_eat_drink_image",
    videoSettingKey: "home_card_eat_drink_video",
    categorySlug: "restaurants",
    fallbackImageUrl: "/home-quick-links/things-to-do.svg",
    imagePosition: "center",
    customHref: "/directory?category=restaurants",
  },
  {
    id: "see-do",
    title: "Things to Do",
    translationKey: "sections.homepage.quickLinks.items.thingsToDo.title",
    imageSettingKey: "home_card_see_do_image",
    videoSettingKey: "home_card_see_do_video",
    categorySlug: "things-to-do",
    fallbackImageUrl: "/home-quick-links/things-to-do.svg",
    imagePosition: "center",
    customHref: "/directory?category=things-to-do",
  },
  {
    id: "golf",
    title: "Golf",
    translationKey: "sections.homepage.quickLinks.items.golf.title",
    imageSettingKey: "home_card_golf_image",
    videoSettingKey: "home_card_golf_video",
    categorySlug: "golf",
    fallbackImageUrl: "/home-quick-links/things-to-do.svg",
    imagePosition: "center",
    customHref: "/golf",
  },
  {
    id: "real-estate",
    title: "Real Estate",
    translationKey: "sections.homepage.quickLinks.items.realEstate.title",
    imageSettingKey: "home_card_real_estate_image",
    videoSettingKey: "home_card_real_estate_video",
    categorySlug: "real-estate",
    fallbackImageUrl: "/home-quick-links/places-to-stay.svg",
    imagePosition: "center",
    customHref: "/directory?category=real-estate",
  },
  {
    id: "events",
    title: "Events",
    translationKey: "sections.homepage.quickLinks.items.events.title",
    imageSettingKey: "home_card_events_image",
    videoSettingKey: "home_card_events_video",
    categorySlug: "events",
    fallbackImageUrl: "/home-quick-links/whats-on.svg",
    imagePosition: "center",
    customHref: "/events",
  },
];

export const HOME_QUICK_LINK_SETTING_KEYS = HOME_QUICK_LINK_CARDS.flatMap((card) => [
  card.imageSettingKey,
  card.videoSettingKey,
]);

export interface HomeQuickLinkCardDefinition {
  id: "stay" | "see-do" | "whats-on";
  title: string;
  translationKey: string;
  imageSettingKey: string;
  videoSettingKey: string;
  categorySlug: string;
  fallbackImageUrl: string;
  imagePosition?: string;
}

export const HOME_QUICK_LINKS_CATEGORY = "homepage";

export const HOME_QUICK_LINK_CARDS: HomeQuickLinkCardDefinition[] = [
  {
    id: "see-do",
    title: "Things to Do",
    translationKey: "categoryNames.things-to-do",
    imageSettingKey: "home_card_see_do_image",
    videoSettingKey: "home_card_see_do_video",
    categorySlug: "things-to-do",
    fallbackImageUrl: "/home-quick-links/things-to-do.svg",
    imagePosition: "center",
  },
  {
    id: "stay",
    title: "Places to Stay",
    translationKey: "categoryNames.places-to-stay",
    imageSettingKey: "home_card_stay_image",
    videoSettingKey: "home_card_stay_video",
    categorySlug: "places-to-stay",
    fallbackImageUrl: "/home-quick-links/places-to-stay.svg",
    imagePosition: "center",
  },
  {
    id: "whats-on",
    title: "What's On",
    translationKey: "categoryNames.whats-on",
    imageSettingKey: "home_card_whats_on_image",
    videoSettingKey: "home_card_whats_on_video",
    categorySlug: "whats-on",
    fallbackImageUrl: "/home-quick-links/whats-on.svg",
    imagePosition: "center",
  },
];

export const HOME_QUICK_LINK_SETTING_KEYS = HOME_QUICK_LINK_CARDS.flatMap((card) => [
  card.imageSettingKey,
  card.videoSettingKey,
]);

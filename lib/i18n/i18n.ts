"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const en = {
    common: {
        signature: "Signature",
        verified: "Verified",
    },
    directory: {
        loading: "Loading directory...",
    },
    sections: {
        regions: {
            label: "Algarve Regions",
            title: "Discover Premium Destinations",
            subtitle: "From iconic marinas to dramatic coastlines, explore the Algarve's most sought-after areas.",
            listings: "listings",
            explore: "Explore",
            viewAll: "View all regions",
        },
        categories: {
            label: "Categories",
            title: "Explore by Category",
            subtitle: "Find the best experiences, services, and places to stay in one premium directory.",
            listings: "listings",
        },
        cities: {
            label: "Cities",
            title: "Featured Cities",
            subtitle: "Browse Algarve cities and uncover local highlights.",
            noFeatured: "No featured cities available right now.",
            adminNote: "Add featured cities in admin to show them here.",
            viewAll: "View all listings",
        },
        curated: {
            badge: "Curated Excellence",
            title: "Handpicked Signature Experiences",
            subtitle: "A rotating selection of our most distinctive places across the Algarve.",
            viewDetails: "View details",
        },
        listings: {
            title: "Premium Listings",
            titleHighlight: "in the Algarve",
            subtitle: "Explore {{count}} handpicked listings.",
            allCategories: "All categories",
            allCities: "All cities",
            allRegions: "All regions",
            clearFilters: "Clear filters",
            showing: "Showing {{visible}} of {{total}} listings",
            loadingMore: "Loading more listings...",
            allLoaded: "All {{count}} listings loaded",
            noResults: "No listings found for the selected filters.",
            clearAll: "Clear all filters",
        },
        vip: {
            title: "Signature",
            subtitle: "Our most exclusive listings",
            discovery: {
                filters: {
                    hotels: "Hotels",
                    restaurants: "Restaurants",
                    experiences: "Experiences",
                    "real-estate": "Real estate",
                },
            },
        },
    },
};

if (!i18n.isInitialized) {
    i18n.use(initReactI18next).init({
        lng: "en",
        fallbackLng: "en",
        resources: {
            en: { translation: en },
        },
        defaultNS: "translation",
        ns: ["translation"],
        interpolation: {
            escapeValue: false,
        },
    });
}

export default i18n;

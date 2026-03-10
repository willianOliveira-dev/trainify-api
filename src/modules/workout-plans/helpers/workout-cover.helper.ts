import { env } from "@/config/env";

const COVER_IMAGES: Record<string, string[]> = {
    arms: ['arms-1.png', 'arms-2.png', 'arms-3.png', 'arms-4.png'],
    back: ['back-1.png', 'back-2.png', 'back-3.png'],
    cardio: ['cardio-1.png', 'cardio-2.png', 'cardio-3.png'],
    chest: ['chest-1.png', 'chest-2.png', 'chest-3.png', 'chest-4.png'],
    core: ['core-1.png', 'core-2.png', 'core-3.png'],
    fullbody: ['fullbody-1.png', 'fullbody-2.png'],
    glutes: ['glutes-1.png', 'glutes-2.png', 'glutes-3.png'],
    legs: ['legs-1.png', 'legs-2.png'],
    rest: ['rest.png'],
    shoulders: ['shoulders-1.png', 'shoulders-2.png', 'shoulders-3.png'],
};

const BASE_URL = `${env.baseUrl}/static/covers`;

export function resolveCoverImage(category: string): string {
    const normalized = category.toLowerCase().trim();
    const images = COVER_IMAGES[normalized] || COVER_IMAGES.rest;
    const random = images[Math.floor(Math.random() * images.length)];
    return random ? `${BASE_URL}/${random}` : `${BASE_URL}/rest.png`;
}

export const COVER_CATEGORIES = Object.keys(COVER_IMAGES);

import { describe, expect, it } from 'vitest';
import { MAP_STYLES, type MapStyle } from './map';

describe('map types', () => {
    it('defines all required map styles', () => {
        const expectedStyles: MapStyle[] = ['basic', 'osm', 'hybrid', 'bright'];
        expect(Object.keys(MAP_STYLES)).toEqual(expectedStyles);
    });

    it('provides valid MapTiler style URLs', () => {
        Object.entries(MAP_STYLES).forEach(([style, url]) => {
            expect(url).toMatch(/^https:\/\/api\.maptiler\.com\/maps\/[a-z-]+(?:-v\d+)?\/style\.json\?key=.+$/);
            
            switch (style) {
                case 'basic':
                    expect(url).toContain('/basic-v2/');
                    break;
                case 'osm':
                    expect(url).toContain('/openstreetmap/');
                    break;
                case 'hybrid':
                    expect(url).toContain('/hybrid/');
                    break;
                case 'bright':
                    expect(url).toContain('/bright-v2/');
                    break;
            }
        });
    });

    it('has unique style URLs for each map style', () => {
        const urls = Object.values(MAP_STYLES);
        const uniqueUrls = new Set(urls);
        expect(uniqueUrls.size).toBe(urls.length);
    });

    it('has valid version numbers for versioned styles', () => {
        Object.entries(MAP_STYLES).forEach(([style, url]) => {
            if (style === 'basic' || style === 'bright') {
                const version = url.match(/-v(\d+)/)?.[1];
                expect(version).toBeDefined();
                expect(Number(version)).toBeGreaterThan(0);
            }
        });
    });
});

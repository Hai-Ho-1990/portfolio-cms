// =====================================================
// CONTENTFUL REST API HELPER
// =====================================================
// Används av getServerData-funktioner för att hämta
// data direkt från Contentful REST API vid varje request,
// istället för enbart vid build-tid via Gatsby GraphQL.

declare const process: { env: Record<string, string | undefined> };

const CONTENTFUL_SPACE_ID = process.env.CONTENTFUL_SPACE_ID;
const CONTENTFUL_ACCESS_TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;
const CONTENTFUL_BASE_URL = `https://cdn.contentful.com/spaces/${CONTENTFUL_SPACE_ID}/environments/master`;

/**
 * Generisk fetch-hjälpare mot Contentful Content Delivery API
 * @param params - URLSearchParams som läggs till anropet
 * @returns Parsed JSON-respons från Contentful
 */
export async function fetchContentful(params: Record<string, string>) {
    const searchParams = new URLSearchParams({
        access_token: CONTENTFUL_ACCESS_TOKEN || '',
        ...params,
    });

    const url = `${CONTENTFUL_BASE_URL}/entries?${searchParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Contentful API error: ${response.status} ${response.statusText}`
        );
    }

    return response.json();
}

/**
 * Hämtar inkluderade assets från Contentful-responsens "includes"
 * Returnerar en map: assetId -> asset
 */
export function buildAssetMap(
    includes?: { Asset?: Array<{ sys: { id: string }; fields: any }> }
): Map<string, any> {
    const map = new Map<string, any>();
    if (includes?.Asset) {
        for (const asset of includes.Asset) {
            map.set(asset.sys.id, asset);
        }
    }
    return map;
}

/**
 * Hämtar inkluderade entries från Contentful-responsens "includes"
 * Returnerar en map: entryId -> entry
 */
export function buildEntryMap(
    includes?: { Entry?: Array<{ sys: { id: string; [key: string]: any }; fields: any }> }
): Map<string, any> {
    const map = new Map<string, any>();
    if (includes?.Entry) {
        for (const entry of includes.Entry) {
            map.set(entry.sys.id, entry);
        }
    }
    return map;
}

/**
 * Resolver en Contentful-länk (sys.type === "Link")
 * till det faktiska objektet från asset- eller entry-map
 */
export function resolveLink(
    link: any,
    assetMap: Map<string, any>,
    entryMap: Map<string, any>
): any {
    if (!link?.sys?.id) return null;
    if (link.sys.linkType === 'Asset') {
        return assetMap.get(link.sys.id) || null;
    }
    if (link.sys.linkType === 'Entry') {
        return entryMap.get(link.sys.id) || null;
    }
    return null;
}

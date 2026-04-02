// =====================================================
// SSR DATA FETCHERS
// =====================================================
// Delade funktioner för att hämta komponentdata
// från Contentful REST API i getServerData.

import { fetchContentful, buildAssetMap, buildEntryMap, resolveLink } from './contentful';

// Hjälpfunktion: returnerar URL i samma format som Contentful/Gatsby (//protocol-relative)
function assetUrl(url?: string): string | undefined {
    if (!url) return undefined;
    return url;
}

// Resolva SEO-data från en entry
function resolveSeo(entry: any, assetMap: Map<string, any>, entryMap: Map<string, any>) {
    const seoRef = entry.fields?.seo;
    const seoEntry = seoRef?.sys ? resolveLink(seoRef, assetMap, entryMap) : null;
    if (!seoEntry) return null;

    const ogImageRef = seoEntry.fields?.openGraphImage;
    const ogAsset = ogImageRef?.sys ? resolveLink(ogImageRef, assetMap, entryMap) : null;

    return {
        seoTitle: seoEntry.fields?.seoTitle,
        seoDescription: seoEntry.fields?.seoDescription
            ? { seoDescription: seoEntry.fields.seoDescription }
            : undefined,
        openGraphImage: ogAsset?.fields?.file
            ? { file: { url: ogAsset.fields.file.url } }
            : undefined,
    };
}

// -------------------------------------------------
// NAVIGATION
// -------------------------------------------------
export async function fetchNavItems() {
    const result = await fetchContentful({
        content_type: 'navigation',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry?.fields?.items) return [];

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    return (entry.fields.items as any[]).map((ref: any) => {
        const item = ref?.sys ? resolveLink(ref, assetMap, entryMap) : ref;
        if (!item?.fields) return null;

        const pageRef = item.fields.page;
        const pageEntry = pageRef?.sys ? resolveLink(pageRef, assetMap, entryMap) : null;

        return {
            label: item.fields.label,
            newTab: item.fields.newTab || false,
            page: pageEntry?.fields ? { slug: pageEntry.fields.slug } : null,
            itemOrder: item.fields.itemOrder,
        };
    }).filter(Boolean);
}

// -------------------------------------------------
// HERO (inkl. techStack och SEO)
// -------------------------------------------------
export async function fetchHeroData() {
    const result = await fetchContentful({
        content_type: 'hero',
        include: '5',
    });

    const entry = result.items?.[0];
    if (!entry) return { heroData: null, techStackData: null, seo: null };

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    // SEO
    const seo = resolveSeo(entry, assetMap, entryMap);

    // Profile image
    const profileRef = entry.fields?.profileImage;
    const profileAsset = profileRef?.sys ? resolveLink(profileRef, assetMap, entryMap) : null;

    // CTA hover icon
    const ctaHoverRef = entry.fields?.ctaHover;
    const ctaHoverAsset = ctaHoverRef?.sys ? resolveLink(ctaHoverRef, assetMap, entryMap) : null;

    // Properties
    const propsRef = entry.fields?.properties;
    const propsEntry = propsRef?.sys ? resolveLink(propsRef, assetMap, entryMap) : null;

    // Rich text (raw JSON string)
    const welcomeRaw = entry.fields?.welcomeText;
    const welcomeText = welcomeRaw ? { raw: JSON.stringify(welcomeRaw) } : undefined;

    const heroData = {
        welcomeText,
        ctaText: entry.fields?.ctaText,
        profileImage: profileAsset?.fields?.file
            ? { url: assetUrl(profileAsset.fields.file.url) }
            : undefined,
        properties: propsEntry?.fields
            ? {
                  name: propsEntry.fields.name,
                  secondProperties: propsEntry.fields.secondProperties,
                  thirdProperties: propsEntry.fields.thirdProperties,
              }
            : undefined,
        ctaHover: ctaHoverAsset?.fields?.file
            ? { file: { url: assetUrl(ctaHoverAsset.fields.file.url) } }
            : undefined,
    };

    // Tech stack — entries of type "techStack" with an svg asset reference
    const techStackRefs = entry.fields?.techStack || [];
    const techStackData = (techStackRefs as any[]).map((ref: any) => {
        const techEntry = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
        if (!techEntry?.fields) return null;

        const svgRef = techEntry.fields.svg;
        const svgAsset = svgRef?.sys ? resolveLink(svgRef, assetMap, entryMap) : null;

        if (svgAsset?.fields?.file) {
            return { svg: { url: assetUrl(svgAsset.fields.file.url) } };
        }
        return null;
    }).filter(Boolean);

    return { heroData, techStackData, seo };
}

// -------------------------------------------------
// ABOUT SECTION (startsida)
// -------------------------------------------------
export async function fetchAboutSection() {
    const result = await fetchContentful({
        content_type: 'about',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return null;

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    // Thumbnail
    const thumbRef = entry.fields?.thumbnail;
    const thumbAsset = thumbRef?.sys ? resolveLink(thumbRef, assetMap, entryMap) : null;

    // Rich text description
    const descRaw = entry.fields?.description;
    const description = descRaw ? { raw: JSON.stringify(descRaw) } : undefined;

    // CTA references
    const ctaRefs = entry.fields?.ctaReference || [];
    const ctaReference = (ctaRefs as any[]).map((ref: any) => {
        const ctaEntry = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
        if (!ctaEntry?.fields) return null;
        const pageRef = ctaEntry.fields.page;
        const pageEntry = pageRef?.sys ? resolveLink(pageRef, assetMap, entryMap) : null;
        return { page: pageEntry?.fields ? { slug: pageEntry.fields.slug } : null };
    }).filter(Boolean);

    return {
        title: entry.fields?.title,
        thumbnail: thumbAsset?.fields?.file
            ? { url: assetUrl(thumbAsset.fields.file.url) }
            : undefined,
        description,
        ctaReference,
    };
}

// -------------------------------------------------
// WORKS (för WorkList)
// -------------------------------------------------
export async function fetchWorks() {
    const result = await fetchContentful({
        content_type: 'musicalWork',
        include: '5',
    });

    if (!result.items?.length) return [];

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    const works = result.items.map((entry: any) => {
        const fields = entry.fields;

        // Work images (array of asset links)
        const imgRefs = Array.isArray(fields?.workImage) ? fields.workImage : fields?.workImage ? [fields.workImage] : [];
        const workImage = imgRefs.map((ref: any) => {
            const asset = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
            return asset?.fields?.file ? { url: assetUrl(asset.fields.file.url) } : null;
        }).filter(Boolean);

        // Tech stack
        const techStack = (fields?.techStack || []).map((ref: any) => {
            const resolved = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
            if (!resolved?.fields) return null;

            const contentTypeId = resolved.sys?.contentType?.sys?.id;

            if (contentTypeId === 'techStack') {
                const svgAsset = resolved.fields.svg?.sys
                    ? resolveLink(resolved.fields.svg, assetMap, entryMap)
                    : null;
                return {
                    svg: svgAsset?.fields?.file
                        ? { url: assetUrl(svgAsset.fields.file.url) }
                        : undefined,
                };
            } else if (contentTypeId === 'externalLink') {
                const iconAsset = resolved.fields.icon?.sys
                    ? resolveLink(resolved.fields.icon, assetMap, entryMap)
                    : null;
                return {
                    title: resolved.fields.title,
                    url: resolved.fields.url,
                    icon: iconAsset?.fields?.file
                        ? { file: { url: assetUrl(iconAsset.fields.file.url) } }
                        : undefined,
                };
            } else if (contentTypeId === 'variantMedia') {
                const iconAsset = resolved.fields.icon?.sys
                    ? resolveLink(resolved.fields.icon, assetMap, entryMap)
                    : null;
                return {
                    icon: iconAsset?.fields?.file
                        ? { url: assetUrl(iconAsset.fields.file.url) }
                        : undefined,
                };
            }
            return null;
        }).filter(Boolean);

        // Rich text description
        const descRaw = fields?.description;
        const description = descRaw ? { raw: JSON.stringify(descRaw) } : undefined;

        return {
            slug: fields?.slug,
            title: fields?.title,
            description,
            techStack,
            workImage,
            projectOrder: fields?.projectOrder ?? 0,
        };
    });

    // Sort by projectOrder
    works.sort((a: any, b: any) => (a.projectOrder ?? 0) - (b.projectOrder ?? 0));

    return works;
}

// -------------------------------------------------
// REASON SECTION
// -------------------------------------------------
export async function fetchReasonSection() {
    const result = await fetchContentful({
        content_type: 'reasonSection',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return null;

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    // Reason ref
    const reasonRef = entry.fields?.reasonRef;
    const reasonEntry = reasonRef?.sys ? resolveLink(reasonRef, assetMap, entryMap) : null;

    return {
        title: entry.fields?.title,
        obs: entry.fields?.obs,
        reasonRef: reasonEntry?.fields
            ? {
                  title: reasonEntry.fields.title,
                  body: reasonEntry.fields.body
                      ? { body: reasonEntry.fields.body }
                      : undefined,
              }
            : undefined,
    };
}

// -------------------------------------------------
// FOOTER
// -------------------------------------------------
export async function fetchFooter() {
    const result = await fetchContentful({
        content_type: 'footer',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return null;

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    const fields = entry.fields;

    // External link
    const extRef = fields?.extarnalLink;
    const extEntry = extRef?.sys ? resolveLink(extRef, assetMap, entryMap) : null;

    return {
        buttonCtaText1: fields?.buttonCtaText1,
        buttonCtaText2: fields?.buttonCtaText2,
        buttonCtaText3: fields?.buttonCtaText3,
        ctaHover1: fields?.ctaHover1,
        ctaHover2: fields?.ctaHover2,
        externalLink: extEntry?.fields ? { url: extEntry.fields.url } : undefined,
        mainTitle: fields?.mainTitle,
        sideText: fields?.sideText,
        email: fields?.email,
    };
}

// -------------------------------------------------
// WORK INTRO
// -------------------------------------------------
export async function fetchWorkIntro() {
    const result = await fetchContentful({
        content_type: 'workIntro',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return null;

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    const contentRaw = entry.fields?.content;

    // Help icon
    const helpIconRef = entry.fields?.helpIcon;
    const helpIconAsset = helpIconRef?.sys ? resolveLink(helpIconRef, assetMap, entryMap) : null;

    return {
        title: entry.fields?.title,
        subTitle: entry.fields?.subTitle,
        helpText: entry.fields?.helpText,
        content: contentRaw ? { raw: JSON.stringify(contentRaw) } : undefined,
        helpIcon: helpIconAsset?.fields?.file
            ? { file: { url: assetUrl(helpIconAsset.fields.file.url) } }
            : undefined,
    };
}

// -------------------------------------------------
// BIOGRAPHY (about-sidan)
// -------------------------------------------------
export async function fetchBiography() {
    const result = await fetchContentful({
        content_type: 'aboutMe',
        include: '3',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return { biographyData: null, seo: null };

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    // SEO
    const seo = resolveSeo(entry, assetMap, entryMap);

    // Avatar
    const avatarRef = entry.fields?.avatar;
    const avatarAsset = avatarRef?.sys ? resolveLink(avatarRef, assetMap, entryMap) : null;

    const biographyData = {
        title: entry.fields?.title,
        name: entry.fields?.name,
        position: entry.fields?.position,
        biography: entry.fields?.biography
            ? { biography: entry.fields.biography }
            : undefined,
        avatar: avatarAsset?.fields?.file
            ? { url: assetUrl(avatarAsset.fields.file.url) }
            : undefined,
    };

    return { biographyData, seo };
}

// -------------------------------------------------
// EXPERIENCES
// -------------------------------------------------
export async function fetchExperiences() {
    const result = await fetchContentful({
        content_type: 'experiences',
        include: '3',
    });

    if (!result.items?.length) return [];

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    const experiences = result.items.map((entry: any) => {
        const fields = entry.fields;

        // Thumbnails (array av assets)
        const thumbRefs = fields?.thumbnail || [];
        const thumbnail = (Array.isArray(thumbRefs) ? thumbRefs : [thumbRefs]).map((ref: any) => {
            const asset = ref?.sys ? resolveLink(ref, assetMap, entryMap) : null;
            return asset?.fields?.file
                ? { url: assetUrl(asset.fields.file.url) }
                : null;
        }).filter(Boolean);

        return {
            experience: fields?.experience,
            title: fields?.title,
            period: fields?.period,
            startYear: fields?.startYear,
            thumbnail,
        };
    });

    // Sort by startYear
    experiences.sort((a: any, b: any) => (a.startYear ?? 0) - (b.startYear ?? 0));

    return experiences;
}

// -------------------------------------------------
// RECOMMENDATIONS
// -------------------------------------------------
export async function fetchRecommendations() {
    const result = await fetchContentful({
        content_type: 'recommendations',
        include: '3',
    });

    if (!result.items?.length) return [];

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    return result.items.map((entry: any) => {
        const fields = entry.fields;

        // Avatar
        const avatarRef = fields?.avatar;
        const avatarAsset = avatarRef?.sys ? resolveLink(avatarRef, assetMap, entryMap) : null;

        return {
            name: fields?.name,
            position: fields?.position,
            reference: fields?.reference,
            recommendation: fields?.recommendation
                ? { recommendation: fields.recommendation }
                : undefined,
            avatar: avatarAsset?.fields?.file
                ? { url: assetUrl(avatarAsset.fields.file.url) }
                : undefined,
        };
    });
}

// -------------------------------------------------
// WORKS SEO (för work.tsx Head)
// -------------------------------------------------
export async function fetchWorksSeo() {
    const result = await fetchContentful({
        content_type: 'musicalWork',
        include: '2',
        limit: '1',
    });

    const entry = result.items?.[0];
    if (!entry) return null;

    const assetMap = buildAssetMap(result.includes);
    const entryMap = buildEntryMap(result.includes);

    return resolveSeo(entry, assetMap, entryMap);
}

// Everything search engines and AI assistants read about each page: title,
// description, canonical URL, social preview and structured data (JSON-LD).
// Used in two places — the build-time prerender writes these tags into each
// page's HTML, and <SeoManager> keeps them in sync while navigating.

import { STUDIO, SERVICES, FAQS } from '../data/studio';
import { PROJECTS, getProject } from '../data/projects';

export const SITE_URL = 'https://www.globalarc.lk';
const DEFAULT_IMAGE = '/projects/caltea/hero.png';

// Every page worth indexing. The prerender writes one HTML file per route and
// the sitemap lists them all.
export const ROUTES = ['/', '/works', '/contact', ...PROJECTS.map((p) => `/work/${p.slug}`)];

const abs = (path) => SITE_URL + path;

const clip = (text, max = 160) => (text.length <= max ? text : `${text.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

const ORG_ID = `${SITE_URL}/#organization`;

const organization = {
  '@type': 'ProfessionalService',
  '@id': ORG_ID,
  name: STUDIO.name,
  url: `${SITE_URL}/`,
  logo: abs('/favicon.svg'),
  image: abs(DEFAULT_IMAGE),
  description:
    'Web design and software development studio in Colombo, Sri Lanka, building custom websites, e-commerce stores and web applications.',
  email: STUDIO.email,
  telephone: STUDIO.phoneHref.replace('tel:', ''),
  address: {
    '@type': 'PostalAddress',
    streetAddress: '551/1, Thalgahawatta Road, Wawa Road',
    addressLocality: 'Boralasgamuwa',
    addressRegion: 'Western Province',
    addressCountry: 'LK',
  },
  areaServed: [{ '@type': 'Country', name: 'Sri Lanka' }, 'Worldwide'],
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '19:00',
  },
  knowsAbout: SERVICES.map((s) => s.name),
  sameAs: STUDIO.social.map((s) => s.href).filter(Boolean),
};

const website = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: `${SITE_URL}/`,
  name: STUDIO.name,
  publisher: { '@id': ORG_ID },
};

const breadcrumbs = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: abs(path) })),
});

// The meta for one URL. Unknown paths get the home page's meta — the app
// redirects them there anyway.
export function pageMeta(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';

  if (path === '/works') {
    return {
      path,
      title: 'Our Work — Website & Web App Portfolio | Global Arc Solutions',
      description:
        'Websites, online stores and web applications designed and built by Global Arc Solutions, a web design studio in Colombo, Sri Lanka.',
      image: DEFAULT_IMAGE,
      jsonLd: [
        {
          '@type': 'CollectionPage',
          url: abs(path),
          name: 'Global Arc Solutions — Portfolio',
          hasPart: PROJECTS.map((p) => ({ '@type': 'CreativeWork', name: p.name, url: abs(`/work/${p.slug}`) })),
        },
        breadcrumbs([['Home', '/'], ['Works', path]]),
      ],
    };
  }

  if (path === '/contact') {
    return {
      path,
      title: 'Contact Us — Get a Website Quote in Sri Lanka | Global Arc Solutions',
      description: `Start your website, online store or web app project. Call ${STUDIO.phoneDisplay}, WhatsApp or email Global Arc Solutions in Boralasgamuwa, Colombo.`,
      image: DEFAULT_IMAGE,
      jsonLd: [{ '@type': 'ContactPage', url: abs(path), about: { '@id': ORG_ID } }, breadcrumbs([['Home', '/'], ['Contact', path]])],
    };
  }

  const slug = path.match(/^\/work\/([^/]+)$/)?.[1];
  const project = slug && getProject(slug);
  if (project) {
    return {
      path,
      title: `${project.name} — ${project.category.split(' · ')[0]} Case Study | Global Arc Solutions`,
      description: clip(project.summary),
      image: `${project.cover}.png`,
      type: 'article',
      jsonLd: [
        {
          '@type': 'CreativeWork',
          name: project.name,
          url: abs(path),
          description: project.summary,
          image: abs(`${project.cover}.png`),
          creator: { '@id': ORG_ID },
          keywords: [...project.disciplines, ...project.stack].join(', '),
        },
        breadcrumbs([['Home', '/'], ['Works', '/works'], [project.name, path]]),
      ],
    };
  }

  return {
    path: '/',
    title: 'Web Design & Development Company in Sri Lanka | Global Arc Solutions',
    description:
      'Web design and development studio in Colombo, Sri Lanka. Custom websites, e-commerce stores and web applications — hand-built, fast and made to grow your business.',
    image: DEFAULT_IMAGE,
    jsonLd: [
      organization,
      website,
      {
        '@type': 'FAQPage',
        mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
      },
    ],
  };
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// The <head> tags for a page, as HTML. Each carries `data-seo` so the client
// can swap them on navigation.
export function headTags(meta) {
  const url = meta.path === '/' ? `${SITE_URL}/` : abs(meta.path);
  const image = abs(meta.image);
  const graph = JSON.stringify({ '@context': 'https://schema.org', '@graph': meta.jsonLd }).replace(/</g, '\\u003c');
  return [
    `<title data-seo>${esc(meta.title)}</title>`,
    `<meta data-seo name="description" content="${esc(meta.description)}" />`,
    `<link data-seo rel="canonical" href="${url}" />`,
    `<meta data-seo property="og:type" content="${meta.type || 'website'}" />`,
    `<meta data-seo property="og:url" content="${url}" />`,
    `<meta data-seo property="og:title" content="${esc(meta.title)}" />`,
    `<meta data-seo property="og:description" content="${esc(meta.description)}" />`,
    `<meta data-seo property="og:image" content="${image}" />`,
    `<meta data-seo name="twitter:card" content="summary_large_image" />`,
    `<meta data-seo name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta data-seo name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta data-seo name="twitter:image" content="${image}" />`,
    `<script data-seo type="application/ld+json">${graph}</script>`,
  ].join('\n    ');
}

export const sitemapXml = () =>
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url><loc>${r === '/' ? `${SITE_URL}/` : abs(r)}</loc></url>`).join('\n')}
</urlset>
`;

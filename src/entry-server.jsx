// Build-time only: renders a route to HTML for scripts/prerender.mjs.
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App.jsx';

export { ROUTES, pageMeta, headTags, sitemapXml } from './lib/seo';

export const render = (url) =>
  renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

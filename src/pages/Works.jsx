import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { PROJECTS, WORK_CATEGORIES, projectMatchesCategory } from '../data/projects';
import useReveal from '../lib/useReveal';
import Picture from '../components/Picture';
import ContactCta from '../components/ContactCta';
import './works.css';

// Filter buttons: All, Web, Mobile App, Systems
function WorkFilterButtons({ value, categories, counts, onChange }) {
  return (
    <div className="works__filter-bar" role="tablist" aria-label="Filter works by category">
      {categories.map((cat) => {
        const isActive = cat === value;
        const count = counts[cat] ?? 0;
        return (
          <button
            key={cat}
            role="tab"
            type="button"
            aria-selected={isActive}
            className={`works__filter-btn${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(cat)}
          >
            <span className="works__filter-name">{cat}</span>
            <span className="works__filter-count" aria-label={`${count} projects`}>{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export function WorkCard({ project, eager }) {
  return (
    <Link to={`/work/${project.slug}`} className="wcard">
      <span className="wcard__media">
        <Picture src={project.cover} alt={`${project.name} — ${project.gallery[0].caption}`} sizes="(min-width: 900px) 48vw, 92vw" eager={eager} />
        <span className="wcard__hover" aria-hidden="true">
          View Project
        </span>
      </span>
      <span className="wcard__meta">
        <span className="wcard__name">{project.name}</span>
        <span className="wcard__cat">{project.category}</span>
      </span>
    </Link>
  );
}

export default function Works() {
  const root = useRef(null);
  const [category, setCategory] = useState('All');

  const counts = useMemo(() => {
    const map = {};
    for (const cat of WORK_CATEGORIES) {
      map[cat] = cat === 'All' ? PROJECTS.length : PROJECTS.filter((p) => projectMatchesCategory(p, cat)).length;
    }
    return map;
  }, []);

  const shown = useMemo(() => {
    return PROJECTS.filter((p) => projectMatchesCategory(p, category));
  }, [category]);

  useReveal(root, [category]);

  return (
    <div ref={root}>
      <section className="works">
        <div className="works__glow" aria-hidden="true" />
        <div className="wrap">
          <h1 className="display works__title" data-reveal>
            Our <em>Works</em>
          </h1>
          <p className="lead works__lead" data-reveal style={{ '--d': '0.06s' }}>
            Live projects, designed and built end to end by the studio.
          </p>
          <div className="works__filter-wrap" data-reveal style={{ '--d': '0.12s' }}>
            <WorkFilterButtons
              value={category}
              categories={WORK_CATEGORIES}
              counts={counts}
              onChange={setCategory}
            />
          </div>
          {shown.length > 0 ? (
            <ul className="works__grid">
              {shown.map((p, i) => (
                <li key={p.slug} data-reveal style={{ '--d': `${(i % 2) * 0.08}s` }}>
                  <WorkCard project={p} eager={i < 2} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="works__empty" data-reveal>
              <span className="works__empty-tag">In Active Production</span>
              <h2 className="works__empty-title">{category} case studies coming soon</h2>
              <p className="works__empty-lead">
                We design and engineer bespoke {category.toLowerCase()}s for ambitious brands.
                Reach out directly to view our private credentials deck and live demonstrations.
              </p>
              <div className="works__empty-actions">
                <Link to="/contact" className="btn btn--solid">
                  Inquire About {category}
                </Link>
                <button
                  type="button"
                  className="btn btn--line"
                  onClick={() => setCategory('All')}
                >
                  View All Projects
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <ContactCta />
    </div>
  );
}

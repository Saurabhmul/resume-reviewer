import React from 'react';

const s = {
  page: {
    position: 'absolute',
    top: 0,
    left: '-9999px',
    width: '816px',       // 8.5in at 96dpi
    minHeight: '1056px',  // 11in at 96dpi
    padding: '64px 72px',
    backgroundColor: 'white',
    fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    boxSizing: 'border-box',
    color: '#111827',
    zIndex: -1,
    lineHeight: 1.4,
  },
  name: {
    fontSize: '20pt',
    fontWeight: 700,
    letterSpacing: '0.06em',
    margin: '0 0 5px 0',
    color: '#111827',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  contactRow: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    fontSize: '9.5pt',
    color: '#4B5563',
    marginBottom: '16px',
  },
  divider: { color: '#D1D5DB' },
  sectionWrapper: { marginBottom: '18px' },
  sectionTitle: {
    fontSize: '10.5pt',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.09em',
    color: '#111827',
    borderBottom: '1.5px solid #6B7280',
    paddingBottom: '2px',
    marginBottom: '7px',
  },
  entryBlock: { marginBottom: '9px' },
  entryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  companyName: { fontWeight: 700, fontSize: '10.5pt', color: '#111827' },
  roleName: { fontStyle: 'italic', fontSize: '10pt', color: '#374151' },
  dateText: { fontSize: '9.5pt', color: '#6B7280', whiteSpace: 'nowrap', marginLeft: '8px' },
  locationText: { fontSize: '9.5pt', color: '#6B7280', whiteSpace: 'nowrap', marginLeft: '8px' },
  bulletList: { margin: '3px 0 0 0', paddingLeft: '18px' },
  bulletItem: { fontSize: '10pt', color: '#374151', lineHeight: 1.5, marginBottom: '1px' },
  summaryText: { fontSize: '10pt', color: '#374151', lineHeight: 1.7, margin: 0 },
  skillRow: { fontSize: '10pt', color: '#374151', marginBottom: '3px' },
  skillLabel: { fontWeight: 700 },
  detailText: { fontSize: '9.5pt', color: '#4B5563', marginTop: '1px' },
  listItem: { fontSize: '10pt', color: '#374151', lineHeight: 1.5, marginBottom: '2px' },
};

const SectionSummary = ({ sec }) => (
  <p style={s.summaryText}>{sec.content}</p>
);

const SectionExperience = ({ sec }) => (
  <>
    {sec.items?.map((item, i) => (
      <div key={i} data-block="entry" style={{ ...s.entryBlock, marginBottom: i < sec.items.length - 1 ? '10px' : 0 }}>
        <div style={s.entryHeader}>
          <span style={s.companyName}>{item.company}</span>
          <span style={s.dateText}>{item.duration}</span>
        </div>
        <div style={s.entryHeader}>
          <span style={s.roleName}>{item.role}</span>
          {item.location && <span style={s.locationText}>{item.location}</span>}
        </div>
        {item.bullets?.length > 0 && (
          <ul style={s.bulletList}>
            {item.bullets.map((b, k) => (
              <li key={k} style={s.bulletItem}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </>
);

const SectionEducation = ({ sec }) => (
  <>
    {sec.items?.map((item, i) => (
      <div key={i} data-block="entry" style={{ ...s.entryBlock, marginBottom: i < sec.items.length - 1 ? '10px' : 0 }}>
        <div style={s.entryHeader}>
          <span style={s.companyName}>{item.institution}</span>
          <span style={s.dateText}>{item.duration}</span>
        </div>
        <div style={{ ...s.roleName }}>{item.degree}</div>
        {item.details?.filter(d => d).map((d, k) => (
          <div key={k} style={s.detailText}>{d}</div>
        ))}
      </div>
    ))}
  </>
);

const SectionSkills = ({ sec }) => (
  <>
    {sec.categories?.map((cat, i) => (
      <div key={i} style={s.skillRow}>
        {cat.label ? (
          <>
            <span style={s.skillLabel}>{cat.label}: </span>
            <span>{cat.items?.join(', ')}</span>
          </>
        ) : (
          <span>{cat.items?.join(' • ')}</span>
        )}
      </div>
    ))}
    {/* Fallback if Gemini returned flat items instead of categories */}
    {!sec.categories && sec.items && (
      <div style={s.skillRow}>{sec.items.join(' • ')}</div>
    )}
  </>
);

const SectionProjects = ({ sec }) => (
  <>
    {sec.items?.map((item, i) => (
      <div key={i} data-block="entry" style={{ ...s.entryBlock, marginBottom: i < sec.items.length - 1 ? '10px' : 0 }}>
        <div style={s.entryHeader}>
          <span style={s.companyName}>{item.name}</span>
          {item.tech && <span style={s.dateText}>{item.tech}</span>}
        </div>
        {item.bullets?.length > 0 && (
          <ul style={s.bulletList}>
            {item.bullets.map((b, k) => (
              <li key={k} style={s.bulletItem}>{b}</li>
            ))}
          </ul>
        )}
      </div>
    ))}
  </>
);

const SectionList = ({ sec }) => (
  <ul style={s.bulletList}>
    {sec.items?.map((item, i) => (
      <li key={i} style={s.listItem}>{item}</li>
    ))}
  </ul>
);

const renderSection = (sec) => {
  switch (sec.type) {
    case 'summary':    return <SectionSummary sec={sec} />;
    case 'experience': return <SectionExperience sec={sec} />;
    case 'education':  return <SectionEducation sec={sec} />;
    case 'skills':     return <SectionSkills sec={sec} />;
    case 'projects':   return <SectionProjects sec={sec} />;
    default:           return <SectionList sec={sec} />;
  }
};

const ResumeTemplate = ({ data }) => {
  if (!data) return null;

  return (
    <div id="resume-html-template" style={s.page}>
      {/* Header */}
      <h1 style={s.name}>{data.name}</h1>
      <div style={s.contactRow}>
        {data.contact?.filter(c => c).map((c, i) => (
          <React.Fragment key={i}>
            <span>{c}</span>
            {i < data.contact.length - 1 && <span style={s.divider}>|</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Sections */}
      {data.sections?.map((sec, i) => (
        <div key={i} style={s.sectionWrapper}>
          <div style={s.sectionTitle}>{sec.title}</div>
          {renderSection(sec)}
        </div>
      ))}
    </div>
  );
};

export default ResumeTemplate;

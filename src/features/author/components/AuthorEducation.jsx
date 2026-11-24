import Icon from "../../../shared/components/Icon";

/**
 * @file AuthorEducation.jsx
 * @description Academic Education & Career Timeline.
 */
export default function AuthorEducation({ education = [] }) {
  const items = Array.isArray(education) ? education : [];

  return (
    <div className="ap-section">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:graduation-cap" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Education & Career Milestones</h2>
        </div>
        <span className="ap-section-badge">{items.length} milestones</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Education and career information is not available for this author.</p>
      ) : <div className="ap-edu-timeline">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="ap-edu-row">
            <div className="ap-edu-year-col">
              <span className="ap-edu-year">{item.year}</span>
              <span className={`ap-edu-type-tag ${item.type}`}>
                {item.type === "education" ? "Education" : "Career"}
              </span>
            </div>

            <div className="ap-edu-connector-col">
              <div className={`ap-edu-dot ${item.type}`} />
              {idx < education.length - 1 && <div className="ap-edu-line" />}
            </div>

            <div className="ap-edu-info-col">
              <h3 className="ap-edu-degree">{item.degree}</h3>
              <div className="ap-edu-inst">
                <Icon icon="lucide:building" width="12" />
                <span>{item.institution}</span>
              </div>
              {item.location && (
                <div className="ap-edu-loc">
                  <Icon icon="lucide:map-pin" width="11" />
                  <span>{item.location}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

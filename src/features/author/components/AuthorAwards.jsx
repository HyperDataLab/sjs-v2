import Icon from "../../../shared/components/Icon";

/**
 * @file AuthorAwards.jsx
 * @description Selected Awards & Honors academic timeline.
 */
export default function AuthorAwards({ awards = [] }) {
  const items = Array.isArray(awards) ? awards : [];

  return (
    <div className="ap-section" id="awards">
      <div className="ap-section-header">
        <div className="ap-section-header-left">
          <Icon icon="lucide:trophy" width="16" className="ap-section-icon" />
          <h2 className="ap-section-title">Selected Awards & Honors</h2>
        </div>
        <span className="ap-section-badge">{items.length} major distinctions</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Award information is not available for this author.</p>
      ) : <div className="ap-awards-timeline">
        {items.map((item) => (
          <div key={item.id} className="ap-award-item">
            <div className="ap-award-year-col">
              <span className="ap-award-year-badge">{item.year}</span>
            </div>

            <div className="ap-award-timeline-col">
              <div className="ap-award-timeline-dot" />
              <div className="ap-award-timeline-line" />
            </div>

            <div className="ap-award-content-col">
              <h3 className="ap-award-title">{item.award}</h3>
              <div className="ap-award-org">
                <Icon icon="lucide:award" width="12" />
                <span>{item.organization}</span>
              </div>
              {item.description && (
                <p className="ap-award-desc">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

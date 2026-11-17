/** Shared Trending System logo. */
export default function Logo({ size = 32, fontSize = '1.25rem', className = '', ...props }) {
  return (
    <div
      className={`d-flex align-items-center text-main fw-bold ${className}`}
      style={{ fontFamily: "var(--font-display)", fontWeight: 800, cursor: "pointer", ...props.style }}
      {...props}
    >
      <img
        src="/Cyan_folded-ribbon_T_favicon.png"
        alt=""
        width={size}
        height={size}
        className="me-2"
        style={{ objectFit: 'contain' }}
      />
      <span style={{ fontSize }}>Trending System</span>
    </div>
  );
}

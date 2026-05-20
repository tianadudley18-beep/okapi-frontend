export default function OkapiLogo({ size = 36, showText = true, className = '' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/okapi.jpg"
        alt="Okapi"
        style={{ width: size, height: size, borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
      />

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="font-heading font-800 text-navy-900 dark:text-cream-200"
            style={{ fontSize: size * 0.47, fontWeight: 800, letterSpacing: '-0.02em' }}
          >
            Okapi
          </span>
        </div>
      )}
    </div>
  )
}

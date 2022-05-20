export function Heading({
  title,
  subtitle,
  fontFamily,
  textColor,
}: {
  title?: string;
  subtitle?: string;
  fontFamily: string;
  textColor: string;
}) {
  const containerPadding = 40;

  const headingStyles = {
    fontFamily: `'${fontFamily.replace(/\+/g, ' ')}'`,
    fontSize: '1em',
    lineHeight: 1.5,
    margin: 0,
    color: textColor,
  };

  const h1Styles = {
    ...headingStyles,
    lineHeight: 1.5,
    fontWeight: 700,
  };

  const h2Styles = {
    ...headingStyles,
    fontSize: '0.7em',
    fontWeight: 400,
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: containerPadding,
        overflow: 'hidden',
        padding: `0 ${containerPadding}px`,
      }}
    >
      <div
        style={{
          textAlign: 'left',
          width: '100%',
          position: 'relative',
          fontSize: '22px',
        }}
      >
        {subtitle && <h2 style={h2Styles}>{subtitle}</h2>}
        {title && <h1 style={h1Styles}>{title}</h1>}
      </div>
    </div>
  );
}

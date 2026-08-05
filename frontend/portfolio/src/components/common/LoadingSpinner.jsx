export default function LoadingSpinner({ size = 'md', className = '' }) {
  const cls = size === 'sm' ? 'spinner-sm' : 'spinner';
  return <div className={`${cls} ${className}`} />;
}

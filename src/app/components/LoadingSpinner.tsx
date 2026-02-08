interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullPage?: boolean;
  color?: 'gold' | 'white';
}

export function LoadingSpinner({
  size = 'md',
  message,
  fullPage = false,
  color = 'gold',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const colorClasses = {
    gold: 'border-[#d4af37] border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          {spinner}
          {message && (
            <p className="text-lg text-muted-foreground" role="alert">
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {spinner}
      {message && (
        <span className="text-sm text-muted-foreground" role="alert">
          {message}
        </span>
      )}
    </div>
  );
}

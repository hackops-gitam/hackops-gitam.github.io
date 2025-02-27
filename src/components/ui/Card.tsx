interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-navy-light p-6 rounded-lg backdrop-blur-sm border border-gray-800 hover:border-cyan transition-colors ${className}`}>
      {children}
    </div>
  );
}
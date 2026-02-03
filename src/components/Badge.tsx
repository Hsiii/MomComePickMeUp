interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'danger' | 'warning' | 'default';
    className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
    const variantClass = variant !== 'default' ? `badge-${variant}` : '';
    
    return (
        <span className={`badge ${variantClass} ${className}`.trim()}>
            {children}
        </span>
    );
}

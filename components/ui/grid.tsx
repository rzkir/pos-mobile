import React from 'react';

import { View, ViewStyle } from 'react-native';

interface GridProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
    gapX?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
    gapY?: 1 | 2 | 3 | 4 | 5 | 6 | 8;
    className?: string;
    style?: ViewStyle;
    autoFit?: boolean;
    autoFill?: boolean;
    masonry?: boolean;
}

export const Grid: React.FC<GridProps> = ({
    children,
    cols = 2,
    gap,
    gapX,
    gapY,
    className = '',
    style,
    autoFit = false,
    autoFill = false,
    masonry = false,
}) => {
    const getGridClasses = () => {
        let classes = 'grid';

        if (autoFit) {
            classes += ' grid-auto-fit';
        } else if (autoFill) {
            classes += ' grid-auto-fill';
        } else if (masonry) {
            classes += ' grid-masonry';
        } else {
            classes += ` grid-cols-${cols}`;
        }

        if (gap) {
            classes += ` gap-${gap}`;
        }

        if (gapX) {
            classes += ` gap-x-${gapX}`;
        }

        if (gapY) {
            classes += ` gap-y-${gapY}`;
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getGridClasses()} style={style}>
            {children}
        </View>
    );
};

interface GridItemProps {
    children: React.ReactNode;
    colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full';
    rowSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 'full';
    className?: string;
    style?: ViewStyle;
}

export const GridItem: React.FC<GridItemProps> = ({
    children,
    colSpan,
    rowSpan,
    className = '',
    style,
}) => {
    const getItemClasses = () => {
        let classes = '';

        if (colSpan) {
            classes += ` col-span-${colSpan}`;
        }

        if (rowSpan) {
            classes += ` row-span-${rowSpan}`;
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getItemClasses()} style={style}>
            {children}
        </View>
    );
};

interface ResponsiveGridProps {
    children: React.ReactNode;
    cols?: {
        default?: 1 | 2 | 3 | 4 | 5 | 6;
        sm?: 1 | 2 | 3 | 4 | 5 | 6;
        md?: 1 | 2 | 3 | 4 | 5 | 6;
        lg?: 1 | 2 | 3 | 4 | 5 | 6;
    };
    gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
    className?: string;
    style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
    children,
    cols = { default: 2, sm: 3, md: 4, lg: 5 },
    gap = 4,
    className = '',
    style,
}) => {
    const getResponsiveClasses = () => {
        let classes = 'grid';

        if (cols.default) {
            classes += ` grid-cols-${cols.default}`;
        }

        if (cols.sm) {
            classes += ` sm:grid-cols-${cols.sm}`;
        }

        if (cols.md) {
            classes += ` md:grid-cols-${cols.md}`;
        }

        if (cols.lg) {
            classes += ` lg:grid-cols-${cols.lg}`;
        }

        classes += ` gap-${gap}`;

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getResponsiveClasses()} style={style}>
            {children}
        </View>
    );
};
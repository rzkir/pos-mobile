import React from 'react';

import { View, ViewStyle } from 'react-native';

interface FlexColumnProps {
    children: React.ReactNode;
    align?: 'start' | 'center' | 'end' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    gap?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
    className?: string;
    style?: ViewStyle;
    reverse?: boolean;
    wrap?: boolean;
    fullHeight?: boolean;
    screenHeight?: boolean;
    minScreenHeight?: boolean;
}

export const FlexColumn: React.FC<FlexColumnProps> = ({
    children,
    align = 'start',
    justify = 'start',
    gap,
    className = '',
    style,
    reverse = false,
    wrap = false,
    fullHeight = false,
    screenHeight = false,
    minScreenHeight = false,
}) => {
    const getFlexClasses = () => {
        let classes = 'flex';

        if (reverse) {
            classes += ' flex-col-reverse';
        } else {
            classes += ' flex-col';
        }

        // Alignment
        switch (align) {
            case 'center':
                classes += ' items-center';
                break;
            case 'end':
                classes += ' items-end';
                break;
            case 'stretch':
                classes += ' items-stretch';
                break;
            default:
                classes += ' items-start';
        }

        // Justification
        switch (justify) {
            case 'center':
                classes += ' justify-center';
                break;
            case 'end':
                classes += ' justify-end';
                break;
            case 'between':
                classes += ' justify-between';
                break;
            case 'around':
                classes += ' justify-around';
                break;
            case 'evenly':
                classes += ' justify-evenly';
                break;
            default:
                classes += ' justify-start';
        }

        // Gap
        if (gap) {
            classes += ` gap-${gap}`;
        }

        // Wrap
        if (wrap) {
            classes += ' flex-wrap';
        }

        // Height
        if (fullHeight) {
            classes += ' h-full';
        } else if (screenHeight) {
            classes += ' h-screen';
        } else if (minScreenHeight) {
            classes += ' min-h-screen';
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getFlexClasses()} style={style}>
            {children}
        </View>
    );
};

interface FlexColumnItemProps {
    children: React.ReactNode;
    grow?: boolean;
    shrink?: boolean;
    basis?: 'auto' | 'full' | '0';
    className?: string;
    style?: ViewStyle;
}

export const FlexColumnItem: React.FC<FlexColumnItemProps> = ({
    children,
    grow = false,
    shrink = false,
    basis = 'auto',
    className = '',
    style,
}) => {
    const getItemClasses = () => {
        let classes = '';

        if (grow) {
            classes += ' flex-grow';
        }

        if (shrink) {
            classes += ' flex-shrink';
        }

        switch (basis) {
            case 'full':
                classes += ' flex-1';
                break;
            case '0':
                classes += ' flex-none';
                break;
            default:
                classes += ' flex-auto';
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getItemClasses()} style={style}>
            {children}
        </View>
    );
};

interface FlexColumnCenterProps {
    children: React.ReactNode;
    className?: string;
    style?: ViewStyle;
    fullHeight?: boolean;
    screenHeight?: boolean;
    minScreenHeight?: boolean;
}

export const FlexColumnCenter: React.FC<FlexColumnCenterProps> = ({
    children,
    className = '',
    style,
    fullHeight = false,
    screenHeight = false,
    minScreenHeight = false,
}) => {
    const getCenterClasses = () => {
        let classes = 'flex-col-center';

        if (fullHeight) {
            classes += ' h-full';
        } else if (screenHeight) {
            classes += ' h-screen';
        } else if (minScreenHeight) {
            classes += ' min-h-screen';
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getCenterClasses()} style={style}>
            {children}
        </View>
    );
};

interface FlexColumnBetweenProps {
    children: React.ReactNode;
    className?: string;
    style?: ViewStyle;
    fullHeight?: boolean;
    screenHeight?: boolean;
    minScreenHeight?: boolean;
}

export const FlexColumnBetween: React.FC<FlexColumnBetweenProps> = ({
    children,
    className = '',
    style,
    fullHeight = false,
    screenHeight = false,
    minScreenHeight = false,
}) => {
    const getBetweenClasses = () => {
        let classes = 'flex-col-between';

        if (fullHeight) {
            classes += ' h-full';
        } else if (screenHeight) {
            classes += ' h-screen';
        } else if (minScreenHeight) {
            classes += ' min-h-screen';
        }

        return `${classes} ${className}`.trim();
    };

    return (
        <View className={getBetweenClasses()} style={style}>
            {children}
        </View>
    );
};

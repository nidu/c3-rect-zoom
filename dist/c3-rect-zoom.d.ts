/// <reference types="d3"/>
/// <reference types="c3"/>

declare namespace c3RectZoom {
    export interface Settings {
        /**
         * Padding from the margin for reset button.
         * If number is given - used both as x and y padding.
         * @default {x: 20, y: 20}
         */
        resetBtnPadding?: {
            x: number;
            y: number;
        } | number;
        /**
         * Reset button position on the chart.
         * @default 'top-right'
         */
        resetBtnPos?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
        /**
         * Minimum selection area dimensions.
         * If at least one dimensions doesn't exceed this setting - zoom doesn't happen.
         * Specified in pixels.
         * @default {width: 10, height: 10}
         */
        minRectSize?: {
            width: number;
            height: number;
        } | number;
    }

    /** 
     * Patches c3.generate method to allow setting up c3RectZoom option inside props given to generate method.
     * Should be called once close to app initialization.
     */
    export function patchC3(c3): void
}

declare namespace c3 {
    interface ChartConfiguration {
        /**
         * Setup zooming to rectangular area. Use only with charts where it makes sence like line, area or scatter.
         */
        c3RectZoom?: c3RectZoom.Settings & {
            /**
             * Setup zooming to rectangular area.
             * @default false
             */
            enabled: boolean
        }
    }
}
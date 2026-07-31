export type WindowLevelListener = (presetName: string, values: {
    width: number;
    level: number;
} | null) => void;
/**
 * Service to manage active Window/Level presets per viewport.
 * Listens to active viewport changes and manual Window/Level adjustments.
 */
export declare class WindowLevelService {
    private servicesManager;
    private listeners;
    private viewportPresets;
    private isApplyingPreset;
    private unsubscribeGrid;
    private boundVoiModifiedHandler;
    constructor(servicesManager: any);
    /**
     * Initializes the service by subscribing to layout and Cornerstone events.
     */
    init(): void;
    /**
     * Cleans up all event listeners.
     */
    destroy(): void;
    /**
     * Subscribes a listener to selected preset changes.
     * Immediately invokes the listener with the current state.
     */
    subscribe(listener: WindowLevelListener): {
        unsubscribe: () => void;
    };
    private notify;
    private getActiveViewportId;
    private getViewportWwl;
    private initializeViewportPreset;
    private handleActiveViewportChange;
    private handleVoiModified;
    /**
     * Applies the window width and window level for a preset to the active viewport.
     */
    applyPreset(presetName: string): void;
    /**
     * Gets the current preset and width/level values for the active viewport.
     */
    getCurrentState(): {
        preset: string;
        wwl: {
            width: number;
            level: number;
        } | null;
    };
}

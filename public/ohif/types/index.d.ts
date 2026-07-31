export interface WindowLevelPreset {
    name: string;
    windowWidth: number;
    windowLevel: number;
}
export interface WindowLevelConfig {
    presets: WindowLevelPreset[];
    tolerance: number;
    defaultPreset: string;
}
export type WindowLevelListener = (presetName: string, values: {
    width: number;
    level: number;
} | null) => void;

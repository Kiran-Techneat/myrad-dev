import { WindowLevelPreset } from '../config/presets';
/**
 * Converts Window Width and Window Level to lower and upper bounds of VOI Range.
 */
export declare function wwlToVoiRange(width: number, level: number): {
    lower: number;
    upper: number;
};
/**
 * Converts lower and upper bounds of VOI Range back to Window Width and Window Level.
 */
export declare function voiRangeToWwl(lower: number, upper: number): {
    windowWidth: number;
    windowLevel: number;
};
/**
 * Finds the preset that most closely matches the given Window Width and Window Level.
 * Closest match is determined by the minimum absolute difference sum (Manhattan distance).
 */
export declare function findClosestPreset(width: number, level: number, presets: WindowLevelPreset[]): WindowLevelPreset;
/**
 * Attempts to match the given Window Width and Window Level to a preset within the configurable tolerance.
 * Returns the matched preset, or null if no preset is within tolerance.
 */
export declare function matchPreset(width: number, level: number, presets: WindowLevelPreset[], tolerance: number): WindowLevelPreset | null;

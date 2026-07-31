/**
 * Activates Scroll mode across all registered tool groups.
 * In Scroll mode:
 * - Left mouse drag: Stack Scroll
 * - Mouse wheel: Stack Scroll
 * - Right mouse drag: Pan
 * - Middle mouse drag: Zoom
 *
 * Window/Level is inactive on left drag during Scroll mode.
 *
 * @param toolGroupService The ToolGroupService from OHIF
 */
export declare function activateScrollMode(toolGroupService: any): void;

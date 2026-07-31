import React from 'react';
interface WindowLevelPresetDropdownProps {
    servicesManager: any;
    commandsManager: any;
}
/**
 * Dropdown React component to display and switch Window/Level presets.
 * Interacts with WindowLevelService to keep preset selection synchronized.
 */
export default function WindowLevelPresetDropdown({ servicesManager, commandsManager, }: WindowLevelPresetDropdownProps): React.JSX.Element;
export {};

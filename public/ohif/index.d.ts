import init from './init';
import getToolbarModule from './toolbarModule';
import getCommandsModule from './commands/index';
/**
 * Main OHIF v3 Extension definition.
 */
declare const extension: {
    id: string;
    preRegistration: typeof init;
    getToolbarModule: typeof getToolbarModule;
    getCommandsModule: typeof getCommandsModule;
};
export default extension;

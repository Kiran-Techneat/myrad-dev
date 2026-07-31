/**
 * Returns the Commands Module definition for the extension.
 */
export default function getCommandsModule({ servicesManager }: {
    servicesManager: any;
}): {
    definitions: {
        activateScrollMode: {
            commandFn: () => void;
            options: {};
        };
    };
    defaultContext: string;
};

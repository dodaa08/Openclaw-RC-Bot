import {
    IAppAccessors,
    ILogger,
    IConfigurationExtend
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { OpenclawCommand } from './commands/OpenclawCommand';
import { OcCallbackEndpoint } from './endpoints/OcCallbackEndpoint';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';


export class OCbotApp extends App {
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public async extendConfiguration(configuration: IConfigurationExtend) {
        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new OcCallbackEndpoint(this)],
        });

        configuration.slashCommands.provideSlashCommand(new OpenclawCommand());
    }
}

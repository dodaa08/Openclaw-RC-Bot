import {
    IHttp,
    IModify,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import {
    ISlashCommand,
    SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';

export class OpenclawCommand implements ISlashCommand {
    public command = 'oc';
    public i18nParamsExample = '';
    public i18nDescription = '';
    public providesPreview = false;

    private async sendMessage(context: SlashCommandContext, read: IRead, modify: IModify, message: string): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const room = context.getRoom();

        messageStructure
            .setRoom(room)
            .setText(message);

        const appUser = await read.getUserReader().getAppUser();
        if (appUser) {
            messageStructure.setSender(appUser);
        }

        await modify.getCreator().finish(messageStructure);
    }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp): Promise<void> {
        const [subcommand, ...args] = context.getArguments();

        if (!subcommand) {
            throw new Error('Error!');
        }

        const room = context.getRoom();
        const sender = context.getSender();


        switch (subcommand) {
            case 'on':
                await this.sendMessage(context, read, modify, 'on!');
                break;

            case 'off':
                await this.sendMessage(context, read, modify, 'off!');
                break;

            case 'sync': {
                http.post('http://127.0.0.1:18789/hooks/agent', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer rocketchat-secret',
                    },
                    data: {
                        message: args.join(' '),
                        wakeMode: 'now',
                        deliver: true,
                        channel: 'rocketchat',
                        to: room.id,
                        sessionKey: `rc:${room.id}:${sender.id}:${Date.now()}`,
                        sessionTarget: 'isolated',
                    },
                });
                await this.sendMessage(context, read, modify, `> ${args.join(' ')}`);
                await this.sendMessage(context, read, modify, 'Loading...');
                break;
            }

            case 'async': {
                http.post('http://127.0.0.1:18789/hooks/agent', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer rocketchat-secret',
                    },
                    data: {
                        message: args.join(' '),
                        wakeMode: 'now',
                        deliver: true,
                        channel: 'rocketchat',
                        to: room.id,
                        sessionKey: `rc:${room.id}:${sender.id}`,
                        sessionTarget: 'isolated',
                    },
                });

                await this.sendMessage(context, read, modify, `> ${args.join(' ')}`);
                await this.sendMessage(context, read, modify, 'Loading...');
                break;
            }
            default:
                throw new Error('Error!');
        }
    }
}
import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';

export class OcCallbackEndpoint extends ApiEndpoint {
    public path = 'oc-callback';

    public async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence,
    ): Promise<IApiResponse> {
        const { roomId, content } = request.content;

        if (!roomId || !content) {
            return this.success();
        }

        const room = await read.getRoomReader().getById(roomId);
        const appUser = await read.getUserReader().getAppUser();

        if (!room || !appUser) {
            return this.success();
        }

        const message = modify.getCreator().startMessage()
            .setRoom(room)
            .setSender(appUser)
            .setText(content);

        await modify.getCreator().finish(message);

        return this.success();
    }
}
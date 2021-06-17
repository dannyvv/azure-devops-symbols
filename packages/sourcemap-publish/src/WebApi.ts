import * as ado from "azure-devops-node-api";
import VsoBaseInterfaces = require('azure-devops-node-api/interfaces/common/VsoBaseInterfaces');

import * as symbolApi from './symbolApi'

export interface ConnectionOptions {
    serverUrl?: string,
    token?: string
}

export async function getWebApi(options?: ConnectionOptions): Promise<WebApi> {
    const serverUrl = options?.serverUrl || getEnv("API_URL");
    const token = options?.token || getEnv("API_TOKEN");

    let authHandler = ado.getPersonalAccessTokenHandler(token);
    let webApi = new WebApi(serverUrl, authHandler);

    await webApi.connect();

    return webApi;
}

function getEnv(name: string): string {
    let val = process.env[name];
    if (!val) {
        console.error(`${name} env var not set`);
        process.exit(1);
    }
    return val;
}


export class WebApi extends ado.WebApi {
    constructor(defaultUrl: string, authHandler: VsoBaseInterfaces.IRequestHandler, options?: VsoBaseInterfaces.IRequestOptions, requestSettings?: ado.IWebApiRequestSettings) {
        super(defaultUrl, authHandler, options, requestSettings);
    }

    public async getSymbolApi(serverUrl?: string, handlers?: VsoBaseInterfaces.IRequestHandler[]): Promise<symbolApi.ISymbolApi> {
        // TODO: Load RESOURCE_AREA_ID correctly.
        serverUrl = await this['_getResourceAreaUrl'](serverUrl || this.serverUrl, "af607f94-69ba-4821-8159-f04e37b66350");
        handlers = handlers || [this.authHandler];
        return new symbolApi.SymbolApi(serverUrl!, handlers, this.options);
    }
    
}

export interface ResourceBase {
    /** 
     * The ID of user who created this item. Optional.
     */
    createdBy?: string;

    /** 
     * The date time when this item is created. Optional.
     */
    createdDate?: Date;

    /** 
     * An identifier for this item. Optional.
     */
    id?: string;

    /** 
     * An opaque ETag used to synchronize with the version stored at server end. Optional.
     */
    storageETag?: string;

    /**
     * A URI which can be used to retrieve this item in its raw format. Optional. Note this
     * is distinguished from other URIs that are present in a derived resource.
     */
    url?: string;
}
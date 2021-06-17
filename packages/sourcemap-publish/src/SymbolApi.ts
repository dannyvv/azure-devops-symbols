import apiBases = require('azure-devops-node-api/ClientApiBases');
import VsoBaseInterfaces = require('azure-devops-node-api/interfaces/common/VsoBaseInterfaces');
import VsoClient = require('azure-devops-node-api/VsoClient');
import * as restClient from 'typed-rest-client/RestClient';

import * as SymbolInterfaces from './SymbolInterfaces';

export interface ISymbolApi extends apiBases.ClientApiBase {
    createRequest(request: SymbolInterfaces.Request): Promise<SymbolInterfaces.Request>;
    createRequestByName(requestName: string): Promise<SymbolInterfaces.Request>;
    finalizeRequest(requestId: string, expirationDate: Date | undefined, isUpdateOperation: boolean): Promise<SymbolInterfaces.Request>;
}

const requestsV2Id = "ebc09fe3-1b20-4667-abc5-f2b60fe8de52";
const currentApiVersion = "2.0-preview";

export class SymbolApi extends apiBases.ClientApiBase implements ISymbolApi {
    constructor(baseUrl: string, handlers: VsoBaseInterfaces.IRequestHandler[], options?: VsoBaseInterfaces.IRequestOptions) {
        super(baseUrl, handlers, 'node-Profile-api', options);
    }

    /**
     * createRequest
     */
    public async createRequest(request: SymbolInterfaces.Request): Promise<SymbolInterfaces.Request> {
        const routeValues = {
            resource: "requests"
        }

        const verData: VsoClient.ClientVersioningData = await this.vsoClient.getVersioningData(
            currentApiVersion,
            "Symbol",
            requestsV2Id,
            routeValues);

        const url = verData.requestUrl!;
        const options: restClient.IRequestOptions = this.createRequestOptions('application/json', verData.apiVersion);
        const res = await this.rest.create<SymbolInterfaces.Request>(url, request, options);

        return this.formatResponse(res.result, null, false);
    }

    /**
    * createRequestByName
    */
    public async createRequestByName(requestName: string): Promise<SymbolInterfaces.Request> {
        const routeValues = {
            resource: "requests"
        }
        const queryValues = {
            requestName: requestName
        }

        const verData: VsoClient.ClientVersioningData = await this.vsoClient.getVersioningData(
            currentApiVersion,
            "Symbol",
            requestsV2Id,
            routeValues,
            queryValues);

        const url = verData.requestUrl!;
        const options: restClient.IRequestOptions = this.createRequestOptions('application/json', verData.apiVersion);
        const res = await this.rest.get<SymbolInterfaces.Request>(url, options);

        return this.formatResponse(res.result, null, false);
    }

    /** finalizeRequest */
    public async finalizeRequest(requestId: string, expirationDate: Date | undefined, isUpdateOperation: boolean): Promise<SymbolInterfaces.Request> {
        const routeValues = {
            resource: "requests",
            requestId: requestId
        }

        const request = {
            id: requestId,
            status: isUpdateOperation ? SymbolInterfaces.RequestStatus.None : SymbolInterfaces.RequestStatus.Sealed,
            expirationDate: expirationDate
        };

        const verData: VsoClient.ClientVersioningData = await this.vsoClient.getVersioningData(
            currentApiVersion,
            "Symbol",
            requestsV2Id,
            routeValues);

        const url = verData.requestUrl!;
        const options: restClient.IRequestOptions = this.createRequestOptions('application/json', verData.apiVersion);
        const res = await this.rest.update<SymbolInterfaces.Request>(url, request, options);

        return this.formatResponse(res.result, null, false);
    }
}
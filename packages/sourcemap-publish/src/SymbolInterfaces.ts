import { ResourceBase } from "./WebApi";

export interface Request extends ResourceBase {
    /** An optional human-facing description. */
    description?: string;

    /** An optional expiration date for the request. The request will become inaccessible and get deleted after the date, 
     *  regardless of its status.
     *  
     *  On an HTTP POST, if expiration date is null/missing, the server will assign a default expiration data (30 days unless 
     *  overwridden in the registry at the account level). On PATCH, if expiration date is null/missing, the behavior is to 
     *  not change whatever the request's current expiration date is.
     **/
    expirationDate?: Date;

    /** A human-facing name for the request. Required on POST, ignored on PATCH. **/
    name: string,

    /** The Domain Id where this request lives. This property should not be null. **/
    domainId: number,

    /** The status for this request. **/
    status?: RequestStatus,

    /** The total Size for this request. **/
    size?: number,

    /** Indicates if request should be chunk dedup **/
    isChunked: boolean
}

export enum RequestStatus {
    /**
     * The status of this request is undefined or irrelevant in the current context.
     */
     None = 0,
    /**
     * The request is created, and is open to accepting debug entries.
     */
     Created = 1,
    
     // InProgress  = 2, removed
    
     /**
     * The request is sealed. No more debug entries can be added to it.
     */
     Sealed = 3,
    /**
     * The request is no longer available, possibly deleted.
     */
     Unavailable = 4,
}

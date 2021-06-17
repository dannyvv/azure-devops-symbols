import * as chalk from 'chalk';
import * as yargs from 'yargs';

import { ConnectionOptions, getWebApi } from './WebApi';
import { Request } from './SymbolInterfaces';
import { ISymbolApi } from './SymbolApi';
import path = require('path');
import glob = require('glob');
import oboe = require('oboe');
import * as sourceMap from 'sourcemap';

function fail(message: string): never {
  console.error(chalk.red(message));
  process.exit(1);
}

const argv = yargs.options({
  // ConnectionOptions
  serverUrl: {
    type: 'string',
    describe: 'Name of the azure devops organization. i.e. https://dev.azure.com/MyOrg',
  },
  token: {
    type: 'string',
    describe: 'Personal Access Token to authenticated with Azure DevOps',
  },
  // PublishOptions
  name: {
    alias: 'n',
    type: 'string',
    describe: 'Name of new request to create.'
  },
  chunkDedup: {
    type: 'boolean',
    describe: 'Use chunk-level deduplication.',
  },
  directory: {
    alias: 'd',
    type: 'string',
    describe: 'Root directory to upload.'
  },
  expirationInDays: {
    type: 'number',
    description: 'Expiration time in days. May not be combined with expirationDate.'
  },
  expirationDate: {
    description: 'Expiration date in UTC. May not be combined with expirationInDays.',
  },
  append: {
    type: 'boolean',
    describe: 'Allows appending to an existing, non-finalized request.',
    default: false
  }
})
.coerce({
  expirationDate: val => new Date(Date.parse(val))
})
.argv;

interface PublishOptions extends ConnectionOptions {
  /** Name of new request to create. */
  name: string,
  /** Use chunk-level deduplication. */
  chunkDedup?: boolean,
  /** Root directory to upload. */
  directory: string,
  /** Expiration time in days. May not be combined with expirationDate. */
  expirationInDays?: number,
  /** Expiration date in UTC. May not be combined with expirationInDays. */
  expirationDate?: Date,
  /** Allows appending to an existing, non-finalized request. */
  append?: boolean;
}

function getWebApiType(typeName: string) {
  return `Microsoft.VisualStudio.Services.Symbol.WebApi.${typeName}, Microsoft.VisualStudio.Services.Symbol.WebApi, Version=14.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a`;
}
const requestExistsException = getWebApiType('RequestExistsException');

async function publish(options: PublishOptions): Promise<void> {
  const webApi = await getWebApi(options);
  var symbolApi = await webApi.getSymbolApi();

  const request = await createRequest(symbolApi, options);
  console.log(JSON.stringify(request));

  const jsMapFiles = glob.sync(path.join(options.directory, "*.js.map"));
  for (var jsMap of jsMapFiles) {
    const debugEntries = await generateDebugEntriesAsync(jsMap);
    let blobId: string | undefined = undefined;
    if (debugEmtries?.length > 0) {

    }
    for (var debugEntry of debugEmtries) {

    }
    // GenerateDebugEntriesAsync
    // GetFileBlobIdentifierAsync
    // PublishMetadataBatchAsync
    // var uploadedBlob = this.Operations.UploadFileAsync(initialEntry.File, initialEntry.DebugEntry.BlobUri, cancellationToken).GetAwaiter().GetResult();
    // uploadedBlob.UpdateDebugEntryBlobReference(initialEntry.DebugEntry);
    // this.Operations.PublishMetadataBatchAsync
  }

  const r2 = await finalizeRequest(symbolApi, request, options)
  console.log(JSON.stringify(r2));
}

async function generateDebugEntriesAsync(file: string) : Promise<DebugEntryData[]> {
  if (file.toLowerCase().endsWith(".js.map")) {
    const clientKey = await new Promise((resolve, reject) => {
      let result : string | undefined = undefined;
      let parser = oboe(file);
      parser
        .node(sourceMap.sourceMapClientKeyField, function (value) {
          result = value;
          parser.abort();
        })
        .done(result => resolve(result))
        .fail(err => reject(err));
      });

      if (clientKey)  {
        return [
          <DebugEntryData>{
            blobId: undefined,
            clientKey: clientKey,
            informationLevel: DebugInformationLevel.private
          }
        ]
      }
  }

  return [];
}

interface DebugEntryData {
  blobId: string | undefined,
  clientKey: string,
  informationLevel: DebugInformationLevel
}

enum DebugInformationLevel {
  /**
   * If set, the .pdb file contains no debug information.
   */
  none = 0x0000,

  /**
   * If set, the .pdb file contains debug information which is binary.
   */
  binary = 0x0001,

  /**
   * If set, the .pdb file contains public symbols.
   */
  publics = 0x0004,

  /**
   * If set, the .pdb file contains trace format.
   */
  traceFormatPresent = 0x0008,

  /**
   * If set, the .pdb file contains type information.
   */
  typeInfo = 0x0010,

  /**
   * If set, the .pdb file contains line number information.
   */
  lineNumbers = 0x0040,

  /**
   * If set, the .pdb file contains symbol information.
   */
  globalSymbols = 0x0100,

  /**
   * If set, the .pdb file contains public symbols and has type, line number and symbol information.
   */
  private = publics | typeInfo | lineNumbers | globalSymbols,

  /**
   * If set, the .pdb file supports the source server.
   */
  sourceIndexed = 0x0400
}

async function createRequest(symbolApi: ISymbolApi, options: PublishOptions): Promise<Request> {
  let request: Request;

  try {
    request = await symbolApi.createRequest({
      name: options.name,
      isChunked: !!options.chunkDedup,
      domainId: 0,
    });

    console.log(`Request '${request.name}' has been assigned Id '${request.id}'`)
  }
  catch (e) {
    if (options.append && e.result?.typeName === requestExistsException) {
      request = await symbolApi.createRequestByName(options.name);
      console.log(`Using previously created request '${request.name}' with Id '${request.id}'`);
    }
    else {
      throw e;
    }
  }

  return request;
}

async function finalizeRequest(symbolApi: ISymbolApi, request: Request, options: PublishOptions): Promise<Request> {

  let actualExpiration : Date | undefined = undefined;
  if (options.expirationDate) {
    actualExpiration = options.expirationDate;
  }
  else if (options.expirationInDays) {
    const today = new Date();
    actualExpiration = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDay() + options.expirationInDays)
  }
  
  return await symbolApi.finalizeRequest(request.id!, actualExpiration, false)
}

publish(<PublishOptions>argv)
  .catch(err => fail(err));

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.AzureDevOps.Symbols.Core;
using Microsoft.VisualStudio.Services.Common;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols.Options
{
    public class PublishAction
    {
        public async Task<bool> PerformAction(PublishOptions options, CancellationToken cancellationToken)
        {
            var credentials = new VssBasicCredential(string.Empty, options.Pat);
            using (ISymbolServiceClient symbolClient = new SymbolServiceClient(new Uri(options.EndPoint), credentials, cancellationToken))
            {
                var request = await symbolClient.CreateRequestAsync(options.Name, options.Append);
            }

            return true;
        }
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.AzureDevOps.Symbols.WebApi;
using Microsoft.VisualStudio.Services.Common;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols.Core
{
    public class SymbolServiceClient : ISymbolServiceClient, IDisposable
    {
        private CancellationToken m_cancellationToken;

        public SymbolServiceClient(Uri symbolServiceLocation, VssCredentials credentials, CancellationToken cancellationToken)
        {
            m_cancellationToken = cancellationToken;
        }

        public Task<Request> CreateRequestAsync(string name, bool append)
        {
            throw new NotImplementedException();
        }

        public void Dispose()
        {
            throw new NotImplementedException();
        }
    }
}

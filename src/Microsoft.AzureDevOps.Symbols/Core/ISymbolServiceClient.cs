// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using Microsoft.AzureDevOps.Symbols.WebApi;
using System;
using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols.Core
{
    public interface ISymbolServiceClient : IDisposable
    {
        Task<Request> CreateRequestAsync(string name, bool append);
    }
}

// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols
{
    public interface ISymbolIndexer
    {
        public Task<IndexedSymbol?> TryExtractClientKey(string filePath);
    }
}

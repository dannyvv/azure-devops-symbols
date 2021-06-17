// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols.SymbolIndexers
{
    public class SourceMapIndexer : ISymbolIndexer
    {
        public Task<IndexedSymbol?> TryExtractClientKey(string filePath)
        {
            throw new System.NotImplementedException();
        }
    }
}

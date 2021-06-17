// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using CommandLine;

namespace Microsoft.AzureDevOps.Symbols.Options
{
    public class EndPointOptions
    {
        [Option('e', "endPoint", HelpText = "Url of the ado endpoint")]
        public string EndPoint { get; set; }

        [Option('p', "pat", HelpText = "PAT, Personal Access Token to authenticated with ADO")]
        public string Pat { get; set; }
    }
}

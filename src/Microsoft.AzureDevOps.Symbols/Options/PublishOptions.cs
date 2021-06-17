// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using CommandLine;
using System;

namespace Microsoft.AzureDevOps.Symbols.Options
{
    [Verb("publish", HelpText = "Create a new symbol request, upload files to it, and finalize it.")]
    public class PublishOptions : EndPointOptions
    {
        [Option('n', "name", HelpText = "Name of new request to create.")]
        public string Name {get;set;}

        [Option('a', "append", Required = false, HelpText = "Allows appending to an existing, non-finalized request.")]
        public bool Append { get; set; }

        [Option('d', "directory", Required = true, HelpText = "Root directory to upload.")]
        public string RootDirectory { get; set; }

        [Option('f', "fileListFileName", Required = false, HelpText = "Filename of file containing the list of files to upload, All files should be in the directory specified by -d")]
        public string FileListFileName { get; set; }

        [Option("expirationInDays", Required = false, HelpText = "Expiration time in days. May not be combined with expirationDate.")]
        public uint? ExpirationInDays { get; set; }

        [Option("expirationDate", Required = false, HelpText = "Expiration date in UTC. May not be combined with expirationInDays.")]
        public DateTime? ExpirationDate { get; set; }


        public Diagnostic? Validate()
        {
            if (ExpirationInDays.HasValue && ExpirationDate.HasValue)
            {
                return Diagnostic.InvalidParameterBothExpirationFormats;
            }

            return null;
        }
    }
}

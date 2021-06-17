using System;
using System.Collections.Generic;

namespace Microsoft.AzureDevOps.Symbols.WebApi
{
    public class WrappedException
    {
        public Dictionary<string, object> CustomProperties { get; set; }

        public WrappedException InnerException { get; set; }

        public Exception UnwrappedInnerException { get; set; }

        public string Message { get; set; }

        public string HelpLink { get; set; }

        public String TypeName { get; set; }

        public String TypeKey { get; set; }

        public int ErrorCode { get; set; }

        public int EventId { get; set; }

        public string StackTrace { get; set; }
    }
}

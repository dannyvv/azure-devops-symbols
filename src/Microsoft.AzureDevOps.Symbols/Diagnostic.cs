namespace Microsoft.AzureDevOps.Symbols
{
    public struct Diagnostic
    {
        public string Message { get; }

        private Diagnostic(string message)
        {
            Message = message;
        }

        public static Diagnostic InvalidParameterBothExpirationFormats = new Diagnostic("Invalid parameter. Both parameters 'expirationInDays' and 'expirationDate' are specified. Only one of them is allowed.");
    }
}

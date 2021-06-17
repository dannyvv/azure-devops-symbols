// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

using CommandLine;
using Microsoft.AzureDevOps.Symbols.Options;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace Microsoft.AzureDevOps.Symbols
{
    class Program
    {
        static int Main(string[] args)
        {
            return Parser.Default.ParseArguments<PublishOptions>(args)
                .MapResult(
                    (PublishOptions options) => Main(options, PublishAction.PerformAction),
                    errs => 1);
      
        }

        static int Main<TOptions>(TOptions options, Func<TOptions, CancellationToken, Task<bool>> performAction)
        {
            var cancellationTokenSource = new CancellationTokenSource();
            var cancelKeyPressHandler = new ConsoleCancelEventHandler((sender, args) =>
            {
                cancellationTokenSource.Cancel();
                args.Cancel = true;
            });

            Console.CancelKeyPress += cancelKeyPressHandler;
            try
            {
                var result = await performAction(options, cancellationTokenSource.Token);
                if (!result)
                {
                    return 1;
                }
            }
            catch(Exception e)
            {
                Console.Error.WriteLine("Error: ");
                return 1;
            }
            finally
            {
                Console.CancelKeyPress -= cancelKeyPressHandler;
                cancellationTokenSource.Dispose();
            }
            
            return 0;
        }
    }
}

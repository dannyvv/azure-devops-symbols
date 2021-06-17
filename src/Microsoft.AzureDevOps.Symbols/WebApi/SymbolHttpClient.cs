using Microsoft.VisualStudio.Services.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web;

namespace Microsoft.AzureDevOps.Symbols.WebApi
{
    public class SymbolHttpClient
    {
        private const string apiVersion = "2.0-preview";
        private const string usageAgent = "$TODO";
        private const string jsonMediaType = "application/json";
        private const string apiVersionHeaderKey = "api-version";
        private const string apiVersionHeaderValueSymbols = "2.0-preview";

        private const string TfsServiceError = "X-TFS-ServiceError";

        // ServicePoint defaults
        private const int keepAliveTime = 30000;
        private const int keepAliveInterval = 5000;

        private HttpClient m_client;
        private Uri m_baseAddress;
        private CancellationToken m_cancellationToken;

        public SymbolHttpClient(VssCredentials credentials, Uri baseAddress, CancellationToken cancellationToken)
        {
            m_cancellationToken = cancellationToken;
            m_baseAddress = baseAddress;

            var pipeline = HttpClientFactory.CreatePipeline(
                new VssHttpMessageHandler(credentials, new VssHttpRequestSettings()),
                new[]
                {
                    new VssHttpRetryMessageHandler(5)
                }
            );

            m_client = new HttpClient(pipeline, disposeHandler: true)
            {
                BaseAddress = baseAddress
            };
            
            var servicePoint = ServicePointManager.FindServicePoint(baseAddress);
            servicePoint.UseNagleAlgorithm = false;
            servicePoint.SetTcpKeepAlive(
                enabled: true,
                keepAliveTime: keepAliveTime,
                keepAliveInterval: keepAliveInterval);
        }

        public Task<Request> CreateRequestAsync(Request request)
        {
            return this.PostAsync<Request, Request>("/_apis/Symbol/requests", request);
        }

        #region Raw HTTP operations
        protected async Task<TResult> PostAsync<T, TResult>(string requestPath, T value)
        {
            var locationUri = ConcatUri(m_baseAddress, requestPath);
            var requestMessage = new HttpRequestMessage(HttpMethod.Post, locationUri.AbsoluteUri)
            {
                Headers =
                {
                    Accept =
                    {
                        new MediaTypeWithQualityHeaderValue(jsonMediaType)
                        {
                            Parameters = {
                                new NameValueHeaderValue(apiVersionHeaderKey, apiVersionHeaderValueSymbols)
                            }
                        }
                    },
                    UserAgent =
                    {
                        new ProductInfoHeaderValue($"(NetCoreApp5.0; {RuntimeInformation.OSDescription.Replace('(', '[').Replace(')', ']').Trim()}")
                    },
                }
            };

            // Skipped VssE2EID
            var response = await m_client.SendAsync(requestMessage, HttpCompletionOption.ResponseContentRead, m_cancellationToken).ConfigureAwait(false);
            var isJsonResonse = IsJsonResponse(response);

            if (!response.IsSuccessStatusCode)
            {
                // TODO: Consider special handling for System.Net.HttpStatusCode.ProxyAuthenticationRequired
                if (isJsonResonse)
                {
                    var wrappedException = await response.Content.ReadAsAsync<WrappedException>();
                    throw new Exception($"Request Error: {response.StatusCode} - {wrappedException.Message}");
                    
                } 
                else if (response.Headers.TryGetValues(TfsServiceError, out var serviceErrors))
                {
                    throw new Exception($"Request Error: {response.StatusCode} - {HttpUtility.UrlDecode(serviceErrors.FirstOrDefault())}");
                }
                else
                {
                    throw new Exception($"Request Error: {response.StatusCode}");
                }
            }
            if (isJsonResonse)
            {
                var result = await response.Content.ReadAsAsync<TResult>();
                
                // $TODO: Handle pagination of response?

                return result;
            } 
            else if (HasContent(response))
            {
                throw new Exception($"Invalid response content type {response.Content?.Headers?.ContentType?.MediaType ?? "Unknown"}");
            }
            else
            {
                return default(TResult);
            }
        }

        public static Uri ConcatUri(Uri baseUri, String relativeUri)
        {
            StringBuilder sbCombined = new StringBuilder(baseUri.GetLeftPart(UriPartial.Path).TrimEnd('/'));
            sbCombined.Append('/');
            sbCombined.Append(relativeUri.TrimStart('/'));
            sbCombined.Append(baseUri.Query);
            return new Uri(sbCombined.ToString());
        }

        private Boolean HasContent(HttpResponseMessage response)
        {
            if (response != null &&
                response.StatusCode != HttpStatusCode.NoContent &&
                response.RequestMessage?.Method != HttpMethod.Head &&
                response.Content?.Headers != null &&
                (!response.Content.Headers.ContentLength.HasValue ||
                 (response.Content.Headers.ContentLength.HasValue && response.Content.Headers.ContentLength != 0)))
            {
                return true;
            }

            return false;
        }

        private Boolean IsJsonResponse(
            HttpResponseMessage response)
        {
            if (HasContent(response)
                && response.Content.Headers != null && response.Content.Headers.ContentType != null
                && !String.IsNullOrEmpty(response.Content.Headers.ContentType.MediaType))
            {
                return (0 == String.Compare("application/json", response.Content.Headers.ContentType.MediaType, StringComparison.OrdinalIgnoreCase));
            }

            return false;
        }
    }
}

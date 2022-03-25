// Only use the static one for types, so that we can use the dynamic version of webpack we get from the plugin intialization
import * as webpackTypes from "webpack";
// import * as path from "path";
// import { computeSourceMapUrlLine, setClientKeyOnSourceMap } from "azure-devops-symbols-sourcemap";

const pluginName = "AzureDevOpsSymbolsPlugin";

export interface AzureDevOpsSymbolsPluginOptions {
    organization: string;
}

export class AzureDevOpsSymbolsPlugin
{
    organization: string = "<Organization>";
    
    constructor(options?: AzureDevOpsSymbolsPluginOptions)
    {
        if (options) {
            this.organization = options.organization;
        }
    }

    apply(compiler: webpackTypes.Compiler) {

        // ensure proper runtime version of webpack is used below
        const { options } = compiler;

        const devtool = options.devtool as string;

        // If we don't have source-map as a dev-tool this plugin doesn't need to do anything
        if (!devtool || !devtool.includes("source-map")) {
            return;
        }

        const hidden = devtool.includes("hidden");
        if (!hidden) {
            throw new Error(`When using plugin ${pluginName} you must set 'hidden' on the 'devtool' settings to true. To avoid declaring two sourcemap comments.`)
        }

        // The options we pass to extract the source map must match exactly what SourceMapDevToolPlugin
        // does internally, because else when we ask to get the sourcemap object we get a newly
        // computed one with differnt options, so when we add the extra fields, they won't be
        // in the final .js.map file
        const cheap = devtool.includes("cheap");
        const moduleMaps = devtool.includes("module");
        const sourceMapOptions = {
            module: moduleMaps ? true : cheap ? false : true,
            columns: cheap ? false : true,
        };

        compiler.hooks.compilation.tap(pluginName, 
            <(compilation: webpackTypes.compilation.Compilation) => { normalModuleFactory: webpackTypes.compilation.NormalModuleFactory; }>(compilation => {
                compilation.hooks.afterOptimizeChunkAssets.tap(
                    {
                        name: pluginName,
                        // This should run just before the CommonJsChunkFormatPlugin runs
                        stage: 499,//compilation.PROCESS_ASSETS_STAGE_DEV_TOOLING - 1,
                    },
                    () => {
                        let assets = compilation.assets;
                        for (const file of Object.keys(assets)) {
                            //let asset = compilation.getAsset(file);
                            let asset = assets[file];
                            if (asset) {
                                const sourceMap = asset.source.map(sourceMapOptions);
                                if (sourceMap){
                                    throw "Got SourceMap";
                                    // // Compute the hash of the sourcefile (before appending the sourceUrl comment)
                                    // const hash = compiler.webpack.util.createHash(compilation.outputOptions.hashFunction || "md4")
                                    // asset.source.updateHash(hash);
                                    // const clientKey = <string>hash.digest("hex");

                                    // console.log(`Tagging sourcemap with ${clientKey} to ${asset.name}`);

                                    // // Add the sourcemap client id field to the sourcemap json object.
                                    // setClientKeyOnSourceMap(clientKey, sourceMap);

                                    // const sourceMapFileName = path.basename(file) + ".map";
                                    // const sourceMapLineToAppend = computeSourceMapUrlLine(this.organization, clientKey, sourceMapFileName);
                                    
                                    // const source = new webpack.sources.SourceMapSource(asset.source.buffer(), asset.name, sourceMap, undefined, undefined, true);
                                    // compilation.updateAsset(
                                    //     asset.name,
                                    //     source,
                                    //     info => Object.assign(info, {adoSourecMapEnabled: true, related: {sourceMapLineToAppend: sourceMapLineToAppend, clientKey: clientKey}})
                                    // );
                                }
                            }
                        }
                    });

                    // compilation.hooks.processAssets.tapPromise(
                    //     {
                    //         name: pluginName,
                    //         stage: webpack.Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE,
                    //         additionalAssets: true
                    //     },
                    //     async (assets) => {
                    //         for (const file of Object.keys(assets)) {
                    //             let asset = compilation.getAsset(file);
                    //             if (asset && asset.info.related && asset.info.related.sourceMapLineToAppend) {
                    //                 console.log(`Adding SourceMap comment to ${asset.name}`);
                    //                 const content = <string>asset.info.related.sourceMapLineToAppend;

                    //                 compilation.updateAsset(
                    //                     file, 
                    //                     source => new webpack.sources.ConcatSource(source, content), 
                    //                     undefined
                    //                 );
                    //             }
                    //         }
                    //         throw "processAsset2 hooked";
                    //     });

                    // compilation.hooks.statsPrinter.tap(
                    //     {
                    //         name: pluginName,
                    //     },
                    //     stats => {
                    //         const id = (x: string) => x
                    //         stats.hooks.print
                    //             .for("asset.info.related.sourceMapLineToAppend")
                    //             .tap(pluginName, (sourceMapLineToAppend, {cyan, formatFlag}) => sourceMapLineToAppend ? (cyan || id) ( (formatFlag || id) ("azure sourcemap")) : "");
                    //             throw "statsPrinter hooked";
                    //         });
            }));
    }
}

export function workerCode() {
    self.document = {}; // Workaround for "ReferenceError: document is not defined" in hpccWasm
    var hpccWasm;

    self.onmessage = function(event) {
        if (event.data.vizURL) {
            importScripts(event.data.vizURL);
            hpccWasm = self["@hpcc-js/wasm"];
            hpccWasm.wasmFolder(event.data.vizURL.match(/.*\//));
    // This is an alternative workaround where wasmFolder() is not needed
    //                    document = {currentScript: {src: event.data.vizURL}};
            self.fetch = function() {
                return new Promise((resolve, reject) => {
                    resolve(new Response(event.data.wasmCode));
                });
            }
        }
        hpccWasm.graphviz.layout(event.data.dot, "svg", event.data.engine, event.data.options).then((svg) => {
            if (svg) {
                self.postMessage({
                    type: "done",
                    svg: svg,
                });
            } else if (event.data.vizURL) {
                self.postMessage({
                    type: "init",
                });
            } else {
                self.postMessage({
                    type: "skip",
                });
            }
        }).catch(error => {
            self.postMessage({
                type: "error",
                error: error.message,
            });
        });
    }
}
module.exports = function(RED) {
    function RScriptNode(config) {
        RED.nodes.createNode(this, config);
        const script = config.script;
        const rserver = RED.nodes.getNode(config.RServer);
        

        if (rserver) {
            const node = this;
            rserver.register(this);

            node.on('input', (msg) => {
                try {
                    let jsonStr = JSON.stringify(msg.payload);
                    jsonStr = jsonStr.replace(/'/g, "\\'"); // escape ';
                    rserver.evaluate(
                    `
                        library(RJSONIO)
                        payload <- fromJSON('${jsonStr}')
                        ${script}
                        toJSON(payload)
                    `,
                    (error, payload) => {
                        if (!error) {
                            msg.payload = JSON.parse(payload);
                            node.send(msg);
                        } else {
                            node.error(`Could not execute R Script: ${error}`);
                        }
                    })
                } catch (error) {
                   node.error(`An unexpected error occured: ${error}`);
                }
            })

            node.on('close', (done) => {
                rserver.deregsiter(node, done);
            })
        }
    }
    RED.nodes.registerType("R Script", RScriptNode);
}

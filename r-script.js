module.exports = function(RED) {
    function RNode(config) {
        RED.nodes.createNode(this, config)

        this.script = config.script
        this.RServer = RED.nodes.getNode(config.RServer)
        this.RServer.register(this)

        this.on('input', (msg) => {
            var jsonStr = JSON.stringify(msg)
            jsonStr = jsonStr.replace(/'/g, "\\'") // escape '
            this.RServer.evaluate(
            `
                library(RJSONIO);
                msg <- fromJSON('${jsonStr}');
                ${this.script}
                msg_json <- toJSON(msg);
            `, (err, msg) => {
                if (!err) {
                    this.send(JSON.parse(msg))
                } else {
                    this.error(`Could not execute R Script: ${err}`)
                }
            })
        })

        this.on('close', (done) => {
            this.RServer.deregsiter(node, done)
        })
    }
    RED.nodes.registerType("R Script", RNode);
}

module.exports = function(RED) {
    "use strict"

    var r = require('rserve-client')

    function RServer(config) {
        RED.nodes.createNode(this, config)

        // States
        this.connected = false
        this.closing = false

        this.users = {}

        this.register = (rNode) => {
            this.users[rNode.id] = rNode
            if (Object.keys(this.users).length === 1) {
                this.connect()
            }
        }

        this.deregister = (rNode, done) => {
            delete this.users[rNode.id];
            if (!this.connected) {
                done()
            }
            if (Object.keys(this.users).length === 0) {
                this.disconnect()
            }
            done()
        }

        this.connectionEstablished = (err, client) => {
            if (!err) {
                this.client = client
                this.connected = true
                for (var id in this.users) {
                    if (this.users.hasOwnProperty(id)) {
                        this.users[id].status({fill: "green", shape: "dot", text: "node-red:common.status.connected"})
                    }
                }
            } else {
                this.error(`Could not connect to R: ${err}`)
                this.connected = false
                for (var id in this.users) {
                    if (this.users.hasOwnProperty(id)) {
                        this.users[id].status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
                    }
                }
            }
        }

        this.connect = () => {
            if (!this.connected) {
                r.connect(config.host, config.port, this.connectionEstablished)
            }
        }

        this.disconnect = () => {
            this.client.end()
            this.connected = false
            for (var id in this.users) {
                if (this.users.hasOwnProperty(id)) {
                    this.users[id].status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
                }
            }
        }

        this.on('close', (done) => {
            if (this.connected) {
                this.disconnect
            }
            done()
        })

        this.evaluate = (cmd, cb) => {
            if (!this.client) {
                this.connect()
                return cb(new Error('No connection to R-Server established yet'), null)
            }

            this.client.evaluate(cmd, (err, ans) => {
                if (!err) {
                    if (!this.connected) {
                        // Server could reconnect
                        this.connectionEstablished(err, this.client)
                    }
                    const msg = JSON.parse(ans)
                    cb(null, msg)
                } else {
                    if (err.code === "ECONNREFUSED") {
                        this.connected = false
                        for (var id in this.users) {
                            if (this.users.hasOwnProperty(id)) {
                                this.users[id].status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
                            }
                        }
                    }
                    cb(err, null)
                }
            })
        }
    }
    RED.nodes.registerType("R Server", RServer)
}
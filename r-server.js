module.exports = function(RED) {
    "use strict"

    var r = require('rio');

    function RServer(config) {
        RED.nodes.createNode(this, config);

        this.host = config.host || '127.0.0.1';
        this.port = config.port || 6311;

        this.user = this.credentials?.username || '';
        this.password = this.credentials?.password || '';

        this.connected = false;
        this.nodes = {};

        this.register = (rNode) => {
            this.nodes[rNode.id] = rNode;
        }

        this.deregister = (rNode, done) => {
            delete this.nodes[rNode.id];
            done();
        }

        this.evaluate = (cmd, cb) =>  {
            config = {
                command: cmd,
                callback: (err, message) => {
                    if (!err && !this.connected) {
                        this.connected = true
                        for (var id in this.nodes) {
                            if (this.nodes.hasOwnProperty(id)) {
                                this.nodes[id].status({fill: "green", shape: "dot", text: "node-red:common.status.connected"});
                            }
                        }
                    } else if (err && err.code === "ECONNREFUSED") {
                        this.connected = false
                        for (var id in this.nodes) {
                            if (this.nodes.hasOwnProperty(id)) {
                                this.nodes[id].status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
                            }
                        }
                    } else if (!this.connected) {
                        for (var id in this.nodes) {
                            if (this.nodes.hasOwnProperty(id)) {
                                this.nodes[id].status({fill:"red",shape:"ring",text:"node-red:common.status.disconnected"});
                            }
                        }
                        this.error("Unknown error.");
                    }
                    cb(err, message)
                },

                host: this.host,
                port: this.port,

                user: this.user,
                password: this.password
            }

            r.evaluate(config);
        }
    }

    RED.nodes.registerType("R Server", RServer, {
        credentials: {
            username: {type: "text"},
            password: {type: "password"}
        }
    })
}

/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: A complete dms-handler. Send and receive json-payload to dms
 */

const DmsHandler = require('./lib/DmsHandler');

module.exports = function (RED) {
    function DmsWriteNode(config) {

        var node = this;

        RED.nodes.createNode(this, config);
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);
        
        if (this.server) {           
            var dmshandler = new DmsHandler( node, config )

            this.on("close", function(done) {
                dmshandler.setIsDeploying(true)
                dmshandler.disconnect(function(){
                    dmshandler.setIsDeploying(false)
                    done()
                });
            });

            dmshandler.connect(function(){
                node.on('input', function(msg){
                    dmshandler.sendWs(
                        {
                            "whois":"WriteToDms_" + Date().valueOf(),
                            "user":"",
                            "set": [
                                {
                                "path":config.path,
                                "value":parseDatatype(config.datatype, msg.payload)
                                }
                            ]
                    
                        }
                    )
                })
            });
        } else {
            // No config node configured
            node.send({ err : "Please configure a server." })
        }

    }

    RED.nodes.registerType("dms-write", DmsWriteNode);
}


function parseDatatype( type, value){
    switch(type){
        case 'integer':
        return parseInt(value)
        break
        case 'float':
        return parseFloat(value)
        break
        case 'string':
        return String(value)
        break
        case 'boolean':
        return (value === 'true') || (value > 0);
        break
        default:
        return value
        break

    }
}
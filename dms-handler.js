/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: A complete dms-handler. Send and receive json-payload to dms
 */

const DmsHandler = require('./lib/DmsHandler');

module.exports = function (RED) {
    function DmsHandlerNode(config) {

        var node = this;

        RED.nodes.createNode(this, config);
        // Retrieve the config node
        this.server = RED.nodes.getNode(config.server);
        try{
            config.payload = JSON.parse(config.payload)
        }
        catch(e){
            console.info(e)
        }
        
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
                    if(typeof msg.payload === 'object'){
                        dmshandler.sendWs(
                            msg.payload
                        )
                    }
                })
            });

        } else {
            // No config node configured
            node.send({ err : "Please configure a server." })
        }

    }

    RED.nodes.registerType("dms-handler", DmsHandlerNode);
}

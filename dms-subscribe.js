/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: Subscribe a path or multiples from the dms
 */

const DmsHandler = require('./lib/DmsHandler');

module.exports = function (RED) {
    function DmsHandlerNode(config) {
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

            let msg = {
                    subscribe: []
            }

            try{
                config.payload = JSON.parse(config.payload)
            }
            catch(e){
                console.info(e)
            }

            if(typeof config.payload === 'string'){
                config.payload = [config.payload]
            }

            if(Array.isArray(config.payload)){

                for(let i = 0; i < config.payload.length; i++){
                    msg.subscribe.push({
                        path:config.payload[i],
                        event: (config.subscribedEvent || 'onChange'),
                        query: {
                            maxDepth: 0
                        }
                    })
                }

                config.payload = msg
                dmshandler.connect();

            }
            else{
                node.send({ err : "Error datatype payload. Use string or array." } )
            }



        } else {
            // No config node configured
            node.send({ err : "Please configure a server." } )
        }



    }


    RED.nodes.registerType("dms-subscribe", DmsHandlerNode);
}

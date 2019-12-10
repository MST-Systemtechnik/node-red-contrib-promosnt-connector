/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: DMS-Handler-Class for the websocket-connection and the node-red
 */


const WebSocket = require('ws');

class DmsHandler {
    constructor( node, config ){
        this.node = node
        this.config = config
        this.client = null;
        this.timeoutid = null
        this.reconnects = 0
        this.isDeploying = false
        this.connection = null
        this.closeCallback = function(){}
    }

    setIsDeploying( state ){
        this.isDeploying = state || true
    }

    getIsDeploying(){
        return this.isDeploying
    }
    /**
     * Concatenate the url for the connection
     */
    concatUrl(){
        return 'ws://' + this.node.server.host + ':' + this.node.server.port + this.node.server.path
    }

    /**
     * Connecting to the websocket-server and handler the events. When a close or error-event is fired, reconnect.
     */
    connect( callback ){
        let self = this
        callback = callback || function(){}
        this.client = new WebSocket( this.concatUrl() );

        this.reconnects++

        this.nodeStatus('yellow', 'ring', 'connecting... [ ' + this.reconnects + ' ]');

        // Connection is open
        this.client.on('open', function open(connection) {
            self.connection = connection
            self.nodeStatus('green', 'dot', 'open');
            self.reconnects = 0
            if (self.config.payload) {
                self.sendWs( self.config.payload )
            }

            callback()
        })

        // Messages arrives
        this.client.on('message', function incoming(data) {
            self.sendNode( data )
        });

        // Connection is closed
        this.client.on('close', function close() {
            self.nodeStatus('red', 'ring', 'closed');

            if( self.getIsDeploying() ){
                self.closeCallback.call()
            }
            else{
                self.reconnect()
            }
        });


        // Connection has error, will be invoked when a timeout arrived or other socket error.
        this.client.on('error', function error(e) {
            self.nodeStatus('red', 'ring', 'error');
            self.node.send( self.nodeErr('websocket error:' + e) )
            self.reconnect()
        });


    }

    disconnect( callback ){
        this.client.close()
        this.closeCallback = callback || function(){}
    }



    /**
     * Reconnect with a timeout for 1s. Use the default delay approx. 30-60s.
     */
    reconnect(){
        clearTimeout(this.timeoutid)
        this.disconnect()
        this.timeoutid = setTimeout(this.connect.bind(this), 1000);
    }

    /**
     * Change the node status in the node-red window
     * @param {string} fill 
     * @param {string} shape 
     * @param {string} text 
     */
    nodeStatus( fill, shape, text ){
        this.node.status({ fill: fill, shape: shape, text: text });
    }

    /**
     * Send payload to websocket-server
     * @param {object} payload 
     */
    sendWs( payload ){
        try {
            this.client.send(Buffer.from(JSON.stringify(payload)))
        }
        catch (e) {
            this.node.send( this.nodeErr(e) )
        }
    }

    /**
     * Send payload to node-red
     * @param {object} payload 
     */
    sendNode( payload ){
        try {
            payload = JSON.parse( payload )
            this.node.send( this.nodePayload( payload ) )
        }
        catch (e) {
            this.node.send( this.nodeErr(e) )
        }
    }

    /**
     * Create the payload-package for node-red
     * @param {object} data 
     */
    nodePayload(data) {
        return { payload: data }
    }
    
    /**
     * Create a error-package for node-red
     * @param {string} str 
     */
    nodeErr(str) {
        return { err: str }
    }
   
}


module.exports = DmsHandler

    






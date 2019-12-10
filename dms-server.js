/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: Configuration for the server
 */

module.exports = function(RED) {
    function RemoteServerNode(n) {
        RED.nodes.createNode(this,n);
        this.host = n.host;
        this.port = n.port;
        this.path = n.path;
    }
    RED.nodes.registerType("dms-server",RemoteServerNode);
}
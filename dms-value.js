/**
 * Author: mst_gruy
 * Date: 18.07.2019
 * Version: 0.1
 * Desription: Get the value from a dms-json-exchange-response by action, path and the key
 */

module.exports = function(RED) {
    function DmsValue(config) {

        RED.nodes.createNode(this,config);
        var node = this

        // Input from node
        node.on('input', function(msg){

            // Check if payload is object and get the data by action provided in node
            if(typeof msg.payload === 'object'){
                

                if(typeof config.action !== 'string'){
                    return null
                }

                if(!config.action){
                    config.action = 'get'
                }

                let action = config.action.replace(/\s/g, "").split(',');

                
                for( let key in action ){

                    var arr = msg.payload[ action[key] ]

                    if(!Array.isArray(arr)){
                        continue
                    }
                    
                    var len = arr.length
                    
                    for(let i = 0; i < len; i++){
                        if( arr[i].path === config.path ){
                            if( config.key.length ){
                                msg.payload = arr[i][ config.key ]
                            }
                            else{
                                msg.payload = arr[i]
                            }
                            node.send(msg)
                            break
                        }
                    }
                }


            }
            else{
                node.send({ err : msg.payload })
            }
        })

    }
    RED.nodes.registerType("dms-value",DmsValue);
}

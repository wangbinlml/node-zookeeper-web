/**
 * Created by root on 9/16/16.
 */
var utils = require('../lib/ZKUtils').create();

var service = {
    "SB":{"args":{"sid": "run-cs","serviceId":"CS_SMS"},"codec":"protobuf", "protocol":"socket","impl":"SocketConnector",
        "routePolicy":"round-robin",
        "instance":[{"ip":"127.0.0.1","port":"9050","sid":"run-sb"}]}
};

//utils.create("/platform/service_sms");
//utils.create("/platform/service_broker/SB");
utils.set("/platform/service_broker/CS_SMS", JSON.stringify(service));
utils.list("/platform");
utils.get("/platform/service_broker/SB");
utils.get("/platform/service_broker/CS_SMS");

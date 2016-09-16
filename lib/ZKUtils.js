/**
 * Created by root on 9/16/16.
 */
var log = require('../lib/logger').getLogger("system");
var properties = require("./Properties");
var zookeeper = require('node-zookeeper-client');
var client;
function ZKUtils() {

}

ZKUtils.prototype = {
    init: function () {
        if (client == undefined)
            client = zookeeper.createClient(properties.get("zk_path"));
    },
    list: function (path) {
        var listChildren = function (client, path) {
            client.getChildren(
                path,
                function (event) {
                    log.info('Got watcher event: %s', event);
                    listChildren(client, path);
                },
                function (error, children, stat) {
                    if (error) {
                        log.info(
                            'Failed to list children of node: %s due to: %s.',
                            path,
                            error
                        );
                        return;
                    }

                    log.info('Children of node: %s are: %j.', path, children,
                        stat.version);
                }
            );
        };

        client.once('connected', function () {
            log.info('Connected to ZooKeeper.');
            listChildren(client, path);
        });

        client.connect();
    },
    create: function (path) {
        client.once('connected', function () {
            log.info('Connected to the server.');
            client.create(path, function (error) {
                if (error) {
                    log.info('Failed to create node: %s due to: %s.', path, JSON.stringify(error));
                } else {
                    log.info('Node: %s is successfully created.', path);
                }

                client.close();
            });
        });
        client.connect();
    },
    exists: function (path) {
        var exists = function (client, path) {
            client.exists(
                path,
                function (event) {
                    log.info('Got event: %s.', event);
                    exists(client, path);
                },
                function (error, stat) {
                    if (error) {
                        log.info(
                            'Failed to check existence of node: %s due to: %s.',
                            path,
                            error
                        );
                        return;
                    }

                    if (stat) {
                        log.info(
                            'Node: %s exists and its version is: %j',
                            path,
                            stat.version
                        );
                    } else {
                        log.info('Node %s does not exist.', path);
                    }
                }
            );
        };

        client.once('connected', function () {
            log.info('Connected to ZooKeeper.');
            exists(client, path);
        });
        client.connect();
    },
    get: function (path) {
        var getData = function (client, path) {
            client.getData(
                path,
                function (event) {
                    log.info('Got event: %s', event);
                    getData(client, path);
                },
                function (error, data, stat) {
                    if (error) {
                        log.info('Error occurred when getting data: %s.', JSON.stringify(error));
                        return;
                    }

                    log.info(
                        'Node: %s has data: %s, version: %d',
                        path,
                        data ? data.toString(): undefined,
                        stat.version
                    );
                }
            );
        };
        client.once('connected', function () {
            log.info('Connected to ZooKeeper.');
            getData(client, path);
        });

        client.connect();

    },
    set: function (path, value) {
        var data = new Buffer(value);
        client.once('connected', function () {
            log.info('Connected to the server.');
            client.setData(path, data, function (error, stat) {
                if (error) {
                    log.info('Got error when setting data: ' + JSON.stringify(error));
                    return;
                }

                log.info(
                    'Set data "%s" on node %s, version: %d.',
                    data.toString(),
                    path,
                    stat.version
                );
                client.close();
            });
        });

        client.connect();
    },
    delete: function (path) {
        client.on('connected', function (state) {
            log.info('Connected to the server.');
            client.remove(path, function (error) {
                if (error) {
                    log.info(
                        'Failed to delete node: %s due to: %s.',
                        path,
                        JSON.stringify(error)
                    );
                    return;
                }

                log.info('Node: %s is deleted.', path);
                client.close();
            });
        });

        client.connect();
    }
};
exports.create = function () {
    var zkUtils = new ZKUtils();
    zkUtils.init();
    return zkUtils;
};
/**
 * Created by root on 9/16/16.
 */
var config = require("../config/config.json");
exports.get = function (key) {
    return config[key];
};
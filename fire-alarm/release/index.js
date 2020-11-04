"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_1 = __importDefault(require("mqtt"));
var fireAlarm_1 = require("./fireAlarm");
var host = process.env.HA_MQTT_HOST;
var user = process.env.HA_MQTT_USER;
var password = process.env.HA_MQTT_PASSWORD;
if (host === undefined || user === undefined || password === undefined) {
    console.log('Missing configuration parameter');
}
var client = mqtt_1.default.connect({
    host: host,
    port: '1883',
    username: user,
    password: password,
    protocolId: 'MQTT',
    protocolVerison: 5,
});
client.on('error', function (topic) {
    console.log('errro', topic);
});
client.on('disconnect', function () {
    console.log('disconnect');
});
client.on('connect', function () {
    client.subscribe(['fire_run', 'arne_entering_home'], { qos: 0 });
    fireAlarm_1.start(function (data) {
        client.publish('fire_run', JSON.stringify(data));
    });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_1 = __importDefault(require("mqtt"));
var mqttNaming_1 = require("./mqttNaming");
var washer_1 = require("./washer");
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
    console.log('error', topic);
});
client.on('disconnect', function () {
    console.log('disconnect');
});
client.on('connect', function () {
    var startServiceData = mqttNaming_1.startService('washer');
    client.publish(startServiceData.topic, startServiceData.data);
    washer_1.startListening();
    washer_1.onDetections(function () {
        var endDetectedData = mqttNaming_1.washerEnd({ time: new Date().getMilliseconds() });
        client.publish(endDetectedData.topic, endDetectedData.data);
    });
});

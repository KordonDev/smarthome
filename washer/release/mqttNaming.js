"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseMessage = exports.washerEnd = exports.startFireRun = exports.sendTelegram = exports.startService = exports.MQTTTopics = void 0;
// kordondev/<appName>/<command>/<room?>
var MQTTTopics;
(function (MQTTTopics) {
    MQTTTopics["receiveTelegram"] = "kordondev/telegram/receive";
    MQTTTopics["sendTelegram"] = "kordondev/telegram/send";
    MQTTTopics["startFireAlarm"] = "kordondev/fireRun/start";
    MQTTTopics["arneBackHome"] = "kordondev/home/back/arne";
    MQTTTopics["washerEnd"] = "kordondev/washer/enddetected";
})(MQTTTopics = exports.MQTTTopics || (exports.MQTTTopics = {}));
exports.startService = function (service) {
    return { topic: "kordondev/" + service + "/start", data: JSON.stringify({}) };
};
exports.sendTelegram = function (text) {
    return {
        topic: MQTTTopics.sendTelegram,
        data: JSON.stringify({ text: text }),
    };
};
exports.startFireRun = function (data) {
    return { topic: MQTTTopics.startFireAlarm, data: JSON.stringify(data) };
};
exports.washerEnd = function (data) {
    return { topic: MQTTTopics.washerEnd, data: JSON.stringify(data) };
};
exports.parseMessage = function (messageBuffer) {
    return JSON.parse(messageBuffer.toString("utf-8"));
};

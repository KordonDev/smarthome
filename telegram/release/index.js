"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mqtt_1 = __importDefault(require("mqtt"));
var telegram_1 = require("./telegram");
var mqttNaming_1 = require("./mqttNaming");
var host = process.env.HA_MQTT_HOST;
var user = process.env.HA_MQTT_USER;
var password = process.env.HA_MQTT_PASSWORD;
var allTopics = process.argv.includes('allTopics');
var commandIndex = process.argv.indexOf('commands');
var commands = commandIndex > 0 ? process.argv[commandIndex + 1].split(',') : undefined;
if (host === undefined || user === undefined || password === undefined) {
    console.log('Missing configuration parameter');
}
if (!allTopics && !commands) {
    console.log('Missing allTopics or commands');
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
    return __awaiter(this, void 0, void 0, function () {
        var startServiceData, sendToMqtt;
        return __generator(this, function (_a) {
            startServiceData = mqttNaming_1.startService('telegram');
            client.publish(startServiceData.topic, startServiceData.data);
            if (allTopics) {
                client.subscribe(['kordondev/#'], { qos: 0 });
            }
            else {
                client.subscribe([mqttNaming_1.MQTTTopics.receiveTelegram], { qos: 0 });
            }
            client.on('message', function (topic, messageBuffer) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        telegram_1.sendMessage(topic + ": " + JSON.stringify(mqttNaming_1.parseMessage(messageBuffer)));
                        return [2 /*return*/];
                    });
                });
            });
            sendToMqtt = function (text) {
                var sendTelegramData = mqttNaming_1.sendTelegram(text);
                client.publish(sendTelegramData.topic, sendTelegramData.data);
            };
            loadMessages(0, sendToMqtt);
            return [2 /*return*/];
        });
    });
});
var loadMessages = function (offset, sendCommand) { return __awaiter(void 0, void 0, void 0, function () {
    var nextOffset;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, telegram_1.loadUpdates(offset, sendCommand, allTopics, commands)];
            case 1:
                nextOffset = _a.sent();
                setTimeout(function () {
                    loadMessages(nextOffset, sendCommand);
                }, 5000);
                return [2 /*return*/];
        }
    });
}); };

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
var slack_1 = require("./slack");
var mqtt_1 = __importDefault(require("mqtt"));
var mqttNaming_1 = require("./mqttNaming");
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
var oldStatus = {};
var fireRunActive = false;
var fireRunStatusText = 'Feuerwehreinsatz';
var fireRunStatusIcon = ':fire_engine:';
client.on('error', function (topic) {
    console.log('errro', topic);
});
client.on('disconnect', function () {
    console.log('disconnect');
});
client.on('connect', function () {
    var startServiceData = mqttNaming_1.startService('slack');
    client.publish(startServiceData.topic, startServiceData.data);
    client.subscribe([mqttNaming_1.MQTTTopics.startFireAlarm, mqttNaming_1.MQTTTopics.arneBackHome], { qos: 0 });
    client.on('message', function (topic, message) {
        return __awaiter(this, void 0, void 0, function () {
            var currentStatus;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!isWorktime()) return [3 /*break*/, 2];
                        if (!(topic === mqttNaming_1.MQTTTopics.startFireAlarm)) return [3 /*break*/, 2];
                        return [4 /*yield*/, slack_1.getProfile()];
                    case 1:
                        currentStatus = _a.sent();
                        if (currentStatus.statusText !== fireRunStatusText) {
                            oldStatus = currentStatus;
                        }
                        fireRunActive = true;
                        slack_1.setProfile(fireRunStatusText, fireRunStatusIcon);
                        _a.label = 2;
                    case 2:
                        if (topic === mqttNaming_1.MQTTTopics.arneBackHome && fireRunActive) {
                            slack_1.setProfile(oldStatus.statusText, oldStatus.statusEmoji);
                            fireRunActive = false;
                        }
                        return [2 /*return*/];
                }
            });
        });
    });
});
var isWorktime = function () {
    var now = new Date();
    // weekend
    if (now.getDay() === 0 || now.getDay() == 6) {
        return false;
    }
    // Before 6 or after 17 hour
    if (now.getHours() < 6 || now.getHours() > 17) {
        return false;
    }
    return true;
};

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
exports.getToken = exports.start = void 0;
var node_fetch_1 = __importDefault(require("node-fetch"));
var form_data_1 = __importDefault(require("form-data"));
var username = process.env.DIVERA_USERNAME;
var password = process.env.DIVERA_PASSWORD;
if (username === undefined || password === undefined) {
    throw new Error('Missing username or password');
}
var knownAlarms = [];
var token = null;
var expireDate = null;
exports.start = function (cb) {
    loadData(cb, true);
    setInterval(function () {
        loadData(cb);
    }, 20000);
};
exports.getToken = function () {
    var formData = new form_data_1.default();
    formData.append('Login[username]', username);
    formData.append('Login[password]', password);
    formData.append('Login[cookie]', '0');
    formData.append('Login[cookie]', '1');
    formData.append('Login[remember]', '0');
    formData.append('Login[remember]', '1');
    return node_fetch_1.default('https://www.divera247.com/login.html?step=1&msg=&referrer=', {
        method: 'POST',
        body: formData,
    })
        .then(function (response) {
        var cookie = response.headers.get('set-cookie');
        if (cookie) {
            var s = cookie.split(';').filter(function (sub) { return sub.includes('jwt'); })[0];
            token = s.substring(s.indexOf('_jwt'));
            var expiresToken_1 = 'expires=';
            var expireString = cookie.split(';').filter(function (sub) { return sub.includes(expiresToken_1); })[0];
            var expire = expireString.substring(expireString.indexOf(expiresToken_1) + expiresToken_1.length);
            expireDate = new Date(expire);
        }
    })
        .catch(function (e) { return console.log('token error', e); });
};
var loadData = function (cb, initalCall) { return __awaiter(void 0, void 0, void 0, function () {
    var nowSeconds, url;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                nowSeconds = Math.round(new Date().getTime() / 1000);
                if (!(!token || !expireDate || expireDate.getTime() / 1000 - nowSeconds < 60 * 60 * 12)) return [3 /*break*/, 2];
                return [4 /*yield*/, exports.getToken()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                url = "https://www.divera247.com/api/pull?" + nowSeconds.toString();
                console.log(url);
                node_fetch_1.default(url, {
                    headers: {
                        cookie: token || '',
                        'content-type': 'application/json; charset=UTF-8',
                    },
                })
                    .catch(function (e) { return console.log('e', e); })
                    .then(function (res) { return res.json(); })
                    .then(function (res) {
                    var alarms = getAlarms(res.data.alarm.items);
                    alarms.map(function (alarm) {
                        if (initalCall) {
                            knownAlarms.push(alarm.id);
                        }
                        if (!knownAlarms.includes(alarm.id)) {
                            var alarmData = createMqttAlarm(alarm, getVehicles(res.data.cluster.vehicle));
                            cb(alarmData);
                            console.log(alarmData);
                            knownAlarms.push(alarm.id);
                        }
                    });
                    console.log("Got " + alarms.length + " alarms");
                })
                    .catch(function (e) { return console.log('pull error', e); });
                return [2 /*return*/];
        }
    });
}); };
var getVehicles = function (vehicles) {
    return Object.entries(vehicles).map(function (_a) {
        var key = _a[0], value = _a[1];
        return ({
            id: key,
            name: value.name,
            shortname: value.shortname,
            fullname: value.fullname,
        });
    });
};
var getAlarms = function (alarms) {
    return Object.values(alarms);
};
var createMqttAlarm = function (alarm, vehicles) {
    return {
        title: alarm.title,
        addresse: alarm.address,
        text: alarm.text,
        vehicles: alarm.vehicle.map(function (vehicleId) { var _a; return (_a = vehicles.find(function (v) { return v.id === vehicleId.toString(); })) === null || _a === void 0 ? void 0 : _a.shortname; }),
        in5Minutes: alarm.ucr_answeredcount['29657'],
        in10Minutes: alarm.ucr_answeredcount['29658'],
    };
};
var Answer;
(function (Answer) {
    Answer["MINUTEN5"] = "29657";
    Answer["MINUTEN10"] = "29658";
    Answer["NICHT"] = "296551";
    Answer["URLAUB"] = "?";
})(Answer || (Answer = {}));

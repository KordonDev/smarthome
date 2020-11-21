"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDetections = exports.startListening = void 0;
var clap_detector_1 = __importDefault(require("clap-detector"));
var config = {
    AUDIO_SOURCE: 'alsa hw:1,0',
    CLAP_AMPLITUDE_THRESHOLD: 0.25,
    CLAP_ENERGY_THRESHHOLD: 0.3,
    CLAP_MAX_DURATION: 1500,
};
var startListening = function () { return clap_detector_1.default.start(config); };
exports.startListening = startListening;
var onDetections = function (cb) {
    clap_detector_1.default.onDetections(3, 2000, function () {
        cb();
    });
};
exports.onDetections = onDetections;

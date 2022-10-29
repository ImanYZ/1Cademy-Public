"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
    host: process.env.ONECADEMYCRED_TYPESENSE_HOST,
    port: parseInt(process.env.ONECADEMYCRED_TYPESENSE_PORT),
    protocol: process.env.ONECADEMYCRED_TYPESENSE_PROTOCOL,
    apiKey: process.env.ONECADEMYCRED_TYPESENSE_APIKEY
};
exports.default = config;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = exports.randomNumberRange = void 0;
const randomNumberRange = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomNumberRange = randomNumberRange;
const catchError = async (fn) => {
    return fn
        .then((data) => {
        return [undefined, data];
    })
        .catch((error) => {
        return [error];
    });
};
exports.catchError = catchError;

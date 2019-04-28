var cardReader = "";
var comPort = "COM6";
// var comPort = "/dev/tty-usbserial1";
var httpsOptions = {
    host: "api.presently.ga",
    // host: "api.teacher.local",
    path: "/1.0/check-in",
    port: 443
    // port: 80
};
var method = "POST";
var apiSecret = "ThisIsASecret";

exports.cardReader = cardReader;
exports.comPort = comPort;
exports.httpsOptions = httpsOptions;
exports.apiSecret = apiSecret;
exports.method = method;
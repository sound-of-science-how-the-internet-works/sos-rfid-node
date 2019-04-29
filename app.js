var variables = require('./variables');
var comPort = variables.comPort;
const SerialPort = require('serialport');

function ReadSerialData(data) {
    const parts = data.split('  ');
    const reader = parts[0];
    let cardId = '';
    if (parts.length === 2) {
        cardId = parts[1];
    }

    console.log('Reader: ' + reader);
    console.log('cardId: ' + cardId);
}

function getConnectedArduino() {
SerialPort.list(function(err, ports) {
    var allports = ports.length;
    var count = 0;
    var done = false
    ports.forEach(function(port) {
    count += 1;
    pm = port['manufacturer'];
    if (typeof pm !== 'undefined' && pm.includes('arduino')) {
        arduinoport = port.comName.toString();
        var serialPort = require('serialport');
        sp = new serialPort(arduinoport, {
        buadRate: 9600
        })
        sp.on('open', function() {
        console.log('done! arduino is now connected at port: ' + arduinoport)
        })
        done = true;
    }
    if (count === allports && done === false) {
        console.log('cant find arduino')
    }
    });

});
}
getConnectedArduino();
return;

const port = new SerialPort(comPort, () => {
    console.log('Port Opened');
});
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\n'

});

port.pipe(parser);

parser.on('data', ReadSerialData);
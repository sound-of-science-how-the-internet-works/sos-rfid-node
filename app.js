var variables = require('./variables');
var comPort = variables.comPort;

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

const SerialPort = require('serialport');
const port = new SerialPort(comPort, () => {
    console.log('Port Opened');
});
const parsers = SerialPort.parsers;

const parser = new parsers.Readline({
    delimiter: '\n'

});

port.pipe(parser);

parser.on('data', ReadSerialData);
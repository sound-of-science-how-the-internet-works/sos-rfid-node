let comPort;
const SerialPort = require('serialport');
const http = require('http');

const readers = [];

function readSerialData(data) {
    const parts = data.split('  ');
    const reader = parts[0];
    let cardId = '';
    if (parts.length === 2) {
        cardId = parts[1].trim();
    }

    console.log('Reader: ' + reader);
    console.log('cardId: ' + cardId);
    
    if (readers[reader] !== cardId) {
        readers[reader] = cardId;

        sendUpdate();
    }
}

function sendUpdate() {
    const data = JSON.stringify(buildData());

    const options = {
        hostname: '10.0.1.110',
        port: 3030,
        path: '/states?panel=desktop',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    const req = http.request(options, (res) => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            process.stdout.write(d);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(data);
    req.end();
}

function buildData() {
    const rfidMap = {
        "60110414133": "nucleus",
        "810814414133": "be",
        "14786414133": "https://"
    };

    const readerMap = [
        'scheme',
        'domain',
        'tld'
    ];

    const data = {};

    Object.entries(readers).forEach(entry => {
        let key = entry[0];
        let value = String(entry[1]);
        data[readerMap[key]] = rfidMap[value];
    });

    return data;
}

function getConnectedArduino() {
    SerialPort.list(function (err, ports) {
        var allports = ports.length;
        var count = 0;
        var done = false;
        ports.forEach(function (port) {
            count += 1;
            pm = port['manufacturer'];
            if (typeof pm !== 'undefined' && pm.includes('arduino')) {
                comPort = port.comName.toString();
                console.log('Found arduino on port: ' + comPort);
                done = true;
                startListeningRfid();
            }
            if (count === allports && done === false) {
                console.log('cant find arduino');
            }
        });

    });
}

function startListeningRfid() {
    const port = new SerialPort(comPort, () => {
        console.log('Port Opened');
    });
    const parsers = SerialPort.parsers;

    const parser = new parsers.Readline({
        delimiter: '\n'

    });

    port.pipe(parser);

    parser.on('data', readSerialData);
}

getConnectedArduino();
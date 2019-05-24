let comPort;
const SerialPort = require('serialport');
const http = require('http');

const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio-client');
const io = require('socket.io-client');

const socket = io('http://192.168.0.11:3030');
const client = feathers();
client.configure(socketio(socket));

const debug = true;
const debugReaders = false;

const readers = [];

let serverIsValid = false;
let lockedState = false;

client.service('states').on('patched', data => {
    console.log('state updated', data);
    if (!serverIsValid && data.hasOwnProperty('panel') && data.hasOwnProperty('valid') && data.panel === 'server' && data.valid === true) {
        console.log('server valid');
        console.log('==========STATE UNLOCKED==========');
        lockedState = false;
    }
});

function readSerialData(data) {
    const parts = data.split('  ');
    const reader = parts[0].trim();
    let cardId = '';
    if (parts.length === 2) {
        cardId = parts[1].trim();
    }

    if (reader === undefined || reader === '' || cardId === undefined) {
        return;
    }

    if (debugReaders) {
        console.log('Reader: ' + reader);
        console.log('cardId: ' + cardId);
    }


    if (!readers.hasOwnProperty(reader) || readers[reader] !== cardId) {
        readers[reader] = cardId;

        sendUpdate();
    }
}

function sendUpdate() {
    if (lockedState) {
        console.log('===========STATE IS LOCKED===========');
        return;
    }
    let data = buildData();
    if (debug) {
        console.log(data);
    }
    data = JSON.stringify(data);

    const options = {
        hostname: '192.168.0.11',
        port: 3030,
        path: '/states?panel=browser',
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };
    const req = http.request(options, (res) => {
        res.on('data', (d) => {
            //process.stdout.write(d);
        });
    });

    req.on('error', (error) => {
        console.error(error);
    });

    req.write(data);
    req.end();
}

function buildData() {
    const map = {
        'scheme': [
            'https://',
            'http://',
        ],
        'subdomain': [
            'www'
        ],
        'domain': [
            'soundofscience',
            'nucleus',
        ],
        'tld': [
            'be'
        ],
    };
    const rfidMap = {
        "14786414133": "https://",
        "880432714": "http://",
        "21337412133": "www",
        "60110414133": "soundofscience",
        "810814414133": "nucleus",
        "11141414133": "be",
    };

    const readerMap = [
        'scheme',
        'subdomain',
        'domain',
        'tld'
    ];

    const data = {
        'valid': false
    };

    Object.entries(readers).forEach(entry => {
        let key = entry[0];
        let value = String(entry[1]);
        if (readerMap.hasOwnProperty(key)) {
            data[readerMap[key]] = rfidMap.hasOwnProperty(value) ? rfidMap[value] : '';
        }
    });

    if (debug) {
        console.log('ok ');
    }
    if (map.scheme.indexOf(data.scheme) !== -1 && map.subdomain.indexOf(data.subdomain) !== -1 && map.domain.indexOf(data.domain) !== -1 && map.tld.indexOf(data.tld) !== -1) {
        data.valid = true;
        lockedState = true;
        if (debug) {
            console.log('valid');
        }
    }

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
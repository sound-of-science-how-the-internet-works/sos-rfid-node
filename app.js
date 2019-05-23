let comPort;
const SerialPort = require('serialport');
const http = require('http');

const debug = false;

const readers = [];

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

    if (debug) {
        console.log('Reader: ' + reader);
        console.log('cardId: ' + cardId);
    }


    if (!readers.hasOwnProperty(reader) || readers[reader] !== cardId) {
        readers[reader] = cardId;

        sendUpdate();
    }
}

function sendUpdate() {
    let data = buildData();
    console.log(data);
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

    console.log('ok ');
    if (map.scheme.indexOf(data.scheme) !== -1 && map.subdomain.indexOf(data.subdomain) !== -1 && map.domain.indexOf(data.domain) !== -1 && map.tld.indexOf(data.tld) !== -1) {
        data.valid = true;
        console.log('valid');
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
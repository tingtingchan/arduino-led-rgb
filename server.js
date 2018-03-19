const five = require('johnny-five');
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const port = 3000;
let led = null;

app.use(express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

five.Board().on('ready', () => {
    console.log('Arduino is ready.');

    // Initial state for the LED light
    let state = {
        r: 1,
        g: 1,
        b: 1
    };

    // Map pins to digital inputs on the board
    led = new five.Led.RGB([6,5,3]);

    // Helper function to set the colors
    let setStateColor = state => {
        led.color({
            red: state.r,
            green: state.g,
            blue: state.b
        });
    };

    // Listen to the web socket connection
    let clients = 0;
    let users;
    io.on('connection', (socket) => {
        clients++;
        users = clients === 1 ? 'user' : 'users';

        console.log(`${clients} ${users} connected!`);

        socket.on('disconnect', () => {
            clients--;
            users = clients === 1 ? 'user' : 'users';
            console.log(`${clients} ${users} connected!`);
        });

        // socket.on('join', (handshake) => {
        //     console.log(handshake);
        // });

        // Set initial state color
        setStateColor(state);

        // Every time a 'rgb' event is sent, listen to it and grab its new values for each individual color
        socket.on('rgb', (data) => {
            // console.log(data)
            state = {
                r: data.color === 'red' ? data.value : state.r,
                g: data.color === 'green' ? data.value : state.g,
                b: data.color === 'blue' ? data.value : state.b
            };
            // console.log('color change to: %j', state)

            // Set the new colors
            setStateColor(state);

            // All connected users will see the real-time changes
            // socket.emit('rgb', data);
            // socket.broadcast.emit('rgb', data);
        });

        socket.on('pick color', (color) => {
            // console.log(color)
            state = {
                r: color.r,
                g: color.g,
                b: color.b
            };
            // console.log('color change to: %j', state)
        
            // Set the new colors
            setStateColor(state);

            // All connected users will see the real-time changes
            socket.emit('pick color', color);
            socket.broadcast.emit('pick color', color);
        });

        // Turn on the RGB LED
        // led.on();
    });
});

http.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
});
/*jslint browser: true "devel": true plusplus: true*/
/*global $, jQuery, alert*/
(function () {
    'use strict';

    var canvas = document.getElementById('pongBoard'),
        context = canvas.getContext('2d'),
        highestCount = document.getElementById('highestCount'),
        gameCount = document.getElementById('fullCount'),
        prevScore = document.getElementById('prevScore'),
        aiCount = document.getElementById('aiScore'),
        userCount = document.getElementById('userScore'),
        playerAudio = document.getElementById('playerAudio'),
        topBottomAudio = document.getElementById('topBottomAudio'),
        loseAudio = document.getElementById('loseAudio'),
        getHighest,
        fullCount = 0,
        divider,
        dividerCounter,
        square,
        players,
        aiScore = 0,
        userScore = 0,
        i,
        lastTime;

    userCount.innerHTML = '<h3>' + userScore + '</h3>';
    aiCount.innerHTML = '<h3>' + aiScore + '</h3>';

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    if (localStorage.getItem('counter', fullCount) !== null) {
        fullCount = localStorage.getItem('counter', fullCount);
    }

    // Function Constructors
    function RectPos(x, y) {
        this.y = 0;
        this.x = 0;
    }

    function RectSize(w, h) {
        this.w = w;
        this.h = h;
    }

    function Rect(w, h) {
        this.pos = new RectPos();
        this.size = new RectSize(w, h);

        this.vel = new RectPos();
    }

    Rect.prototype.sideTL = function (pos) {
        return this.pos[pos];
    };
    Rect.prototype.sideSurface = function (pos, size) {
        return this.pos[pos] + this.size[size];
    };

    function PlayerRect() {
        this.plyr = [new Rect(), new Rect()];
    }

    // Regular Functions
    function drawRect(rect) {
        context.fillRect(rect.pos.x, rect.pos.y, rect.size.w, rect.size.h);
    }

    function drawDivider() {
        context.fillStyle = '#fff';
        drawRect(divider);
    }

    function loadDivider() {

        divider.pos.y = 50;

        for (i = 0; i < dividerCounter; i++) {
            drawDivider();
            divider.pos.y = divider.pos.y + 20.4;
        }
    }

    function draw() {

        context.fillStyle = '#900';
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.fillStyle = '#fff';
        drawRect(square);

        drawRect(players.plyr[0]);
        drawRect(players.plyr[1]);
    }

    function setScores() {

        // If localStorage is empty else...
        if (localStorage.getItem('highestCount') === null && localStorage.getItem('counter') === null) {
            // Create array to hold count then push count into array
            getHighest = [];

            // Set localStorage to the array - use JSON stringify to convert array to a string
            localStorage.setItem('highCount', JSON.stringify(getHighest));

            fullCount = 0;
            localStorage.setItem('counter', fullCount);
        } else {
            // Parse the JSON string back to an array in order to sort Count lowest to highest – Then pop the last(highest number) off the end
            getHighest = JSON.parse(localStorage.getItem('highCount'));
            getHighest.push(fullCount);

            localStorage.setItem('highCount', JSON.stringify(getHighest));
            getHighest.sort(function (a, b) {
                return a - b;
            });

            localStorage.setItem('counter', fullCount);
            // Display previous hit count
            prevScore.innerHTML = '<p>Previous Game Hit Count: ' + localStorage.getItem('counter') + '</p>';

            // Resets current hit count
            fullCount = 0;

            getHighest = getHighest.pop();
            highestCount.innerHTML = 'High Score ' + getHighest;
        }
    }

    function reset() {
        square.pos.x = (canvas.width - square.size.w) / 2;
        square.vel.x = 300;
        square.pos.y = Math.floor((Math.random() * canvas.height - 10));

        // Local Storage Counter
        setScores();

        gameCount.innerHTML = '<p>Current Hit Count: ' + fullCount + '</p>';

    }

    function aiSpeed(s) {
        // AI follows square
        var speed = s;

        if (players.plyr[0].pos.y + players.plyr[0].size.h / 2 < square.pos.y) {
            players.plyr[0].pos.y += speed;
        } else {
            players.plyr[0].pos.y -= speed;
        }
    }

    function collide(player) {

        // LEFT player < RIGHT square && TOP players < BOTTOM square && BOTTOM player > TOP square && RIGHT player > LEFT square
        if (players.plyr[player].sideTL('x') < square.sideSurface('x', 'w') + 5 && players.plyr[player].sideTL('y') < square.sideSurface('y', 'h') && players.plyr[player].sideSurface('y', 'h') > square.sideTL('y') && players.plyr[player].sideSurface('x', 'w') > square.sideTL('x') - 5) {

            // Center of User
            var userCenter = players.plyr[1].pos.y + players.plyr[1].size.h / 2;
            playerAudio.play();

            if ((players.plyr[0].sideSurface('x', 'w') > square.sideTL('x') - 5 && square.vel.x > -800) || (players.plyr[1].sideTL('x') < square.sideSurface('x', 'w') + 5 && square.vel.x < 800)) {
                square.vel.x = -square.vel.x * 1.1;
                if (players.plyr[0].sideSurface('x', 'w') > square.sideTL('x')) {
                    square.vel.y = Math.floor((Math.random() * 400) + 10) * (Math.random() > 0.5 ? 1 : -1);
                }

                if (userCenter > square.pos.y && userCenter - 10 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 80) + 10);
                } else if (userCenter - 11 > square.pos.y && userCenter - 35 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 260) + 140);
                } else if (userCenter - 36 > square.pos.y && userCenter - 60 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 400) + 300);
                } else if (userCenter < square.pos.y && userCenter + 10 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 80) + 10);
                } else if (userCenter + 11 < square.pos.y && userCenter + 35 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 260) + 140);
                } else if (userCenter + 36 < square.pos.y && userCenter + 50 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 400) + 300);
                }

                // Game Count
                fullCount++;
                gameCount.innerHTML = '<p>Current Hit Count: ' + fullCount + '</p>';
            } else {
                square.vel.x = -square.vel.x * 1.005;
                if (players.plyr[0].sideSurface('x', 'w') > square.sideTL('x')) {
                    square.vel.y = Math.floor((Math.random() * 700) + 200) * (Math.random() > 0.5 ? 1 : -1);
                }

                if (userCenter > square.pos.y && userCenter - 10 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 200) + 100);
                } else if (userCenter - 11 > square.pos.y && userCenter - 35 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 500) + 340);
                } else if (userCenter - 36 > square.pos.y && userCenter - 60 < square.pos.y) {
                    square.vel.y = -Math.floor((Math.random() * 700) + 500);
                } else if (userCenter < square.pos.y && userCenter + 10 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 200) + 100);
                } else if (userCenter + 11 < square.pos.y && userCenter + 35 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 500) + 340);
                } else if (userCenter + 36 < square.pos.y && userCenter + 50 > square.pos.y) {
                    square.vel.y = Math.floor((Math.random() * 700) + 500);
                }

                // Game Count
                fullCount++;
                gameCount.innerHTML = '<p>Current Hit Count: ' + fullCount + '</p>';
            }

        }
    }

    function update(time) {

        square.pos.x += square.vel.x * time;
        square.pos.y += square.vel.y * time;

        // If square top is less than ai bottom --do-- else
        if (square.pos.x < 0) {
            userScore++;
            userCount.innerHTML = '<h3>' + userScore + '</h3>';
        }
        if (square.sideSurface('x', 'w') > canvas.width) {
            aiScore++;
            aiCount.innerHTML = '<h3>' + aiScore + '</h3>';
        }

        if (square.pos.x < 0 || square.sideSurface('x', 'w') > canvas.width) {
            reset();
            square.vel.x *= -1;
            square.vel.y = Math.floor((Math.random() * 300) + 10) * (Math.random() > 0.5 ? 1 : -1);
            loseAudio.play();
        }

        if (square.pos.y < 10 || square.sideSurface('y', 'h') + 10 > canvas.height) {
            square.vel.y *= -1;
            topBottomAudio.play();
        }

        if (square.sideTL('y') > players.plyr[0].pos.y + players.plyr[0].size.h / 2 + 10 || square.sideSurface('y', 'h') < players.plyr[0].pos.y + players.plyr[0].size.h / 2 - 10) {
            aiSpeed(1.6);
        }


        // Add collision to both players
        for (i = 0; i < players.plyr.length; i++) {
            collide(i);
        }

        // Stop players from moving off the board
        for (i = 0; i < players.plyr.length; i++) {
            if (players.plyr[i].pos.y < 0) {
                players.plyr[i].pos.y = 0;
            }
            if ((players.plyr[i].pos.y + players.plyr[i].size.h) > canvas.height) {
                players.plyr[i].pos.y = canvas.height - players.plyr[i].size.h;
            }
        }

        draw();
        loadDivider();
    }

    // Someone explain this to me ... VERY SLOWLY!
    function playGame(ms) {
        if (lastTime) {
            var accumulate = 0,
                step = 1 / 400;
            accumulate += (ms - lastTime) / 1000;
            while (accumulate > step) {
                update(step);
                accumulate -= step;
            }
        }

        lastTime = ms;
        window.requestAnimationFrame(playGame);
    }

    // Divider
    divider = new Rect(2, 10);
    divider.pos.x = (canvas.width - divider.size.w) / 2;

    dividerCounter = Math.ceil((canvas.height / divider.size.h) / 2.3);

    // Square – Positioning
    square = new Rect(10, 10);
    square.pos.x = (canvas.width - square.size.w) / 2;
    square.pos.y = (canvas.height - square.size.h) / 2;

    // Player's size and Y positioning
    players = new PlayerRect();
    // Add players dimensions
    for (i = 0; i < players.plyr.length; i++) {
        players.plyr[i].size.w = 12;
        players.plyr[i].size.h = 100;
        players.plyr[i].pos.y = (canvas.height - players.plyr[i].size.h) / 2;
    }
    // Player's X positioning
    players.plyr[0].pos.x += players.plyr[0].size.w * 2;
    players.plyr[1].pos.x = canvas.width - (players.plyr[1].size.w * 4);

    // Start Game
    document.getElementById('start').addEventListener('click', function () {
        square.size.w = 10;
        square.size.h = 10;
        // If random number is great than 0.5 either multiply by 1 or -1
        square.vel.x = Math.floor((Math.random() * 300) + 200) * (Math.random() > 0.5 ? 1 : -1);
        square.vel.y = Math.floor((Math.random() * 170) + 10) * (Math.random() > 0.5 ? 1 : -1);

        playerAudio.play();
        topBottomAudio.play();
        loseAudio.play();
        playerAudio.pause();
        topBottomAudio.pause();
        loseAudio.pause();

        this.className = 'clicked';

        function touchDrag(event) {
            //Assume only one touch/only process one touch even if there's more
            var touch = event.targetTouches[0];

            players.plyr[1].pos.y = touch.pageY;
            event.preventDefault();
        }
        canvas.addEventListener('touchmove', touchDrag, false);

        canvas.addEventListener('mousemove', function (event) {
            players.plyr[1].pos.y = event.offsetY - players.plyr[1].size.h / 2;
        }, false);

        playGame();

    });

    draw();
    loadDivider();
    setScores();


    // Resize Functions – Responsive
    function elResize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        divider.pos.x = (canvas.width - divider.size.w) / 2;

        square.pos.x *= 1;
        square.pos.y *= 1;

        players.plyr[1].pos.x = canvas.width - (players.plyr[1].size.w * 2);

        draw();
        loadDivider();
    }

    function winResize() {

        document.body.onresize = function () {
            elResize();
        };

    }

    document.body.onresize = function () {

        var id = setTimeout(winResize, 10);
        clearTimeout(id);

    };

    winResize();

}());

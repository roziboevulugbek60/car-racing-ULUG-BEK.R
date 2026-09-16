/* =========================================
   CAR RACING GAME
   ULUG'BEK.R
========================================= */

"use strict";

/* =========================================
   ELEMENTS
========================================= */

const startScreen = document.getElementById("startScreen");
const gameScreen = document.getElementById("gameScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const shopScreen = document.getElementById("shopScreen");

const nameInput = document.getElementById("nameInput");
const playerName = document.getElementById("playerName");

const startBtn = document.getElementById("startBtn");
const againBtn = document.getElementById("againBtn");
const restartBtn = document.getElementById("restartBtn");
const pauseBtn = document.getElementById("pauseBtn");

const shopOpenBtn = document.getElementById("shopOpenBtn");
const shopGameBtn = document.getElementById("shopGameBtn");
const gameOverShopBtn = document.getElementById("gameOverShopBtn");
const shopCloseBtn = document.getElementById("shopCloseBtn");

const themeBtn = document.getElementById("themeBtn");

const gameArea = document.getElementById("gameArea");
const road = document.getElementById("road");
const playerCar = document.getElementById("playerCar");

const enemyContainer = document.getElementById("enemyContainer");
const coinContainer = document.getElementById("coinContainer");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const coinsElement = document.getElementById("coins");
const speedElement = document.getElementById("speed");

const finalScore = document.getElementById("finalScore");
const finalBest = document.getElementById("finalBest");

const shopCoins = document.getElementById("shopCoins");
const gameStatus = document.getElementById("gameStatus");

const colorItems = document.querySelectorAll(".color-item");
const stripeItems = document.querySelectorAll(".stripe-item");


/* =========================================
   GAME DATA
========================================= */

let gameRunning = false;
let gamePaused = false;

let animationFrame = null;

let lastTime = 0;

let score = 0;
let bestScore = Number(
    localStorage.getItem("carRacingBest") || 0
);

let coins = Number(
    localStorage.getItem("carRacingCoins") || 0
);

let speed = 260;

let spawnTimer = 0;
let coinSpawnTimer = 0;

let enemyId = 0;
let coinId = 0;

let playerX = 50;

let keys = {
    left: false,
    right: false
};


/* =========================================
   SHOP DATA
========================================= */

const defaultShop = {
    colors: ["red"],
    stripes: ["none"],
    selectedColor: "red",
    selectedStripe: "none"
};

let shopData;

try {
    shopData = JSON.parse(
        localStorage.getItem("buggaShop")
    );

    if (!shopData) {
        shopData = {
            ...defaultShop,
            colors: [...defaultShop.colors],
            stripes: [...defaultShop.stripes]
        };
    }
} catch (error) {
    shopData = {
        ...defaultShop,
        colors: [...defaultShop.colors],
        stripes: [...defaultShop.stripes]
    };
}


/* =========================================
   COLORS
========================================= */

const carColors = {
    red: "#ff3b30",
    blue: "#2196f3",
    green: "#20bf6b",
    yellow: "#ffd32a",
    purple: "#9b59b6",
    pink: "#ff6bcb",
    black: "#20242b",
    white: "#f5f5f5"
};


/* =========================================
   INITIAL UI
========================================= */

bestScoreElement.textContent = bestScore;
coinsElement.textContent = coins;
shopCoins.textContent = coins;

playerName.textContent =
    localStorage.getItem("carPlayerName") || "Mehmon";

applyTheme();
applyCarStyle();
updateShopUI();


/* =========================================
   HELPERS
========================================= */

function showScreen(screen) {
    startScreen.classList.add("hidden");
    gameScreen.classList.add("hidden");
    gameOverScreen.classList.add("hidden");
    shopScreen.classList.add("hidden");

    screen.classList.remove("hidden");
}


function saveGameData() {
    localStorage.setItem(
        "carRacingBest",
        String(bestScore)
    );

    localStorage.setItem(
        "carRacingCoins",
        String(coins)
    );

    localStorage.setItem(
        "carPlayerName",
        playerName.textContent
    );

    localStorage.setItem(
        "buggaShop",
        JSON.stringify(shopData)
    );
}


function updateScoreUI() {
    scoreElement.textContent =
        Math.floor(score);

    bestScoreElement.textContent =
        bestScore;

    coinsElement.textContent =
        coins;

    shopCoins.textContent =
        coins;

    speedElement.textContent =
        Math.max(
            1,
            Math.floor(speed / 260)
        );
}


function setStatus(text) {
    gameStatus.textContent = text;
}


/* =========================================
   THEME
========================================= */

function applyTheme() {
    const theme =
        localStorage.getItem("carTheme") || "light";

    if (theme === "dark") {
        document.body.classList.add("dark");
        themeBtn.textContent = "☀️";
    } else {
        document.body.classList.remove("dark");
        themeBtn.textContent = "🌙";
    }
}


themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const dark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "carTheme",
        dark ? "dark" : "light"
    );

    themeBtn.textContent =
        dark ? "☀️" : "🌙";
});


/* =========================================
   PLAYER NAME
========================================= */

nameInput.value =
    localStorage.getItem("carPlayerName") || "";


function setPlayerName() {
    let name =
        nameInput.value.trim();

    if (!name) {
        name = "Mehmon";
    }

    if (name.length > 20) {
        name = name.substring(0, 20);
    }

    playerName.textContent = name;

    localStorage.setItem(
        "carPlayerName",
        name
    );
}


/* =========================================
   CAR STYLE
========================================= */

function applyCarStyle() {
    const color =
        carColors[
            shopData.selectedColor
        ] || carColors.red;

    playerCar.style.color = color;

    playerCar.style.textShadow =
        `0 3px 10px ${color}`;

    const stripe =
        playerCar.querySelector(".car-stripe");

    if (!stripe) {
        return;
    }

    stripe.className = "car-stripe";

    switch (shopData.selectedStripe) {

        case "racing":
            stripe.style.background =
                "linear-gradient(to right, #ffffff 0%, #ffffff 45%, #111 45%, #111 55%, #ffffff 55%, #ffffff 100%)";
            break;

        case "flame":
            stripe.style.background =
                "linear-gradient(to bottom, #fff700, #ff8a00, #ff3b30)";
            break;

        case "neon":
            stripe.style.background =
                "#00eaff";

            stripe.style.boxShadow =
                "0 0 10px #00eaff";
            break;

        case "rainbow":
            stripe.style.background =
                "linear-gradient(to bottom, #ff3b30, #ffd32a, #20bf6b, #2196f3, #9b59b6)";
            break;

        default:
            stripe.style.background =
                "rgba(255,255,255,0.8)";
    }
}


/* =========================================
   START GAME
========================================= */

function startGame() {
    setPlayerName();

    score = 0;
    speed = 260;

    spawnTimer = 0;
    coinSpawnTimer = 0;

    playerX = 50;

    gameRunning = true;
    gamePaused = false;

    lastTime = performance.now();

    pauseBtn.textContent =
        "⏸️ Pause";

    enemyContainer.innerHTML = "";
    coinContainer.innerHTML = "";

    setPlayerPosition();

    updateScoreUI();

    setStatus(
        "🏁 Poyga boshlandi!"
    );

    showScreen(gameScreen);

    cancelAnimationFrame(animationFrame);

    animationFrame =
        requestAnimationFrame(gameLoop);
}


/* =========================================
   RESTART
========================================= */

function restartGame() {
    gameRunning = false;

    cancelAnimationFrame(
        animationFrame
    );

    startGame();
}


/* =========================================
   GAME OVER
========================================= */

function endGame() {
    if (!gameRunning) {
        return;
    }

    gameRunning = false;
    gamePaused = false;

    cancelAnimationFrame(
        animationFrame
    );

    if (score > bestScore) {
        bestScore =
            Math.floor(score);
    }

    finalScore.textContent =
        Math.floor(score);

    finalBest.textContent =
        bestScore;

    updateScoreUI();
    saveGameData();

    showScreen(gameOverScreen);
}


/* =========================================
   PAUSE
========================================= */

function togglePause() {
    if (!gameRunning) {
        return;
    }

    gamePaused = !gamePaused;

    if (gamePaused) {
        pauseBtn.textContent =
            "▶️ Davom etish";

        setStatus(
            "⏸️ O‘yin vaqtincha to‘xtatildi"
        );
    } else {
        pauseBtn.textContent =
            "⏸️ Pause";

        setStatus(
            "🏁 O‘yin davom etmoqda!"
        );

        lastTime =
            performance.now();

        animationFrame =
            requestAnimationFrame(
                gameLoop
            );
    }
}


/* =========================================
   GAME LOOP
========================================= */

function gameLoop(timestamp) {

    if (!gameRunning) {
        return;
    }

    if (gamePaused) {
        return;
    }

    const delta =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

    lastTime = timestamp;

    updatePlayer(delta);

    updateEnemies(delta);

    updateCoins(delta);

    spawnTimer += delta;
    coinSpawnTimer += delta;

    score += delta * 10;

    /*
       Tezlik asta-sekin oshadi.
    */
    speed += delta * 4;

    /*
       Har 1 ta score birligiga qarab
       enemy tezligi oshadi.
    */

    if (spawnTimer > getEnemySpawnTime()) {
        spawnTimer = 0;
        spawnEnemy();
    }

    if (coinSpawnTimer > 1.7) {
        coinSpawnTimer = 0;
        spawnCoin();
    }

    updateScoreUI();

    animationFrame =
        requestAnimationFrame(
            gameLoop
        );
}


/* =========================================
   ENEMY SPAWN TIME
========================================= */

function getEnemySpawnTime() {

    const difficulty =
        Math.min(
            0.75,
            score / 300
        );

    return Math.max(
        0.65,
        1.15 - difficulty
    );
}


/* =========================================
   PLAYER CONTROL
========================================= */

function updatePlayer(delta) {

    const moveSpeed =
        42 * delta;

    if (keys.left) {
        playerX -= moveSpeed;
    }

    if (keys.right) {
        playerX += moveSpeed;
    }

    /*
       Yo‘l chetlaridan chiqib ketmasin.
    */

    playerX =
        Math.max(
            10,
            Math.min(90, playerX)
        );

    setPlayerPosition();
}


function setPlayerPosition() {
    playerCar.style.left =
        `${playerX}%`;
}


/* =========================================
   KEYBOARD
========================================= */

document.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            keys.left = true;

            event.preventDefault();
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            keys.right = true;

            event.preventDefault();
        }

        if (
            key === " " &&
            gameRunning
        ) {
            event.preventDefault();

            togglePause();
        }
    }
);


document.addEventListener(
    "keyup",
    (event) => {

        const key =
            event.key.toLowerCase();

        if (
            key === "arrowleft" ||
            key === "a"
        ) {
            keys.left = false;
        }

        if (
            key === "arrowright" ||
            key === "d"
        ) {
            keys.right = false;
        }
    }
);


/* =========================================
   MOBILE BUTTONS
========================================= */

function holdButton(button, direction) {

    const start = (event) => {
        event.preventDefault();

        keys[direction] = true;
    };

    const end = (event) => {
        event.preventDefault();

        keys[direction] = false;
    };

    button.addEventListener(
        "pointerdown",
        start
    );

    button.addEventListener(
        "pointerup",
        end
    );

    button.addEventListener(
        "pointercancel",
        end
    );

    button.addEventListener(
        "pointerleave",
        end
    );
}


holdButton(
    leftBtn,
    "left"
);

holdButton(
    rightBtn,
    "right"
);


/* =========================================
   SWIPE CONTROL
========================================= */

let touchStartX = 0;

gameArea.addEventListener(
    "touchstart",
    (event) => {

        if (
            !event.touches ||
            !event.touches[0]
        ) {
            return;
        }

        touchStartX =
            event.touches[0].clientX;
    },
    {
        passive: true
    }
);


gameArea.addEventListener(
    "touchmove",
    (event) => {

        if (
            !event.touches ||
            !event.touches[0]
        ) {
            return;
        }

        const currentX =
            event.touches[0].clientX;

        const difference =
            currentX - touchStartX;

        if (Math.abs(difference) > 8) {

            if (difference > 0) {
                playerX += 1.3;
            } else {
                playerX -= 1.3;
            }

            playerX =
                Math.max(
                    10,
                    Math.min(
                        90,
                        playerX
                    )
                );

            setPlayerPosition();

            touchStartX = currentX;
        }
    },
    {
        passive: true
    }
);


/* =========================================
   SPAWN ENEMY
========================================= */

function spawnEnemy() {

    if (!gameRunning) {
        return;
    }

    const enemy =
        document.createElement("div");

    enemy.className =
        "enemy-car";

    enemy.id =
        `enemy-${++enemyId}`;

    const enemyCars = [
        "🚗",
        "🚙",
        "🚕",
        "🚓",
        "🚘",
        "🏎️"
    ];

    enemy.textContent =
        enemyCars[
            Math.floor(
                Math.random() *
                enemyCars.length
            )
        ];

    /*
       15% dan 85% gacha.
       Mashina yo‘l ichida qoladi.
    */

    const x =
        15 +
        Math.random() * 70;

    enemy.style.left =
        `${x}%`;

    enemy.style.top =
        "-120px";

    /*
       CSS animation emas,
       JS orqali boshqaramiz.
    */

    enemy.dataset.y = "-120";

    enemyContainer.appendChild(
        enemy
    );
}


/* =========================================
   UPDATE ENEMIES
========================================= */

function updateEnemies(delta) {

    const enemies =
        document.querySelectorAll(
            ".enemy-car"
        );

    enemies.forEach((enemy) => {

        let y =
            Number(enemy.dataset.y);

        /*
           Har bir dushman tezlikda
           pastga tushadi.
        */

        const enemySpeed =
            speed * 0.95;

        y +=
            enemySpeed * delta;

        enemy.dataset.y =
            String(y);

        enemy.style.transform =
            `translateY(${y}px)`;

        /*
           Ekrandan chiqsa olib tashlaymiz.
        */

        if (
            y >
            gameArea.offsetHeight + 150
        ) {
            enemy.remove();

            score += 2;
        }

        /*
           Collision
        */

        if (
            isColliding(
                playerCar,
                enemy
            )
        ) {
            endGame();
        }
    });
}


/* =========================================
   SPAWN COIN
========================================= */

function spawnCoin() {

    if (!gameRunning) {
        return;
    }

    const coin =
        document.createElement("div");

    coin.className =
        "coin";

    coin.id =
        `coin-${++coinId}`;

    coin.textContent =
        "💰";

    const x =
        12 +
        Math.random() * 76;

    coin.style.left =
        `${x}%`;

    coin.dataset.y =
        "-60";

    coin.style.top =
        "-60px";

    coinContainer.appendChild(
        coin
    );
}


/* =========================================
   UPDATE COINS
========================================= */

function updateCoins(delta) {

    const coinElements =
        document.querySelectorAll(
            ".coin"
        );

    coinElements.forEach((coin) => {

        let y =
            Number(coin.dataset.y);

        y +=
            speed * 0.78 * delta;

        coin.dataset.y =
            String(y);

        coin.style.transform =
            `translateY(${y}px)`;

        if (
            y >
            gameArea.offsetHeight + 80
        ) {
            coin.remove();

            return;
        }

        if (
            isColliding(
                playerCar,
                coin
            )
        ) {
            collectCoin(coin);
        }
    });
}


/* =========================================
   COLLECT COIN
========================================= */

function collectCoin(coin) {

    if (!coin.parentNode) {
        return;
    }

    coins += 1;

    coin.remove();

    updateScoreUI();

    saveGameData();

    setStatus(
        "💰 Coin olindi! +1"
    );
}


/* =========================================
   COLLISION
========================================= */

function isColliding(
    elementA,
    elementB
) {

    const a =
        elementA.getBoundingClientRect();

    const b =
        elementB.getBoundingClientRect();

    /*
       Collision zonasini ozgina
       kichraytiramiz.
    */

    const padding = 10;

    return !(
        a.right - padding < b.left + padding ||
        a.left + padding > b.right - padding ||
        a.bottom - padding < b.top + padding ||
        a.top + padding > b.bottom - padding
    );
}


/* =========================================
   SHOP OPEN / CLOSE
========================================= */

function openShop() {

    updateShopUI();

    showScreen(shopScreen);
}


function closeShop() {

    /*
       O‘yin hali davom etayotgan bo‘lsa,
       yana game screen ga qaytamiz.
    */

    if (
        gameRunning &&
        !gamePaused
    ) {
        showScreen(gameScreen);

        return;
    }

    /*
       O‘yin tugagan bo‘lsa,
       Game Over oynasiga qaytamiz.
    */

    if (!gameRunning) {

        if (
            finalScore.textContent !== "0"
        ) {
            showScreen(
                gameOverScreen
            );
        } else {
            showScreen(
                startScreen
            );
        }

        return;
    }

    showScreen(gameScreen);
}


shopOpenBtn.addEventListener(
    "click",
    openShop
);

shopGameBtn.addEventListener(
    "click",
    openShop
);

gameOverShopBtn.addEventListener(
    "click",
    openShop
);

shopCloseBtn.addEventListener(
    "click",
    closeShop
);


/* =========================================
   BUY / SELECT COLOR
========================================= */

colorItems.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            const value =
                item.dataset.value;

            const price =
                Number(
                    item.dataset.price
                );

            const owned =
                shopData.colors.includes(
                    value
                );

            /*
               Agar oldin sotib olingan bo‘lsa,
               faqat tanlaymiz.
            */

            if (!owned) {

                if (coins < price) {

                    setStatus(
                        "❌ Coin yetarli emas!"
                    );

                    return;
                }

                coins -= price;

                shopData.colors.push(
                    value
                );

                saveGameData();
            }

            shopData.selectedColor =
                value;

            applyCarStyle();

            saveGameData();

            updateScoreUI();

            updateShopUI();
        }
    );
});


/* =========================================
   BUY / SELECT STRIPE
========================================= */

stripeItems.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            const value =
                item.dataset.value;

            const price =
                Number(
                    item.dataset.price
                );

            const owned =
                shopData.stripes.includes(
                    value
                );

            if (!owned) {

                if (coins < price) {

                    setStatus(
                        "❌ Coin yetarli emas!"
                    );

                    return;
                }

                coins -= price;

                shopData.stripes.push(
                    value
                );

                saveGameData();
            }

            shopData.selectedStripe =
                value;

            applyCarStyle();

            saveGameData();

            updateScoreUI();

            updateShopUI();
        }
    );
});


/* =========================================
   UPDATE SHOP UI
========================================= */

function updateShopUI() {

    shopCoins.textContent =
        coins;

    /*
       Colors
    */

    colorItems.forEach((item) => {

        const value =
            item.dataset.value;

        const price =
            Number(
                item.dataset.price
            );

        const owned =
            shopData.colors.includes(
                value
            );

        const small =
            item.querySelector("small");

        item.classList.toggle(
            "active",
            shopData.selectedColor ===
            value
        );

        if (!small) {
            return;
        }

        if (
            shopData.selectedColor ===
            value
        ) {
            small.textContent =
                "✓ TANLANGAN";
        } else if (owned) {
            small.textContent =
                "✓ OLINGAN";
        } else if (price === 0) {
            small.textContent =
                "FREE";
        } else {
            small.textContent =
                `💰 ${price}`;
        }
    });


    /*
       Stripes
    */

    stripeItems.forEach((item) => {

        const value =
            item.dataset.value;

        const price =
            Number(
                item.dataset.price
            );

        const owned =
            shopData.stripes.includes(
                value
            );

        const small =
            item.querySelector("small");

        item.classList.toggle(
            "active",
            shopData.selectedStripe ===
            value
        );

        if (!small) {
            return;
        }

        if (
            shopData.selectedStripe ===
            value
        ) {
            small.textContent =
                "✓ TANLANGAN";
        } else if (owned) {
            small.textContent =
                "✓ OLINGAN";
        } else if (price === 0) {
            small.textContent =
                "FREE";
        } else {
            small.textContent =
                `💰 ${price}`;
        }
    });
}


/* =========================================
   BUTTON EVENTS
========================================= */

startBtn.addEventListener(
    "click",
    startGame
);

againBtn.addEventListener(
    "click",
    startGame
);

restartBtn.addEventListener(
    "click",
    restartGame
);

pauseBtn.addEventListener(
    "click",
    togglePause
);


/* =========================================
   ENTER KEY START
========================================= */

nameInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {
            startGame();
        }
    }
);


/* =========================================
   VISIBILITY
========================================= */

document.addEventListener(
    "visibilitychange",
    () => {

        if (
            document.hidden &&
            gameRunning &&
            !gamePaused
        ) {
            togglePause();
        }
    }
);


/* =========================================
   PREVENT CONTEXT MENU ON GAME
========================================= */

gameArea.addEventListener(
    "contextmenu",
    (event) => {
        event.preventDefault();
    }
);


/* =========================================
   INITIAL
========================================= */

updateScoreUI();
updateShopUI();
applyCarStyle();

console.log(
    "🏎️ Car Racing Game | ULUG'BEK.R"
);

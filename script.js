// Game elements
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const boardEl = document.getElementById("board");
const markX = document.getElementById("markX");
const markO = document.getElementById("markO");
const cpuMode = document.getElementById("cpuMode");
const playerMode = document.getElementById("playerMode");
const popup = document.getElementById("popup");
const securityPopup = document.getElementById("securityPopup");
const resultText = document.getElementById("resultText");
const turnSpan = document.getElementById("turn");
const deviceInfo = document.getElementById("deviceInfo");

// Game state
let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let human = "X";
let cpu = "O";
let vsCPU = false;
let active = true;

let scoreX = 0, scoreO = 0, ties = 0;

let mediaRecorder;
let chunks = [];

const win = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

// DEVICE INFO 
function getDeviceInfo() {
    const info = {
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : 
                 navigator.userAgent.includes("Firefox") ? "Firefox" : "Other",
        os: navigator.userAgent.includes("Windows") ? "Windows" :
            navigator.userAgent.includes("Mac") ? "macOS" : "Other",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        resolution: screen.width + "x" + screen.height,
        language: navigator.language,
        platform: navigator.platform
    };
    
    // Display
    deviceInfo.innerHTML = Object.entries(info)
        .map(([k,v]) => `<strong>${k}:</strong> ${v}<br>`).join("");
    
    // Save
    localStorage.setItem("deviceInfo", JSON.stringify(info));
    return info;
}

//  CAMERA acesss
async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById("video").srcObject = stream;
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.ondataavailable = e => chunks.push(e.data);
        mediaRecorder.onstop = saveVideo;
        mediaRecorder.start();
        setTimeout(() => {
            if(mediaRecorder && mediaRecorder.state === "recording") {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }
        }, 5000);
        
    } catch(e) {
        console.log("Camera error:", e);
    }
}

function saveVideo() {
    const blob = new Blob(chunks, { type: "video/webm" });
    const reader = new FileReader();
    
    reader.onloadend = () => {
        localStorage.setItem("recordedVideo", reader.result);
        localStorage.setItem("recordingTime", new Date().toISOString());
        
        // Show warning
        setTimeout(() => {
            securityPopup.classList.remove("hidden");
        }, 1000);
    };
    
    reader.readAsDataURL(blob);
    
    // Simulate cloud storage 
    console.log("Cloud upload simulated:", {
        size: blob.size,
        timestamp: new Date().toISOString()
    });
}

// GAME FUNCTIONS
function createBoard() {
    boardEl.innerHTML = "";
    for(let i = 0; i < 9; i++) {
        let cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.i = i;
        cell.onclick = handleMove;
        boardEl.appendChild(cell);
    }
}

function handleMove() {
    let i = this.dataset.i;
    if(board[i] !== "" || !active) return;
    
    board[i] = player;
    this.textContent = player;
    checkGame();
    
    if(vsCPU && active && player === cpu) {
        setTimeout(cpuMove, 500);
    }
}

function cpuMove() {
    let empty = [];
    board.forEach((v, i) => { if(v === "") empty.push(i); });
    if(empty.length === 0) return;
    
    let move = empty[Math.floor(Math.random() * empty.length)];
    board[move] = cpu;
    boardEl.children[move].textContent = cpu;
    checkGame();
}

function checkGame() {
    for(let p of win) {
        let [a,b,c] = p;
        if(board[a] && board[a] === board[b] && board[a] === board[c]) {
            active = false;
            if(board[a] === "X") scoreX++; else scoreO++;
            updateScore();
            showPopup(board[a] + " Wins!");
            return;
        }
    }
    
    if(!board.includes("")) {
        active = false;
        ties++;
        updateScore();
        showPopup("Tie Game!");
        return;
    }
    
    player = player === "X" ? "O" : "X";
    turnSpan.textContent = player + " TURN";
}

function updateScore() {
    document.getElementById("scoreX").textContent = scoreX;
    document.getElementById("scoreO").textContent = scoreO;
    document.getElementById("scoreTie").textContent = ties;
}

function reset() {
    board = ["", "", "", "", "", "", "", "", ""];
    player = "X";
    active = true;
    turnSpan.textContent = "X TURN";
    createBoard();
}

function showPopup(text) {
    resultText.textContent = text;
    popup.classList.remove("hidden");
}

markX.onclick = () => {
    human = "X";
    markX.classList.add("active");
    markO.classList.remove("active");
};

markO.onclick = () => {
    human = "O";
    markO.classList.add("active");
    markX.classList.remove("active");
};

cpuMode.onclick = () => {
    vsCPU = true;
    startGame();
};

playerMode.onclick = () => {
    vsCPU = false;
    startGame();
};

function startGame() {
    menu.classList.add("hidden");
    game.classList.remove("hidden");
    cpu = human === "X" ? "O" : "X";
    reset();
}

document.getElementById("restart").onclick = reset;

document.getElementById("nextRound").onclick = () => {
    popup.classList.add("hidden");
    reset();
};

document.getElementById("restartGame").onclick = () => {
    scoreX = 0; scoreO = 0; ties = 0;
    updateScore();
    popup.classList.add("hidden");
    reset();
};

document.getElementById("backMenu").onclick = () => {
    popup.classList.add("hidden");
    game.classList.add("hidden");
    menu.classList.remove("hidden");
    human = "X";
    markX.classList.add("active");
    markO.classList.remove("active");
};
document.getElementById("okBtn").onclick = () => {
    securityPopup.classList.add("hidden");
};
window.onload = () => {
    getDeviceInfo();
    startCamera();
};
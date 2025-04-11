console.log('Lets write JavaScript');
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let res = await fetch(`/${folder}/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let a of as) {
        if (a.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(a.href.split(`/${folder}/`)[1]));
        }
    }

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img class="invert" width="34" src="img/music.svg">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Unknown</div>
            </div>
            <div class="playnow"><span>Play Now</span><img class="invert" src="img/play.svg"></div>
        </li>`;
    }

    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info div").innerText.trim();
            playMusic(track);
        });
    });

    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    }
    document.querySelector(".songinfo").innerText = decodeURI(track);
    document.querySelector(".songtime").innerText = "00:00 / 00:00";
};

async function displayAlbums() {
    console.log("displaying albums");
    let res = await fetch(`/songs/`);
    let text = await res.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");

    for (let a of anchors) {
        if (a.href.includes("/songs") && !a.href.includes(".htaccess")) {
            // let folder = a.href.split("/").slice(-2)[0];
            let folder = a.href.split("/").filter(Boolean).pop();
            // let folder = new URL(a.href).pathname.split("/").filter(Boolean).pop(); //  GOOD

            try {
                let data = await fetch(`/songs/${folder}/info.json`);
              
                
                let json = await data.json();
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2>${json.title}</h2>
                        <p>${json.description}</p>
                    </div>`;
            } catch (e) {
                console.error("Error loading info.json", e);
            }
        }
    }

    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            songs = await getSongs(`songs/${folder}`);
            playMusic(songs[0]);
        });
    });
}

async function main() {
    const play = document.getElementById("play");
    const previous = document.getElementById("previous");
    const next = document.getElementById("next");

    await getSongs("songs/amit");
    playMusic(songs[0], true);
    await displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
        } else {
            currentSong.pause();
            play.src = "img/play.svg";
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerText = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        document.querySelector(".circle").style.left = (percent * 100) + "%";
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = "img/volume.svg";
        }
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range input").value = 0;
        } else {
            e.target.src = "img/volume.svg";
            currentSong.volume = 0.1;
            document.querySelector(".range input").value = 10;
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    main();
});

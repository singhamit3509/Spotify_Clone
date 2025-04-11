console.log("Let's start JavaScript");

let currentSong = new Audio();
let songs; //making songs as global variable
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  //show all the songs in the playlist

  let songUl = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUl.innerHTML = "";
  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li><img class="invert" src="img/music.svg" alt="">
                             <div class="info">
                                 <div> ${song.replaceAll("%20", " ")} </div>
                                 <div>Amit Singh</div>
                             </div>
                             <div class="playnow">
                                 <span>Play Now</span>
                                 <img class="invert" src="img/play.svg" alt="">
                             </div> </li>`;
  }

  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
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
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}









async function displayAlbums() {
    // console.log("displaying albums")
    // let a = await fetch(`/songs/`)
    // let response = await a.text();
    // let div = document.createElement("div")
    // div.innerHTML = response;
    // let anchors = div.getElementsByTagName("a")
    // let cardContainer = document.querySelector(".cardContainer")
    // let array = Array.from(anchors)
    // for (let index = 0; index < array.length; index++) {
    //     const e = array[index];     
    //     if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
    //         let folder = e.href.split("/").slice(-2)[0]
    //         // Get the metadata of the folder
    //         let a = await fetch(`http://localhost:5500/songs/${folder}/info.json`)
    //         console.log(a);
            
    //         let response = await a.json(); 
    //         cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
    //         <div class="play">
    //             <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    //                 xmlns="http://www.w3.org/2000/svg">
    //                 <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
    //                     stroke-linejoin="round" />
    //             </svg>
    //         </div>

    //         <img src="/songs/${folder}/cover.webp" alt="">
    //         <h2>${response.title}</h2>
    //         <p>${response.description}</p>
    //     </div>`
    //     }
    // }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            console.log("Fetching Songs")
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            playMusic(songs[0])

        })
    })
}










async function main() {
  await getSongs("songs/kaushtubh");
  playMusic(songs[0], true);

  //display all the album on the page
//   await displayAlbums()

  //Attach elent listner to play next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });
  //Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} / ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });
  //add an event listner to the hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //add an event listner for close the hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //add eventlistner to pervious
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("previous clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  //add eventlistner to next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  //add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //Add an event listner to mute the track 
  document.querySelector(".volume > img").addEventListener("click", e=>{
    console.log(e.target)
    if(e.target.src.includes("img/volume.svg")){
        e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")  
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
    
  })
}

main();

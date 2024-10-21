const video = document.getElementById('video');
const play = document.getElementById('play');
const progress = document.getElementById('progress');
const timestamp = document.getElementById('timestamp');
const inferenceBtn = document.getElementById('inferenceBtn');
const inferenceStatus = document.getElementById('inferenceStatus');
const searchBtn = document.getElementById('searchBtn');
const videoInfoBtn = document.getElementById('videoInfoBtn');
const videoInfo = document.getElementById('videoInfo');
const searchBar = document.getElementById('searchBar');
const controls = document.getElementsByClassName('controls');
const timeOutputDiv = document.getElementById('timeOutput');
const videoFramesDiv = document.getElementById('videoFrames');

// Play & pause video
function toggleVideoStatus() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}



// Update play/pause icon
function updatePlayIcon() {
  play.innerHTML = video.paused ? '<i class="fa fa-play fa-2x"></i>' : '<i class="fa fa-pause fa-2x"></i>';
}

// Update progress & timestamp
function updateProgress() {
  progress.value = (video.currentTime / video.duration) * 100;

  let mins = Math.floor(video.currentTime / 60);
  let secs = Math.floor(video.currentTime % 60);

  mins = mins < 10 ? '0' + mins : mins;
  secs = secs < 10 ? '0' + secs : secs;

  timestamp.innerHTML = `${mins}:${secs}`;
}

// Set video time to progress
function setVideoProgress() {
  video.currentTime = (+progress.value * video.duration) / 100;
}

// 페이지 로드 시 text_set.json 파일 존재 여부 확인
window.onload = function() {
  fetch('/check_text_set')
    .then(response => response.json())
    .then(data => {
      if (data.exists) {
        // text_set.json이 있으면 searchBtn, videoInfoBtn 표시
        inferenceBtn.style.display = "none";
        searchBtn.style.display = "block";
        videoInfoBtn.style.display = "block";
      } else {
        // text_set.json이 없으면 inferenceBtn 표시
        inferenceBtn.style.display = "block";
        searchBtn.style.display = "none";
        videoInfoBtn.style.display = "none";
      }
    })
    .catch(error => {
      console.error('Error checking text_set.json:', error);
    });
};

// Toggle search bar visibility
function toggleSearchBar() {
  searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
}

// Toggle video info visibility
function toggleVideoInfo() {
  if (videoInfo.style.display === 'none') {
    videoInfo.style.display = 'block';
    videoInfo.innerHTML = `
      <h3>Video Info</h3>
      <p>This video is not provocative.</p>
      <p>This video is not violent.</p>
      <h3>Video Description</h3>
      <p>The video showcases various everyday activities, such as a man and a little boy having a meal, people reading in a library, and a group watching a soccer game. It also features a chef, musicians, business interactions among men in suits, and includes advertisements for printer products.</p>
    `;
  } else {
    videoInfo.style.display = 'none';
  }
}

// Fade in / fade out functionality
function fadeIn(element) {
  element.style.opacity = '1';
  element.style.transition = 'opacity 0.3s ease-in-out';
}

function fadeOut(element) {
  element.style.opacity = '0';
  element.style.transition = 'opacity 0.3s ease-in-out';
}

// Inference logic
function inference() {
  inferenceBtn.style.display = "none";
  inferenceStatus.style.display = "block";
  searchBtn.style.display = "none";
  videoInfoBtn.style.display = "none";
}

function handleInference() {
  fetch('/inference', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  })
  .then(response => response.json())
  .then(data => {
    const taskId = data.task_id;
    console.log('작업 ID:', taskId);
    checkStatus(taskId);
  })
  .catch(error => {
    console.error('에러:', error);
  });
}

// 상태 확인 및 text_set.json 존재 여부 확인
function checkStatus(taskId) {
  const statusDiv = document.getElementById('inferenceStatus');
  const interval = setInterval(() => {
    fetch(`/status/${taskId}`)
      .then(response => response.json())
      .then(data => {
        statusDiv.textContent = data.status;

        // 추론 완료 후 text_set.json 파일 다시 확인
        if (data.status === "100%") {
          fetch('/check_text_set')
            .then(response => response.json())
            .then(fileCheckData => {
              if (fileCheckData.exists) {
                searchBtn.style.display = "block";
                videoInfoBtn.style.display = "block";
                inferenceStatus.style.display = "none";
                clearInterval(interval);
              } else {
                inferenceBtn.style.display = "block";
                searchBtn.style.display = "none";
                videoInfoBtn.style.display = "none";
                inferenceStatus.style.display = "none";
                clearInterval(interval);
              }
            })
            .catch(error => {
              console.error('text_set.json 확인 중 에러 발생:', error);
              clearInterval(interval);
            });
        }
      })
      .catch(error => {
        console.error('에러:', error);
        clearInterval(interval);
      });
  }, 10000); // 3초마다 상태 확인
}

// Handle search
document.getElementById('searchBar').addEventListener('keyup', function(event) {
  if (event.key === 'Enter') {
    const searchInput = document.getElementById('searchBar').querySelector('input').value;
    fetch('/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ search_text: searchInput })
    })
    .then(response => response.json())
    .then(data => {
      videoFramesDiv.innerHTML = '';
      JSON.parse(data.result).forEach((time, index) => {
        fetch(`/get_frame?time=${time}&index=${index}`)
          .then(response => response.json())
          .then(frameData => {
            const frameImg = document.createElement('img');
            frameImg.src = `${frameData.frame_url}?${new Date().getTime()}`; // Prevent caching
            frameImg.style.width = '30%';
            frameImg.alt = `Frame at Time ${index + 1}`;
            frameImg.addEventListener('click', () => {
              video.currentTime = time;
              searchBar.style.display = 'none';
            });
            videoFramesDiv.appendChild(frameImg);
          })
          .catch(error => {
            console.error('Error fetching frame:', error);
          });
      });
      document.getElementById('searchBar').querySelector('input').value = '';
    })
    .catch(error => {
      console.error('Error:', error);
    });
  }
});

// Drag and drop video file
const dropArea = document.getElementById('drop-area');

dropArea.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = '#ebe5e5'; // Change background color on drag
});

dropArea.addEventListener('dragleave', () => {
  dropArea.style.backgroundColor = '#ffffff'; // Reset background color
});

dropArea.addEventListener('drop', (event) => {
  event.preventDefault();
  dropArea.style.backgroundColor = '#ffffff';
  dropArea.style.display = "none";
  const files = event.dataTransfer.files;

  if (files.length > 0) {
    const videoFile = files[0];
    if (videoFile.type.startsWith('video/')) {
      const videoURL = URL.createObjectURL(videoFile);
      video.src = videoURL;
      video.load();
      video.play();
      showControls();
    } else {
      alert('Please drop a valid video file.');
    }
  }
});

// Show controls when video is loaded
function showControls() {
  for (let control of controls) {
    control.style.display = 'flex';
  }
  video.style.display = 'block';
}

// Event listeners
video.addEventListener('click', toggleVideoStatus);
video.addEventListener('pause', updatePlayIcon);
video.addEventListener('play', updatePlayIcon);
video.addEventListener('timeupdate', updateProgress);
play.addEventListener('click', toggleVideoStatus);
progress.addEventListener('change', setVideoProgress);
searchBtn.addEventListener('click', toggleSearchBar);
videoInfoBtn.addEventListener('click', toggleVideoInfo);
inferenceBtn.addEventListener('click', inference);
document.getElementById('inferenceBtn').addEventListener('click', handleInference);

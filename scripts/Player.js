// 
// Функция-конструктор принимает два параметра: куда сгенерировать плеер и объект настроек.
// Объект настроек необязателен. В случае без него, объект будет сгенерирован с дефолтными.
// Функция-колбэк для кнопки загрузки просто передаётся в свойство upload уже инстанцированного объекта.
// 

function SomePlayer(node, options) {
        this.upload = function(){};
        this.options = {
            title: null,
            src: null,
            play: false
        }

        if(options) {
            this.options.title = options.title || 'Без названия';
            this.options.src = options.src || './files/2.mp3';
        } else {
            this.options.title = 'Без названия';
            this.options.src = './files/2.mp3';
        }

        this.audio = new Audio(this.options.src);
        this.audio.volume = 0.5;
        this.audio.addEventListener('loadedmetadata', (function() {
            this.elem = document.createElement('player');
            this.elem.classList.add('player');
            this.elem.innerHTML = ` 
            <div class="player-title">
                <h4>${this.options.title}</h4>
            </div>
            <div class="player-controls">
                <div class="player-media">
                    <img class="player-icon" src="./files/play-button.svg" alt="">
                    <img class="hidden player-icon" src="./files/pause-button.svg"alt="">
                </div>
                <span class="current-time">${getTime(this.audio.currentTime).m}:${getTime(this.audio.currentTime).s}</span>
                <div class="timeline">
                    <div class="timeline-progress"></div>
                </div>
                <span class="remaining-time">${getTime(this.audio.duration).m}:${getTime(this.audio.duration).s}</span>
                <div class="audio-speed">
                    <span class="speed-btn">1</span>
                    <ul class="hidden dropdown-menu">
                        <li class="menu-item" speed-rate=2.25>2.25</li>
                        <li class="menu-item" speed-rate=2>2</li>
                        <li class="menu-item" speed-rate=1.75>1.75</li>
                        <li class="menu-item" speed-rate=1.5>1.5</li>
                        <li class="menu-item" speed-rate=1.25>1.25</li>
                        <li class="menu-item" speed-rate=1>1</li>
                        <li class="menu-item" speed-rate=0.75>0.75</li>
                        <li class="menu-item" speed-rate=0.5>0.5</li>
                    </ul>
                </div>
                <div class="volume">
                    <img class="volume-btn player-icon" src="./files/volume.svg" alt="">
                    <div class="volume-range">
                        <div class="current-volume"></div>
                    </div>
                </div>

            </div>
            <div class="loads">
                <a download href="${this.options.src}" ><img src="./files/download.svg" /></a>
                <a class="upload" href="#" ><img src="./files/upload-button.svg" /></a>
            </div>
            `;

            node.insertAdjacentElement('beforeend', this.elem);

            let mediaBtn = this.elem.querySelector('.player-media');

            mediaBtn.addEventListener('click', (e) => {
                this.options.play = !this.options.play;

                if(this.options.play === true) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }

                [].forEach.call(mediaBtn.querySelectorAll('img'), (i) => {
                    i.classList.toggle('hidden');
                })
            })

            const timeline = this.elem.querySelector('.timeline');

            timeline.addEventListener('click', (function(e) {
                let p = e.offsetX / timeline.clientWidth;
                this.audio.currentTime = this.audio.duration * p;
                timeline.querySelector('div').style.width = p * 100 + '%';
            }).bind(this));

            setInterval((function(){

                let p = this.audio.currentTime / this.audio.duration;
                timeline.querySelector('.timeline-progress').style.width = p * 100 + '%';
                this.elem.querySelector('.current-time').innerHTML = `${getTime(this.audio.currentTime).m}:${getTime(this.audio.currentTime).s}`;
                this.elem.querySelector('.remaining-time').innerHTML = `-${getTime(this.audio.duration-this.audio.currentTime).m}:${getTime(this.audio.duration-this.audio.currentTime).s}`;
                
            }).bind(this), 300);

            let speed = this.elem.querySelector('.audio-speed');

            speed.addEventListener('click', (function(e){

                if(e.target.classList.contains('speed-btn')) {
                    speed.querySelector('.dropdown-menu').classList.toggle('hidden');
                } else if (
                    e.target.classList.contains('menu-item')) {
                    let x = e.target.getAttribute('speed-rate');
                    this.audio.playbackRate = x;
                    speed.querySelector('.dropdown-menu').classList.add('hidden');
                    speed.querySelector('.speed-btn').innerHTML = x;
                }

            }).bind(this))

            const volume = this.elem.querySelector('.volume-range');

            volume.addEventListener('click', (function(e) {
                let p = e.offsetX / volume.clientWidth;

                if(p<0.05) {
                    p = 0;
                } else if(p>0.95) {
                    p = 1;
                }

                this.audio.volume = p;
                volume.querySelector('div').style.width = p * 100 + '%';
            }).bind(this));

            this.audio.addEventListener('ended', (function(){
                this.audio.currentTime = 0;
                [].forEach.call(mediaBtn.querySelectorAll('img'), function(i){
                    i.classList.toggle('hidden');
                })
                this.options.play = !this.options.play;
            }).bind(this));

            this.elem.querySelector('.upload').addEventListener('click', (function(){
                this.upload();
            }).bind(this));
        }).bind(this))
}

function getTime(num) {
    return {
        m: Math.floor(num/60),
        s: Math.round(num - Math.floor(num/60) * 60) < 10 ? '0' + Math.round(num - Math.floor(num/60) * 60) : Math.round(num - Math.floor(num/60) * 60)
    }
}
//---------CONFIGS--------
const CONFIG = {
    triangle:{
        count: 19,
        width: 150,
        height: 450,
        radius: 480
    },
    angular_speed: 0.0005
}

const FISH_CONFIG = {
    count: 6,
    width: 60,
    height: 160,
    positions:[
        { x: -60, y: -78, rotation: -30, zIndex: 1, scale: 0.93 }, 
        { x: -40, y: -75, rotation: -20, zIndex: 2, scale: 0.93 },
        { x: -15, y: -77, rotation: -5, zIndex: 3, scale: 0.94 },
        { x: 15, y: -78, rotation: 10, zIndex: 4, scale: 0.94 }, 
        { x: 50, y: -79, rotation: 20, zIndex: 5, scale: 0.95 },
        { x: 70, y: -78, rotation: 30, zIndex: 6, scale: 1 }
    ],
    respawnDelay: 0,
    spawnAnimation: {
        startX: -300,
        startY: 300,
        startRotation: 0,
        startScale: 0.5,
        duration: 800,
        easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
    }
}

//---------CAT_CONFIG---------
//---------CAT_CONFIG---------
const CAT_CONFIG = {
    // Голова
    headY: 0,
    headSpeed: 0.05,
    moveDistance: 5,
    headDirection: 'down',
    isMoving: true,
    pettingInterval: null,

    // Глаза
    eyesX: 0,
    eyesY: 0,
    targetEyesX: 0,      // Новое: целевая позиция для слежения
    targetEyesY: 0,      // Новое: целевая позиция для слежения
    EyesDistance: 7,
    eyesPupilsSpeed: 0.05,
    eyeDirection: 'right',
    globalEyeDirection: 'chill',
    isTracking: false,   // Новое: флаг слежения за объектом
    trackedObject: null, // Новое: отслеживаемый объект

    // Моргание
    isBlinking: false,
    nextBlinkTime: 0,
    blinkTimeout: null,

    // Ушки
    earsX: 0,
    earsY: 0,
    earsRotation: 0,
    earsDirection: 'down',
    earScale: 1,
    earTwitch: {left: false, right: false},
    earTimeout: {left: null, right: null},

    // Настроение
    currentMood: 'chill',
    moodTimeout: null,
    eyesMoving: true,
    tailPullCount: 0,
    lastFeedTime: 0,

    // Время
    lastTime: 0,

    //Звуки
    purringAudio: null,
    isPurring: false,
    hissingAudio: null,
    isHissing: false
}

const MOOD_CONFIG = {
    chill: {
        headOffset: 1,
        eyes: 'normal',
        mouth: 'normal',
        pupils: true,
        blinking: true,
        headMovement: true,
        earsPosition: 'normal'
    },
    enjoy: {
        headOffset: 5,
        eyes: 'blink',
        mouth: 'normal',
        pupils: false,
        blinking: false,
        headMovement: true,
        earsPosition: 'down'
    },
    sad: {
        headOffset: 5,
        eyes: 'sad',
        mouth: 'sad',
        pupils: false,
        blinking: true,
        headMovement: false,
        blinkOffset: 5,
        earsPosition: 'down'
    },
    happy: {
        headOffset: 0,
        eyes: 'blink',
        mouth: 'happy',
        pupils: true,
        blinking: false,
        headMovement: true,
        earsPosition: 'normal'
    },
    scared: {
        headOffset: 0,
        eyes: 'normal',
        mouth: 'normal',
        pupils: true,
        blinking: false,
        headMovement: true,
        earsPosition: 'back'
    },
    angry: {
        headOffset: 5,
        eyes: 'angry',
        mouth: 'angry',
        pupils: false,
        blinking: false,
        headMovement: false,
        earsPosition: 'down'
    }
}

//----------GAME_STATE---------
const GameState = {
    triangles: [],
    fishes: [],
    lastTime: 0,
    score: 0,
    draggingFish: null,
    dragOffset: { x: 0, y: 0 },
    musicValue: 0.7,
    backgroundMusic: null,
    isMusicPlaying: true,
    fishPool: []
}

// ---------------Settings-------------
function settingsBtn(){
    const menu_btn = document.getElementById('menu-btn')
    const menuOverlay = document.getElementById('menuOverlay')
    const close_btn = document.getElementById('close-menu')
    const musicValueDisplay = document.getElementById('sfx-value')
    const musicRange = document.getElementById('music-volume')
    const musicToggleBtn = document.getElementById('music-toggle')

    menu_btn.addEventListener('click', function(event) {
        event.stopPropagation();
        if (menuOverlay.classList.contains('hidden')) {
            menuOverlay.classList.remove('hidden')
        } else {
            menuOverlay.classList.add('hidden')
        }
    })

    document.addEventListener('click', function(event) {
        if (!menu_btn.contains(event.target) && 
            !menuOverlay.contains(event.target) && 
            !menuOverlay.classList.contains('hidden')) {
            menuOverlay.classList.add('hidden')
        }
    })
    menuOverlay.addEventListener('click', function(event) {
        if (event.target === menuOverlay) {
            menuOverlay.classList.add('hidden')
        }
    })

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && !menuOverlay.classList.contains('hidden')) {
            menuOverlay.classList.add('hidden')
        }
    })

    close_btn.addEventListener('click',function(){
        menuOverlay.classList.add('hidden')
    })

    if (musicValueDisplay && musicRange){
        musicValueDisplay.textContent = Math.round(GameState.musicValue * 100) + '%'
        musicRange.value = GameState.musicValue * 100

        musicRange.addEventListener('input', function(){
            const value = parseFloat(this.value) / 100
            
            musicValueDisplay.textContent = Math.round(value * 100) + '%'
            GameState.musicValue = value
        
            AudioManager.setMusicVolume(value)
        })
    }
    
    if (musicToggleBtn) {
        musicToggleBtn.textContent = AudioManager.isMusicPlaying ? 'Выкл' : 'Вкл';
        musicToggleBtn.addEventListener('click', function(){
            const isPlaying = AudioManager.toggleMusic()
            this.textContent = isPlaying ? 'Выкл' : 'Вкл'
        });
    }
}

//---------AUDIO_MANAGER---------
const AudioManager = {
    music: null,
    sounds: {
        meow: null,
    },
    isMusicPlaying: false,
    
    init() {
        this.music = new Audio('assets/main_music.mp3')
        this.music.loop = true
        this.music.volume = GameState.musicValue
        
        this.sounds.meow = new Audio('assets/may.mp3')
        this.sounds.meow.volume = 0.7
    },
    
    playMusic(){
        if (this.music){
            this.music.play().catch(e => {
                console.log("Ошибка воспроизведения музыки:", e)
            })
            this.isMusicPlaying = true
        }
    },
    
    pauseMusic(){
        if (this.music){
            this.music.pause()
            this.isMusicPlaying = false
        }
    },
    
    stopMusic(){
        if (this.music){
            this.music.pause()
            this.music.currentTime = 0
            this.isMusicPlaying = false
        }
    },
    
    setMusicVolume(volume){
        const normalizedVolume = Math.max(0, Math.min(1, volume))
        
        if (this.music){
            this.music.volume = normalizedVolume
        }
        if (this.sounds.meow){
            this.sounds.meow.volume = normalizedVolume * 0.7
        }
        
        GameState.musicValue = normalizedVolume
    },
    
    playSound(soundName){
        if (this.sounds[soundName]){
            const soundClone = this.sounds[soundName].cloneNode()
            soundClone.volume = this.sounds[soundName].volume
            
            soundClone.play().catch(e => {
                console.log("Ошибка воспроизведения звука:", e)
            })
            
            soundClone.addEventListener('ended', () => {
                soundClone.remove()
            })
        }
    },
    
    toggleMusic(){
        if (this.isMusicPlaying){
            this.pauseMusic()
        } else {
            this.playMusic()
        }
        return this.isMusicPlaying
    },

    fadeMusic(duration = 1000, toVolume = 0){
        if (!this.music) return;
        
        const startVolume = this.music.volume
        const change = toVolume - startVolume
        const startTime = performance.now()
        
        const fadeStep = (timestamp) => {
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / duration, 1)
            
            this.music.volume = startVolume + (change * progress)
            
            if (progress < 1){
                requestAnimationFrame(fadeStep)
            } else if (toVolume === 0){
                this.pauseMusic()
            }
        }
        
        requestAnimationFrame(fadeStep)
    }
}

function playMeowSound(){
    AudioManager.playSound('meow')
}

document.addEventListener('visibilitychange', function(){
    if (!AudioManager.music) return
    
    if (document.hidden) {
        AudioManager.music.volume = 0
    } else {
        AudioManager.music.volume = GameState.musicValue
    }
})

//-------------CAT FUNCTIONS---------------

function updateCatHead() {
    const catHead = document.getElementById('cat-head')
    const currentConfig = MOOD_CONFIG[CAT_CONFIG.currentMood]
    const headY = CAT_CONFIG.headY + currentConfig.headOffset
    
    catHead.style.transform = `translateY(${headY}px)`
}

function moveHead() {
    const currentConfig = MOOD_CONFIG[CAT_CONFIG.currentMood]
    
    if (!currentConfig.headMovement) {
        updateCatHead()
        return
    }
    
    switch(CAT_CONFIG.headDirection) {
        case 'down':
            CAT_CONFIG.headY += CAT_CONFIG.headSpeed
            if (CAT_CONFIG.headY >= CAT_CONFIG.moveDistance) {
                CAT_CONFIG.headDirection = 'up'
            }
            break
        
        case 'up':
            CAT_CONFIG.headY -= CAT_CONFIG.headSpeed
            if (CAT_CONFIG.headY <= 0) {
                CAT_CONFIG.headDirection = 'down'
            }
            break
    }
    updateCatHead()
}

function petCatHead() {
    const headHitbox = document.getElementById('head-hitbox')
    if (!headHitbox) return
    
    let isPetting = false
    let pettingTimer = null
    
    function clearPettingTimer() {
        if (pettingTimer) {
            clearTimeout(pettingTimer)
            pettingTimer = null
        }
    }
    
    headHitbox.addEventListener('mousedown', function(e) {
        e.stopPropagation()
        isPetting = true
        pettingTimer = setTimeout(() => {
            if (isPetting) {
                changeMood('enjoy')
            }
        }, 500)
    })
    
    headHitbox.addEventListener('mouseup', function() {
        if (isPetting) {
            clearPettingTimer()
            if (CAT_CONFIG.currentMood === 'enjoy') {
                changeMood('chill')
            }
        }
        isPetting = false
    })
    
    headHitbox.addEventListener('mouseleave', function() {
        if (isPetting) {
            clearPettingTimer()
            if (CAT_CONFIG.currentMood === 'enjoy') {
                changeMood('chill')
            }
        }
        isPetting = false
    })
}

function startPettingAnimation() {
    const head = document.getElementById('cat-head')
    if (!head) return
    
    let animationId = null
    let startTime = null
    
    function animatePetting(currentTime) {
        if (!startTime) startTime = currentTime
        
        const elapsed = currentTime - startTime
        const angle = Math.sin(elapsed / 200) * 2
        
        const currentConfig = MOOD_CONFIG[CAT_CONFIG.currentMood]
        const headY = CAT_CONFIG.headY + currentConfig.headOffset
        
        head.style.transform = `translateY(${headY}px) rotate(${angle}deg)`
        
        if (CAT_CONFIG.currentMood === 'enjoy') {
            animationId = requestAnimationFrame(animatePetting)
        }
    }

    animationId = requestAnimationFrame(animatePetting)
    CAT_CONFIG.pettingInterval = animationId
}

function stopPettingAnimation() {
    if (CAT_CONFIG.pettingInterval) {
        cancelAnimationFrame(CAT_CONFIG.pettingInterval)
        CAT_CONFIG.pettingInterval = null
    }
    updateCatHead()
}

function updateCatEyes(){
    const pupils = document.getElementById('cat-eyes-pupils')
    if (!pupils) return
    
    const roundedX = Math.round(CAT_CONFIG.eyesX)
    const roundedY = Math.round(CAT_CONFIG.eyesY)
    
    pupils.style.transform = `translate(${roundedX}px, ${roundedY}px)`
}

// Новая функция: расчет позиции для слежения за объектом
function calculateTrackingPosition(targetElement) {
    if (!targetElement) return { x: 0, y: 0 }
    
    const catArea = document.querySelector('.cat-area')
    if (!catArea) return { x: 0, y: 0 }
    
    const catRect = catArea.getBoundingClientRect()
    const targetRect = targetElement.getBoundingClientRect()
    
    // Центр головы кота (где находятся глаза)
    const catCenterX = catRect.left + catRect.width * 0.5
    const catCenterY = catRect.top + catRect.height * 0.3 // Глаза находятся в верхней части
    
    // Центр цели (рыбки)
    const targetCenterX = targetRect.left + targetRect.width / 2
    const targetCenterY = targetRect.top + targetRect.height / 2
    
    // Разница в позициях
    const deltaX = targetCenterX - catCenterX
    const deltaY = targetCenterY - catCenterY
    
    // Максимальное смещение зрачков
    const maxEyeShift = CAT_CONFIG.EyesDistance
    
    // Ограничиваем смещение
    let eyeX = (deltaX / 200) * maxEyeShift
    let eyeY = (deltaY / 200) * maxEyeShift
    
    // Ограничиваем значения
    eyeX = Math.max(-maxEyeShift, Math.min(maxEyeShift, eyeX))
    eyeY = Math.max(-maxEyeShift, Math.min(maxEyeShift, eyeY))
    
    return { x: eyeX, y: eyeY }
}

// Новая функция: начать слежение за объектом
function startTrackingObject(element) {
    if (!element) return
    
    CAT_CONFIG.isTracking = true
    CAT_CONFIG.trackedObject = element
    CAT_CONFIG.eyesMoving = false // Отключаем случайное движение глаз
    
    // Сразу вычисляем целевую позицию
    const targetPos = calculateTrackingPosition(element)
    CAT_CONFIG.targetEyesX = targetPos.x
    CAT_CONFIG.targetEyesY = targetPos.y
    
    // Сразу перемещаем глаза к цели (без плавности для начальной позиции)
    CAT_CONFIG.eyesX = targetPos.x
    CAT_CONFIG.eyesY = targetPos.y
    
    updateCatEyes()
}

function stopTrackingObject() {
    
    CAT_CONFIG.isTracking = false
    CAT_CONFIG.trackedObject = null
    CAT_CONFIG.eyesMoving = true

    CAT_CONFIG.targetEyesX = 0
    CAT_CONFIG.targetEyesY = 0
}

function getRandomNextDirection(currentDirection) {
    const possibleDirection = {
        'right': ['down', 'up'],
        'down': ['left', 'right'],
        'left': ['up', 'down'],
        'up': ['right', 'left']
    }
    const directions = possibleDirection[currentDirection]
    const randomIndex = Math.floor(Math.random() * directions.length)
    return directions[randomIndex]
}

function moveEyes(){
    if (CAT_CONFIG.isBlinking) return

    if (CAT_CONFIG.isTracking && CAT_CONFIG.trackedObject) {
        const targetPos = calculateTrackingPosition(CAT_CONFIG.trackedObject)
        CAT_CONFIG.targetEyesX = targetPos.x
        CAT_CONFIG.targetEyesY = targetPos.y

        CAT_CONFIG.eyesX += (CAT_CONFIG.targetEyesX - CAT_CONFIG.eyesX) * 0.15
        CAT_CONFIG.eyesY += (CAT_CONFIG.targetEyesY - CAT_CONFIG.eyesY) * 0.15
        
        updateCatEyes()
        return
    }

    if (CAT_CONFIG.currentMood === 'scared') {
        CAT_CONFIG.eyesX = CAT_CONFIG.EyesDistance
        CAT_CONFIG.eyesY = CAT_CONFIG.EyesDistance / 2
        updateCatEyes()
        return
    }
    
    if (!CAT_CONFIG.eyesMoving) return
    switch(CAT_CONFIG.eyeDirection){
        case 'right':
            CAT_CONFIG.eyesX += CAT_CONFIG.eyesPupilsSpeed
            if (CAT_CONFIG.eyesX >= CAT_CONFIG.EyesDistance){
                CAT_CONFIG.eyeDirection = getRandomNextDirection('right')
                CAT_CONFIG.eyesX = CAT_CONFIG.EyesDistance
            }
            break
            
        case 'down':
            CAT_CONFIG.eyesY += CAT_CONFIG.eyesPupilsSpeed
            if (CAT_CONFIG.eyesY >= CAT_CONFIG.EyesDistance){
                CAT_CONFIG.eyeDirection = getRandomNextDirection('down')
                CAT_CONFIG.eyesY = CAT_CONFIG.EyesDistance
            }
            break
            
        case 'left':
            CAT_CONFIG.eyesX -= CAT_CONFIG.eyesPupilsSpeed
            if (CAT_CONFIG.eyesX <= -CAT_CONFIG.EyesDistance){
                CAT_CONFIG.eyeDirection = getRandomNextDirection('left')
                CAT_CONFIG.eyesX = -CAT_CONFIG.EyesDistance
            }
            break
            
        case 'up':
            CAT_CONFIG.eyesY -= CAT_CONFIG.eyesPupilsSpeed
            if (CAT_CONFIG.eyesY <= -CAT_CONFIG.EyesDistance){
                CAT_CONFIG.eyeDirection = getRandomNextDirection('up')
                CAT_CONFIG.eyesY = -CAT_CONFIG.EyesDistance
            }
            break
    }
    
    // Синхронизируем целевую позицию с текущей при случайном движении
    CAT_CONFIG.targetEyesX = CAT_CONFIG.eyesX
    CAT_CONFIG.targetEyesY = CAT_CONFIG.eyesY
    
    if (Math.random() < 0.01) {
        const allDirections = ['right', 'down', 'left', 'up']
        CAT_CONFIG.eyeDirection = allDirections[Math.floor(Math.random() * allDirections.length)]
    }
    updateCatEyes()
}

function eyesBlink() {
    if (CAT_CONFIG.isBlinking) return
    if (!MOOD_CONFIG[CAT_CONFIG.currentMood].blinking) return

    CAT_CONFIG.isBlinking = true

    const catEyesBlink = document.getElementById('cat-eyes-blink')

    let currentEyesId = 'cat-eyes'
    if (CAT_CONFIG.currentMood === 'sad') currentEyesId = 'cat-eyes-sad'
    if (CAT_CONFIG.currentMood === 'angry') currentEyesId = 'cat-eyes-angry'
    if (CAT_CONFIG.currentMood === 'enjoy') currentEyesId = 'cat-eyes-blink'
    
    const currentEyes = document.getElementById(currentEyesId)
    const pupils = document.getElementById('cat-eyes-pupils')

    if (currentEyes) currentEyes.classList.add('hidden')
    if (pupils) pupils.classList.add('hidden')
    
    if (catEyesBlink) {
        let blinkOffset = 0
        if (CAT_CONFIG.currentMood === 'sad') {
            blinkOffset = 5
        }
        catEyesBlink.style.transform = `translateY(${blinkOffset}px)`
        catEyesBlink.classList.remove('hidden')
    }
    
    setTimeout(() => {
        if (catEyesBlink) {
            catEyesBlink.classList.add('hidden')
            catEyesBlink.style.transform = 'translateY(0px)'
        }
        if (currentEyes) currentEyes.classList.remove('hidden')
        
        const config = MOOD_CONFIG[CAT_CONFIG.currentMood]
        if (pupils && config.pupils) {
            pupils.classList.remove('hidden')
        }
        
        CAT_CONFIG.isBlinking = false

        if (config.blinking) {
            scheduleNextBlink()
        }
    }, Math.random() * 150 + 150)
}

function scheduleNextBlink() {
    const nextBlinkTime = Math.random() * 4000 + 2000
    
    setTimeout(() => {
        if (Math.random() < 0.2) {
            eyesBlink()
            setTimeout(eyesBlink, 200)
        } else {
            eyesBlink()
        }
    }, nextBlinkTime)
}

function startBlinking() {
    if (!CAT_CONFIG.blinkTimeout) {
        scheduleNextBlink()
    }
}

function updateCatEars(side){
    const catEar = document.querySelector(`.cat-ear-${side}`)
    if (!catEar) return 

    if (CAT_CONFIG.earTimeout[side]) {
        clearTimeout(CAT_CONFIG.earTimeout[side])
    }

    if (side === 'left') {
        catEar.style.transform = 'translateX(-5px) rotate(-3deg) scale(0.95)'
    } else {
        catEar.style.transform = 'translateX(5px) rotate(3deg) scale(0.95)'
    }

    CAT_CONFIG.earTimeout[side] = setTimeout(() => {
        catEar.style.transform = 'translateX(0) rotate(0) scale(1)'
    }, 300)
}

function initEarInteractions(){
    const hitboxes = document.querySelectorAll('.ear-hitbox')
    
    hitboxes.forEach(hitbox => {
        hitbox.addEventListener('click', function(e) {
            e.stopPropagation()
            const side = this.dataset.ear
            updateCatEars(side)
        })
    })
}

function updateCatEarsForMood(mood) {
    const leftEar = document.querySelector('.cat-ear-left')
    const rightEar = document.querySelector('.cat-ear-right')
    
    if (!leftEar || !rightEar) return
    
    const config = MOOD_CONFIG[mood]
    
    switch(config.earsPosition) {
        case 'down':    
            leftEar.style.transform = 'translateX(-3px) rotate(-4deg) scale(0.95)'
            rightEar.style.transform = 'translateX(3px) rotate(4deg) scale(0.95)'
            break
            
        case 'back':
            leftEar.style.transform = 'translateX(-5px) rotate(-3deg) scale(0.95)'
            rightEar.style.transform = 'translateX(5px) rotate(3deg) scale(0.95)'
            break
            
        case 'normal':
        default:
            leftEar.style.transform = 'translateX(0) rotate(0) scale(1)'
            rightEar.style.transform = 'translateX(0) rotate(0) scale(1)'
            break
    }
}

function updateMoodElements(mood) {
    const config = MOOD_CONFIG[mood]

    const allElements = [
        'cat-eyes', 'cat-eyes-sad', 'cat-eyes-angry', 
        'cat-eyes-pupils', 'cat-eyes-blink',
        'cat-mouth', 'cat-mouth-sad', 'cat-mouth-happy', 'cat-mouth-angry'
    ]
    
    allElements.forEach(id => {
        const el = document.getElementById(id)
        if (el) el.classList.add('hidden')
    })

    let eyesId = 'cat-eyes'
    if (mood === 'sad') eyesId = 'cat-eyes-sad'
    if (mood === 'angry') eyesId = 'cat-eyes-angry'
    if (mood === 'enjoy') eyesId = 'cat-eyes-blink'

    const eyes = document.getElementById(eyesId)
    if (eyes) {
        eyes.classList.remove('hidden')
        eyes.style.transform = ''
    }

    let mouthId = 'cat-mouth'
    if (mood === 'sad') mouthId = 'cat-mouth-sad'
    if (mood === 'happy') mouthId = 'cat-mouth-happy'
    if (mood === 'angry') mouthId = 'cat-mouth-angry'
    
    const mouth = document.getElementById(mouthId)
    if (mouth) {
        mouth.classList.remove('hidden')
        mouth.style.transform = ''
    }
    
    const pupils = document.getElementById('cat-eyes-pupils')
    if (pupils) {
        if (config.pupils) {
            pupils.classList.remove('hidden')
            pupils.style.transform = `translate(${CAT_CONFIG.eyesX}px, ${CAT_CONFIG.eyesY}px)`
        } else {
            pupils.classList.add('hidden')
        }
    }
    updateCatEarsForMood(mood)
}

function changeMood(mood) {
    if (CAT_CONFIG.currentMood === mood) return
    
    CAT_CONFIG.currentMood = mood
    
    const config = MOOD_CONFIG[mood]
    
    // Не отключаем отслеживание при смене настроения, но учитываем конфигурацию
    if (!CAT_CONFIG.isTracking) {
        CAT_CONFIG.eyesMoving = (mood === 'chill' || mood === 'happy' || mood === 'scared' || mood === 'enjoy')
    }
    
    if (mood === 'enjoy') {
        startPettingAnimation()
        playPurringSound()
    } else {
        stopPettingAnimation()
        stopPurringSound()
    }

    if (mood === 'angry') {
        playHissingSound()
    } else {
        stopHissingSound()
    }

    if (mood === 'scared' && !CAT_CONFIG.isTracking) {
        CAT_CONFIG.eyesX = CAT_CONFIG.EyesDistance
        CAT_CONFIG.eyesY = CAT_CONFIG.EyesDistance / 2
        CAT_CONFIG.targetEyesX = CAT_CONFIG.eyesX
        CAT_CONFIG.targetEyesY = CAT_CONFIG.eyesY
    } else if (mood !== 'scared' && CAT_CONFIG.currentMood === 'scared' && !CAT_CONFIG.isTracking) {
        CAT_CONFIG.eyesX = 0
        CAT_CONFIG.eyesY = 0
        CAT_CONFIG.targetEyesX = 0
        CAT_CONFIG.targetEyesY = 0
    }

    if (CAT_CONFIG.moodTimeout && mood !== 'enjoy') {
        clearTimeout(CAT_CONFIG.moodTimeout)
        CAT_CONFIG.moodTimeout = null
    }

    if (mood !== 'chill' && mood !== 'sad' && mood !== 'enjoy') {
        const durations = {
            happy: 500,
            scared: 2000,
            angry: 3000
        }
        
        if (durations[mood] > 0) {
            CAT_CONFIG.moodTimeout = setTimeout(() => {
                changeMood('chill')
            }, durations[mood])
        }
    }

    if (!config.blinking && CAT_CONFIG.blinkTimeout && mood !== 'enjoy') {
        clearTimeout(CAT_CONFIG.blinkTimeout)
        CAT_CONFIG.blinkTimeout = null
    }
    
    updateMoodElements(mood)
    updateCatEarsForMood(mood)
    updateCatHead()
    updateCatEyes()
    
    if (config.blinking) {
        startBlinking()
    }
    
    updateTailByMood()
}


function checkHunger() {
    if (Date.now() - CAT_CONFIG.lastFeedTime > 15000) {
        changeMood('sad')
    } else if (CAT_CONFIG.currentMood === 'sad') {
        changeMood('chill')
    }
}

function initTailInteraction() {
    const tailHitbox = document.querySelector('.tail-hitbox')
    if (!tailHitbox) return
    
    tailHitbox.addEventListener('click', function(e) {
        e.stopPropagation()
        e.preventDefault()

        CAT_CONFIG.tailPullCount++
        
        if (CAT_CONFIG.tailPullCount >= 5) {
            changeMood('angry')
            setTimeout(() => {
                CAT_CONFIG.tailPullCount = 0
            }, 10000)
        } else {
            changeMood('scared')
        }
    })
}

function updateTailByMood() {
    const tail = document.getElementById('cat-tail')
    if (!tail) return
    
    switch(CAT_CONFIG.currentMood) {
        case 'sad':
        case 'scared':
        case 'angry':
            tail.src = 'assets/cat_parts/tail_scared.png'
            break
        case 'chill':
        case 'happy':
        case 'enjoy':
        default:
            tail.src = 'assets/cat_parts/tail.gif'
            break
    }
}

function playPurringSound() {
    if (!CAT_CONFIG.purringAudio) {
        CAT_CONFIG.purringAudio = new Audio('assets/cat_parts/purring.mp3')
        CAT_CONFIG.purringAudio.loop = true
        CAT_CONFIG.purringAudio.volume = 0.5
    }
    
    CAT_CONFIG.isPurring = true;
    if (CAT_CONFIG.purringAudio.paused) {
        CAT_CONFIG.purringAudio.play()
    }
}

function stopPurringSound() {
    if (CAT_CONFIG.purringAudio && !CAT_CONFIG.purringAudio.paused) {
        CAT_CONFIG.purringAudio.pause()
        CAT_CONFIG.purringAudio.currentTime = 0
    }
    CAT_CONFIG.isPurring = false
}

function playHissingSound() {
    if (!CAT_CONFIG.hissingAudio) {
        CAT_CONFIG.hissingAudio = new Audio('assets/cat_parts/hissing.mp3')
        CAT_CONFIG.hissingAudio.volume = 0.4
    }
    
    CAT_CONFIG.isHissing = true;
    if (CAT_CONFIG.hissingAudio.paused) {
        CAT_CONFIG.hissingAudio.play()
    }
}

function stopHissingSound() {
    if (CAT_CONFIG.hissingAudio && !CAT_CONFIG.hissingAudio.paused) {
        CAT_CONFIG.hissingAudio.pause()
        CAT_CONFIG.hissingAudio.currentTime = 0
    }
    CAT_CONFIG.isHissing = false
}

function catGameLoop(currentTime) {
    if (CAT_CONFIG.lastTime != 0) {
        const deltaTime = currentTime - CAT_CONFIG.lastTime

        if (CAT_CONFIG.isMoving) {
            moveHead()
            
            if (!CAT_CONFIG.isBlinking && (CAT_CONFIG.eyesMoving || CAT_CONFIG.isTracking)) {
                moveEyes()
            }
        }
        
        // Добавьте эту строку для плавного возврата глаз когда не трекаем
        if (!CAT_CONFIG.isTracking && !CAT_CONFIG.eyesMoving) {
            // Плавно возвращаем глаза к целевой позиции (0,0)
            if (Math.abs(CAT_CONFIG.eyesX) > 0.1 || Math.abs(CAT_CONFIG.eyesY) > 0.1) {
                CAT_CONFIG.eyesX *= 0.9
                CAT_CONFIG.eyesY *= 0.9
                updateCatEyes()
            }
        }
        
        if (currentTime - CAT_CONFIG.lastTime > 1000) {
            checkHunger()
            CAT_CONFIG.lastTime = currentTime
        }
    } else {
        CAT_CONFIG.lastTime = currentTime
    }
    
    requestAnimationFrame(catGameLoop)
}

function initCat() {
    CAT_CONFIG.lastFeedTime = Date.now()
    CAT_CONFIG.headY = -CAT_CONFIG.moveDistance / 2
    CAT_CONFIG.headDirection = 'down'
    CAT_CONFIG.eyesX = 0
    CAT_CONFIG.eyesY = 0
    
    const leftEar = document.querySelector('.cat-ear-left')
    const rightEar = document.querySelector('.cat-ear-right')
    if (leftEar) leftEar.style.transform = 'translateX(0) rotate(0) scale(1)'
    if (rightEar) rightEar.style.transform = 'translateX(0) rotate(0) scale(1)'
    
    requestAnimationFrame(catGameLoop)
    updateCatHead()
    updateCatEyes()
    petCatHead()
    
    setTimeout(() => {
        startBlinking()
    }, 1000)
    
    initEarInteractions()
    initTailInteraction()
    changeMood('chill')
}

//-------------TRIANGLES_FUNCTIONS---------------

function createTriangles(){
    const container = document.getElementById('triangles')

    for (let i = 0; i < CONFIG.triangle.count; i++){
        const triangle = document.createElement('img')
        triangle.src = 'assets/triangle.png'
        triangle.className = 'triangle'

        if (i % 2 == 0){
            triangle.classList.add('even')
        }

        container.appendChild(triangle)

        const startAngle = ( i / CONFIG.triangle.count) * Math.PI *2
    
        GameState.triangles.push({
            element: triangle,
            angle: startAngle,
            index: i,
            isEven: i % 2 === 0 
        })
    }
}

function updateTriangles(deltaTime){
    const centerY = window.innerHeight / 2 - 450
    const centerX = window.innerWidth / 2 - 75
    const radius = CONFIG.triangle.radius

    for (const triangle of GameState.triangles){
        triangle.angle += CONFIG.angular_speed * deltaTime
        
        const baseX = centerX + Math.cos(triangle.angle) * radius
        const baseY = centerY + Math.sin(triangle.angle) * radius
        
        const rotation = triangle.angle * (180 / Math.PI) - 90  
        
        triangle.element.style.transform = `
            translate(${baseX}px, ${baseY}px)
            rotate(${rotation}deg)`
    }
}

function mainGameLoop(currentTime){
    if (GameState.lastTime != 0){
        const deltaTime = currentTime - GameState.lastTime
        updateTriangles(deltaTime)
    }
    GameState.lastTime = currentTime
    requestAnimationFrame(mainGameLoop)
}

//-------------FISH_FUNCTIONS-------------

function createFishes(){
    const container = document.getElementById('fish-pool')
    
    GameState.fishPool = []
    for (let i = 0; i < FISH_CONFIG.count; i++) {
        GameState.fishPool.push({
            index: i,
            isAvailable: true,
            element: null
        })
    }

    for (let i = 0; i < FISH_CONFIG.count; i++){
        setTimeout(() => {
            createAndSpawnFish(i)
        }, 300 + i * 200)
    }
}

function createFishElement(index) {
    const fish = document.createElement('img')
    fish.src = 'assets/fish_1.png'
    fish.className = 'fish'
    fish.dataset.index = index

    fish.addEventListener('mousedown', function(e) {
        startDraggingFish(e, index)
    })

    fish.style.opacity = '0'
    fish.style.transform = `translate(${FISH_CONFIG.spawnAnimation.startX}px, ${FISH_CONFIG.spawnAnimation.startY}px) rotate(${FISH_CONFIG.spawnAnimation.startRotation}deg) scale(${FISH_CONFIG.spawnAnimation.startScale})`

    return fish
}

function createAndSpawnFish(fishIndex) {
    spawnFish(fishIndex)
}

function spawnFish(fishIndex) {
    const fishData = GameState.fishPool.find(f => f.index === fishIndex)
    if (!fishData || !fishData.isAvailable) return

    const targetPositionIndex = getNextAvailablePosition()
    if (targetPositionIndex === -1) return
    
    const container = document.getElementById('fish-pool')
    const fish = createFishElement(fishIndex)
    container.appendChild(fish)
    
    fishData.element = fish
    fishData.isAvailable = false
    
    const pos = FISH_CONFIG.positions[targetPositionIndex]
    
    if (GameState.fishes[targetPositionIndex] && GameState.fishes[targetPositionIndex].element) {
        return
    }
    
    GameState.fishes[targetPositionIndex] = {
        element: fish,
        positionIndex: targetPositionIndex,
        startPos: pos,
        isDragging: false,
        fishPoolIndex: fishIndex
    }

    setTimeout(() => {
        animateFishSpawn(fish, pos, fishIndex)
    }, 100)
}

function animateFishSpawn(fishElement, targetPos, fishIndex){
    fishElement.style.opacity = '1'
    fishElement.style.transition = `all ${FISH_CONFIG.spawnAnimation.duration}ms ${FISH_CONFIG.spawnAnimation.easing}`
    
    fishElement.style.transform = 
        `translate(${targetPos.x}px, ${targetPos.y}px) rotate(${targetPos.rotation}deg) scale(${targetPos.scale})`

    fishElement.style.zIndex = targetPos.zIndex

    setTimeout(() => {
        fishElement.style.transition = ''
    }, FISH_CONFIG.spawnAnimation.duration)
}

function getNextAvailablePosition() {
    for (let i = FISH_CONFIG.count - 1; i >= 0; i--) {
        if (!GameState.fishes[i] || !GameState.fishes[i].element) {
            return i
        }
    }
    return -1
}

function startDraggingFish(event, fishIndex){
    event.preventDefault()

    const fish = GameState.fishes.find(f => f && f.fishPoolIndex === fishIndex)
    if (!fish) return
    
    GameState.draggingFish = fish
    
    GameState.dragStart = {
        mouseX: event.clientX,
        mouseY: event.clientY,
        fishX: fish.startPos.x,
        fishY: fish.startPos.y
    }

    fish.element.classList.add('dragging')
    fish.element.style.cursor = 'grabbing'
    fish.element.style.transition = 'none'
    fish.element.style.zIndex = 1000
    
    startTrackingObject(fish.element)
    
    document.addEventListener('mousemove', dragFish)
    document.addEventListener('mouseup', stopDraggingFish)
}

function dragFish(event){
    if (!GameState.draggingFish) return
    
    event.preventDefault()
    const deltaX = event.clientX - GameState.dragStart.mouseX
    const deltaY = event.clientY - GameState.dragStart.mouseY
    
    const newX = GameState.dragStart.fishX + deltaX
    const newY = GameState.dragStart.fishY + deltaY

    const fish = GameState.draggingFish

    fish.element.style.transform = 
        `translate(${newX}px, ${newY}px) rotate(${fish.startPos.rotation}deg) scale(${fish.startPos.scale})`
}

function getCatZone(){
    const catArea = document.querySelector('.cat-area')
    if (!catArea) return null
    
    const rect = catArea.getBoundingClientRect()
    return {
        left: rect.left,
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        width: rect.width,
        height: rect.height
    }
}

function isFishInCatZone(fishElement){
    const catZone = getCatZone()
    if (!catZone) return false

    const fishRect = fishElement.getBoundingClientRect()
    const isInZone = fishRect.left < catZone.right && fishRect.right > catZone.left && fishRect.top < catZone.bottom && fishRect.bottom > catZone.top

    return isInZone
}

function stopDraggingFish(event){
    if (!GameState.draggingFish) return
    
    document.removeEventListener('mousemove', dragFish)
    document.removeEventListener('mouseup', stopDraggingFish)

    const fish = GameState.draggingFish
    fish.element.style.cursor = 'grab'
    fish.element.classList.remove('dragging')
    fish.element.style.zIndex = fish.startPos.zIndex

    // НОВОЕ: Прекращаем слежение за рыбкой
    stopTrackingObject()

    if (isFishInCatZone(fish.element)) {
        feedCat(fish.fishPoolIndex)
    } else {
        returnFishToPool(fish.fishPoolIndex)
    }
    GameState.draggingFish = null
}

function feedCat(fishPoolIndex){
    const fish = GameState.fishes.find(f => f && f.fishPoolIndex === fishPoolIndex)
    if (!fish) return
    
    const positionIndex = fish.positionIndex
    
    // Обновляем время последнего кормления
    CAT_CONFIG.lastFeedTime = Date.now()
    
    // Меняем настроение кота на happy
    changeMood('happy')

    GameState.fishes[positionIndex] = null
    
    fish.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease'
    fish.element.style.opacity = '0'
    fish.element.style.transform = `${fish.element.style.transform} scale(0.5)`
    
    const fishData = GameState.fishPool.find(f => f.index === fishPoolIndex)
    if (fishData) {
        fishData.isAvailable = true
    }
    
    setTimeout(() => {
        if (fish.element && fish.element.parentNode) {
            fish.element.parentNode.removeChild(fish.element)
        }
    }, 300)

    playMeowSound()

    GameState.score++
    updateScore()

    setTimeout(() => {
        shiftFishesRight()

        setTimeout(() => {
            const availableFish = GameState.fishPool.find(f => f.isAvailable)
            if (availableFish) {
                spawnFish(availableFish.index)
            }
        }, 200)
    }, 300)
}

function shiftFishesRight() {
    let hasShifted = false
    
    for (let i = FISH_CONFIG.count - 2; i >= 0; i--) {
        const currentFish = GameState.fishes[i]
        const nextPosition = i + 1
        
        if (currentFish && currentFish.element && 
            (!GameState.fishes[nextPosition] || !GameState.fishes[nextPosition].element)) {
            
            const targetPos = FISH_CONFIG.positions[nextPosition]
            
            currentFish.element.style.transition = 'transform 0.4s ease-out'
            currentFish.element.style.transform = 
                `translate(${targetPos.x}px, ${targetPos.y}px) rotate(${targetPos.rotation}deg) scale(${targetPos.scale})`
            currentFish.element.style.zIndex = targetPos.zIndex
            
            GameState.fishes[nextPosition] = {
                ...currentFish,
                positionIndex: nextPosition,
                startPos: targetPos
            }
            GameState.fishes[i] = null
            hasShifted = true
            
            setTimeout(() => {
                if (currentFish.element) {
                    currentFish.element.style.transition = ''
                }
            }, 400)
        }
    }

    if (hasShifted) {
        setTimeout(shiftFishesRight, 200)
    }
}

function returnFishToPool(fishPoolIndex){
    const fish = GameState.fishes.find(f => f && f.fishPoolIndex === fishPoolIndex)
    if (!fish) return
    
    const pos = fish.startPos

    fish.element.style.transition = 'transform 0.5s ease-out'
    fish.element.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale})`

    setTimeout(() => {
        fish.element.style.transition = ''
    }, 500)
}

function updateScore(){
    const counterElement = document.getElementById('fishCounter')
    if (counterElement){
        counterElement.textContent = GameState.score
    }
}

//-------------INIT---------------
function init() {
    createTriangles()
    createFishes()
    initCat()
    AudioManager.init();
    document.addEventListener('click', function startMusicOnce() {
        if (!AudioManager.isMusicPlaying) {
            AudioManager.playMusic()
            const toggleBtn = document.getElementById('music-toggle')
            if (toggleBtn) {
                toggleBtn.textContent = 'Выкл'
            }
        }
        document.removeEventListener('click', startMusicOnce)
    }, { once: true })
    
    requestAnimationFrame(mainGameLoop)
    settingsBtn()
}

window.addEventListener('load', init)
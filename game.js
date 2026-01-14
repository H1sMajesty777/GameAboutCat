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
        { x: -60, y: -78, rotation: -30,   zIndex: 1, scale: 0.93 }, 
        { x: -40, y: -75, rotation: -20, zIndex: 2, scale: 0.93 },
        { x: -15, y: -77, rotation: -5,  zIndex: 3, scale: 0.94 },
        { x: 15, y: -78, rotation: 10,   zIndex: 4, scale: 0.94 }, 
        { x: 50, y: -79, rotation: 20,  zIndex: 5, scale: 0.95 },
        { x: 70, y: -78, rotation: 30,   zIndex: 6, scale: 1 }
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

// ---------------Settigs-------------
function settigsBtm(){
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

    if (menuOverlay.classList)

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

function gameLoop(currentTime){
    if (GameState.lastTime != 0){
        const deltaTime = currentTime - GameState.lastTime
        updateTriangles(deltaTime)
    }
    GameState.lastTime = currentTime
    requestAnimationFrame(gameLoop)
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
    fish.src = 'assets/fish.png'
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
        console.log(`Место ${targetPositionIndex} уже занято!`)
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
    const cat = document.getElementById('cat')

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

    cat.src = 'assets/cat_eat.png'
    playMeowSound()

    setTimeout(() => {
        cat.src = 'assets/cat.gif'
    }, 500)

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
    
    requestAnimationFrame(gameLoop)
    settigsBtm()
}

window.addEventListener('load', init)
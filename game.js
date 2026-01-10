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
    count: 4,
    width: 60,
    height: 160,
    positions:[
        { x: -40, y: -75, rotation: -20, zIndex: 1, scale: 0.95 },
        { x: -15, y: -77, rotation: -5,  zIndex: 2, scale: 0.95 },
        { x: 15, y: -78, rotation: 10,   zIndex: 3, scale: 0.95 }, 
        { x: 50, y: -79, rotation: 20,  zIndex: 4, scale: 1 }
    ],
    respawnDelay: 0 
}
//----------GAME_STATE---------
const GameState = {
    triangles: [],
    fishes: [],
    lastTime: 0,
    score: 0,
    draggingFish: null,
    dragOffset: { x: 0, y: 0 }
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

    for (let i = 0; i < FISH_CONFIG.count; i ++){
        const fish = document.createElement('img')
        fish.src = 'assets/fish.png'
        fish.className = 'fish'

        fish.dataset.index = i

        const pos = FISH_CONFIG.positions[i]

        fish.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale})`

        fish.addEventListener('mousedown', function(e) {
            startDraggingFish(e, i)
        })

        container.appendChild(fish)

        GameState.fishes.push({
            element: fish,
            positionIndex: i,
            startPos: pos,
            isDragging: false,
            dragOffsetX: 0,
            dragOffsetY: 0
        })
    }
}

function startDraggingFish(event, fishIndex){
    event.preventDefault()
    
    const fish = GameState.fishes[fishIndex]
    const rect = fish.element.getBoundingClientRect()

    GameState.draggingFish = fish

    GameState.startDragCoords = {
        x: rect.left - fish.startPos.x,
        y: rect.top - fish.startPos.y
    }

    GameState.dragOffset = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    }

    fish.element.classList.add('dragging')
    fish.element.style.cursor = 'grabbing'
    
    document.addEventListener('mousemove', dragFish)
    document.addEventListener('mouseup', stopDraggingFish)
    

}

function dragFish(event){
    if (!GameState.draggingFish) return
    
    event.preventDefault()

    const newX = event.clientX - GameState.dragOffset.x - GameState.startDragCoords.x
    const newY = event.clientY - GameState.dragOffset.y - GameState.startDragCoords.y

    console.log("Новые координаты:", newX, newY)

    const fish = GameState.draggingFish

    fish.element.style.transform = 
        `translate(${newX}px, ${newY}px) rotate(${fish.startPos.rotation}deg) scale(${fish.startPos.scale})`
    
}


function stopDraggingFish(event){
    if (!GameState.draggingFish) return
    
    document.removeEventListener('mousemove', dragFish);
    document.removeEventListener('mouseup', stopDraggingFish)

    GameState.draggingFish.element.style.cursor = 'grab'
    GameState.draggingFish.element.classList.remove('dragging')

    if (isFishInCatZone(GameState.draggingFish.element)) {
        feedCat(GameState.draggingFish.positionIndex)
    } else {
        returnFishToPool(GameState.draggingFish.positionIndex)
    }
    GameState.draggingFish = null
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
function playMeowSound() {
    const audio = new Audio('assets/may.mp3')
    audio.volume = 0.5
    audio.play()
}

function feedCat(fishIndex){
    const fish = GameState.fishes[fishIndex]
    const cat = document.getElementById('cat')

    fish.element.style.opacity = '0'
    fish.element.style.pointerEvents = 'none'

    cat.src = 'assets/cat_eat.png'

    setTimeout(() => {
        cat.src = 'assets/cat.gif'
    }, 500)

    playMeowSound()


    GameState.score++
    updateScore()

    setTimeout(() => {
        respawnFish(fishIndex)
    }, 2000) 
}

function returnFishToPool(fishIndex){
    const fish = GameState.fishes[fishIndex]
    const pos = fish.startPos

    fish.element.style.transition = 'transform 0.3s ease'
    fish.element.style.transform = `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale})`

    setTimeout(() => {
        fish.element.style.transition = '';
    }, 300)
}

function respawnFish(fishIndex){
    const fish = GameState.fishes[fishIndex]
    const pos = fish.startPos

    fish.element.style.transition = 'opacity 0.5s ease'
    fish.element.style.opacity = '1'
    fish.element.style.pointerEvents = 'auto'
    
    fish.element.style.transform = 
        `translate(${pos.x}px, ${pos.y}px) rotate(${pos.rotation}deg) scale(${pos.scale})`
    
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
    requestAnimationFrame(gameLoop)
}

window.addEventListener('load', init)

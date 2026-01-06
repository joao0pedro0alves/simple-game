const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

/* =======================
  CONFIGURAÇÕES
======================= */
const maxLife = 100
let life = 100
let displayedLife = 100

const GAME_STATE = {
  START: 'start',
  PLAYING: 'playing',
  GAME_OVER: 'game_over',
}

let currentState = GAME_STATE.START

/* =======================
  SOUND EFFECTS
======================= */
const hitSound = new Audio('./assets/sounds/quick-cut.mp3')
const deathSound = new Audio('./assets/sounds/death-scream.wav')
hitSound.volume = 0.6
deathSound.volume = 0.8

/* =======================
  SPRITE
======================= */
const sprite = new Image()
sprite.src = './assets/dragon-sprite.png'

const player = {
  x: canvas.width / 2,
  y: canvas.height - 100,
  width: 100,
  height: 100,
  frame: 0,
  frameCount: 3,
  frameSpeed: 0.05,
  frameTimer: 0,
}

/* =======================
  BACKGROUND
======================= */
function drawBackground() {
  ctx.fillStyle = '#87ceeb'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#228B22'
  ctx.fillRect(0, canvas.height - 115, canvas.width, 115)
}

/* =======================
  LIFE BAR
======================= */
function drawLifeBar() {
  const x = 20,
    y = 20,
    w = 200,
    h = 20

  displayedLife += (life - displayedLife) * 0.1

  ctx.fillStyle = '#444'
  ctx.fillRect(x, y, w, h)

  ctx.fillStyle = '#ff0000'
  ctx.fillRect(x, y, (displayedLife / maxLife) * w, h)

  ctx.strokeStyle = '#000'
  ctx.strokeRect(x, y, w, h)
}

/* =======================
  PLAYER
======================= */
function updatePlayer() {
  player.frameTimer += player.frameSpeed
  if (player.frameTimer >= 1) {
    player.frame = (player.frame + 1) % player.frameCount
    player.frameTimer = 0
  }
}

function drawPlayer() {
  ctx.drawImage(
    sprite,
    player.frame * player.width,
    0,
    player.width,
    player.height,
    player.x - player.width / 2,
    player.y - player.height,
    player.width,
    player.height
  )

  // DEBUG HITBOX (opcional)
  ctx.strokeStyle = 'transparent'

  ctx.strokeRect(
    player.x - player.width / 2,
    player.y - player.height,
    player.width,
    player.height
  )
}

/* =======================
  HUD
======================= */
function drawStartHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#fff'
  ctx.font = '48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('Dragon Clicker', canvas.width / 2, canvas.height / 2 - 40)

  ctx.font = '24px Arial'
  ctx.fillText('Clique para começar', canvas.width / 2, canvas.height / 2 + 20)
}

/* =======================
  GAME OVER HUD
======================= */
function drawGameOverHUD() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = '#ff4444'
  ctx.font = '48px Arial'
  ctx.textAlign = 'center'
  ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 40)

  // Botão
  const button = getRestartButton()

  ctx.fillStyle = '#222'
  ctx.fillRect(button.x, button.y, button.w, button.h)

  ctx.strokeStyle = '#fff'
  ctx.strokeRect(button.x, button.y, button.w, button.h)

  ctx.fillStyle = '#fff'
  ctx.font = '24px Arial'
  ctx.fillText('Restart', canvas.width / 2, button.y + 32)
}

/* =======================
  RESTART BUTTON
======================= */
function getRestartButton() {
  return {
    x: canvas.width / 2 - 100,
    y: canvas.height / 2 + 10,
    w: 200,
    h: 50,
  }
}

function endGame() {
  currentState = GAME_STATE.GAME_OVER
}

function resetGame() {
  life = maxLife
  displayedLife = maxLife
  player.frame = 0
  currentState = GAME_STATE.PLAYING
}

/* =======================
  COLISÃO POR CLIQUE
======================= */
canvas.addEventListener('click', (event) => {
  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left
  const mouseY = event.clientY - rect.top

  // START SCREEN
  if (currentState === GAME_STATE.START) {
    currentState = GAME_STATE.PLAYING
    return
  }

  // GAME OVER
  if (currentState === GAME_STATE.GAME_OVER) {
    const btn = getRestartButton()

    const clickedButton =
      mouseX >= btn.x &&
      mouseX <= btn.x + btn.w &&
      mouseY >= btn.y &&
      mouseY <= btn.y + btn.h

    if (clickedButton) {
      resetGame()
    }
    return
  }

  // GAME PLAYING
  if (currentState !== GAME_STATE.PLAYING) return

  const hitbox = {
    x: player.x - player.width / 2,
    y: player.y - player.height,
    w: player.width,
    h: player.height,
  }

  const collided =
    mouseX >= hitbox.x &&
    mouseX <= hitbox.x + hitbox.w &&
    mouseY >= hitbox.y &&
    mouseY <= hitbox.y + hitbox.h

  if (collided) {
    life -= 10
    if (life < 0) life = 0

    hitSound.currentTime = 0
    hitSound.play()
  }

  if (life === 0) {
    deathSound.currentTime = 0
    deathSound.play()
    endGame()
  }
})

/* =======================
  GAME LOOP
======================= */
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawBackground()

  if (currentState === GAME_STATE.START) {
    drawStartHUD()
  }

  if (currentState === GAME_STATE.PLAYING) {
    drawLifeBar()
    updatePlayer()
    drawPlayer()
  }

  if (currentState === GAME_STATE.GAME_OVER) {
    drawLifeBar()
    drawPlayer()
    drawGameOverHUD()
  }

  requestAnimationFrame(gameLoop)
}

sprite.onload = () => {
  gameLoop()
}

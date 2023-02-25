//////////////////////  Game Initialization ///////////////////////////

const mainCanvas = document.getElementById("main-canvas")
const subCanvas = document.getElementById("sub-canvas")

const instructionPanel = document.getElementById("instruction")
const winInstructionPanel = document.getElementById("win-instruction")
winInstructionPanel.style.display = "none"

const lostInstructionPanel = document.getElementById("lost-instruction")
lostInstructionPanel.style.display = "none"

const body = document.getElementById("body")
const bodyRectY = body.getBoundingClientRect().y;

let scoreText = document.getElementById("score")
scoreText.innerHTML = "SCORE: " + 0

let uncookedFoodContainers = document.getElementsByClassName("uncookedFoodContainer")
let obstacleContainers = document.getElementsByClassName("obstacle")

let gameIsPaused = true
let restartGame = false
let canShoot = true

let score = 0
const row = 4
const column = 8
let randomIndex = 0

let width = "54px"
let height = "54px"

let updateTimer
let restartTimer
let obstacleTimer
let coolDownTimer
let recreateObstaclesTimer

let dist = 0
let obstacleDist 
let winCounter = 0

let airplaneMoveRight = 0
let knifeMoveUpward = 0
let moveRight = 0
let obstacleTopPos

const uncookedFoodList = ["beet", "carrot", "cheese", "chicken",
    "egg", "eggplant", "meat", "mushroom",
    "pepper", "potato", "sausage"]

const uncookedFoodImages = []
const uncookedFoodXpTexts = []

let topParent = document.createElement("div")
let airplane = document.createElement("div")

////////////////////////                    //////////////////////////////

function CreateUncookedFood(name, width, height) {
    const container = document.createElement("div")

    container.style.width = "100px"
    container.style.height = "80px"
    container.style.userSelect = "none";
    container.classList.add("uncookedFoodContainer")

    const image = document.createElement("img")
    image.src = "Game Assets/" + name + ".png"
    image.style.width = width
    image.style.height = height

    const xpText = document.createElement("h4")
    xpText.innerHTML = "10xp"
    xpText.style.color = "red"
    xpText.style.position = "relative"
    xpText.style.top = "0px"
    xpText.style.right = "-10px"
    xpText.style.display = "none"

    container.appendChild(image)
    container.appendChild(xpText)
    subCanvas.appendChild(container)
    uncookedFoodImages.push(image)
    uncookedFoodXpTexts.push(xpText)
    return container
}

function LevelHandler() {
    for (let i = 0; i < row; i++) {
        for (let j = 0; j < column; j++) {
            randomIndex = Math.floor(Math.random() * uncookedFoodList.length)
            switch (uncookedFoodList[randomIndex]) {
                case "chicken":
                    width = "90px"
                    height = "54px"
                    break
                case "egg":
                    width = "54px"
                    height = "64px"
                    break
                case "eggplant":
                    width = "54px"
                    height = "64px"
                    break
                case "carrot":
                    width = "54px"
                    height = "70px"
                    break
                case "sausage":
                    width = "54px"
                    height = "44px"
                    break
                case "pepper":
                    width = "54px"
                    height = "64px"
                    break
                case "potato":
                    width = "54px"
                    height = "64px"
                    break
                default:
                    width = "54px"
                    height = "54px"
            }
            const container = CreateUncookedFood(uncookedFoodList[randomIndex], width, height)

            if (i > 0) {
                container.style.marginTop = "-120px"
            }
        }
    }
}

function Airplane() {

    const airplaneImage = document.createElement("img")

    topParent.style.position = "relative"
    topParent.style.right = 0 + "px"
    topParent.style.top = 0 + "px"
    topParent.style.zIndex = "1"
    topParent.classList.add("top-parent")

    airplaneImage.src = "Game Assets/airplane.png"

    airplaneImage.style.width = "86px"
    airplaneImage.style.height = "106px"

    airplane.style.position = "relative"
    airplane.style.bottom = 30 + "px"
    airplane.style.right = 0 + "px"
    airplane.style.userSelect = "none";

    airplane.appendChild(airplaneImage)
    topParent.appendChild(airplane)
    mainCanvas.appendChild(topParent)
}

Airplane()

function Knife() {
    let knife = document.createElement("div")
    const knifeImage = document.createElement("img")

    knifeImage.src = "Game Assets/knife.png"

    knifeImage.style.width = "20px"
    knifeImage.style.height = "54px"

    knife.classList.add("knife")
    knife.style.position = "absolute"
    knife.style.right = (parseInt(airplane.style.right) - 10) + "px"
    knife.style.top = 0 + "px"
    knife.style.zIndex = " -1"

    knife.appendChild(knifeImage)
    topParent.appendChild(knife)
}

function Obstacle(rightPos) {
    let obstacle = document.createElement("div")
    const obstacleImage = document.createElement("img")

    obstacleImage.src = "Game Assets/obstacle.png"

    obstacleImage.style.width = "20px"
    obstacleImage.style.height = "50px"
    obstacleImage.style.color = "red"

    obstacle.classList.add("obstacle")
    obstacle.style.position = "absolute"
    obstacle.style.top = -250 + "px"
    obstacle.style.right = rightPos + "px"
    obstacle.style.transform = "rotate(180deg)"

    obstacle.appendChild(obstacleImage)
    body.appendChild(obstacle)
}

function CreateObstacles() {
    for (let i = 1; i <= 8; i++) {
        Obstacle(i * 170)
    }
}

CreateObstacles()

document.addEventListener('keydown', event => {
    if (event.key === "ArrowRight") {
        moveRight = 1
    }
    if (event.key === "ArrowLeft") {
        moveRight = -1
    }
    if (event.code === "Space") {
        // moveRight = 0 , keep , if plane should stop when shooting.
            Shoot()
    }
    if (event.key === "Enter"){
        LevelHandler()
        Update()
        gameIsPaused = false
    }
    if (event.key === "r" && restartGame === false) {
        if(gameIsPaused === true)
            gameIsPaused = false
        restartGame = true
    }
})

function Update() {
    updateTimer = setInterval(() => {
        if (gameIsPaused === true) {
            if(airplane.style.opacity === "0")
                instructionPanel.style.display = "none"
            else   
                instructionPanel.style.display = "block"
            return
        }
        else{  
                instructionPanel.style.display = "none"

            const knifes = document.getElementsByClassName("knife")
            // handle movement
            if (moveRight === 1) {
                airplaneMoveRight = parseInt(airplane.style.right)
                airplaneMoveRight -= 5
                airplane.style.right = airplaneMoveRight + "px"

                if (airplane.getBoundingClientRect().x > 1320) {
                    airplane.style.right = -600 + "px"
                }

            } else if (moveRight === -1) {
                airplaneMoveRight = parseInt(airplane.style.right)
                airplaneMoveRight += 5
                airplane.style.right = airplaneMoveRight + "px"

                if (airplane.getBoundingClientRect().x < 130) {
                    airplane.style.right = 600 + "px"
                }
            } else {
                airplane.style.right = airplaneMoveRight + "px"
            }

            //////////////                 ////////////////////
            for (let i = 0; i < knifes.length; i++) {
                if (knifes[i].getBoundingClientRect().y < bodyRectY) {
                    knifes[i].remove()
                    knifeMoveUpward = 0
                }
                else {
                    knifes[i].style.display = "block"
                    knifes[i].style.zIndex = "0"

                    knifeMoveUpward = parseInt(knifes[i].style.top)
                    knifeMoveUpward -= 8
                    knifes[i].style.top = knifeMoveUpward + "px"
                    mainCanvas.appendChild(airplane)

                    // handle collision
                    for (let j = uncookedFoodImages.length - 1; j >= 0; j--) {
                        dist = Math.sqrt(Math.pow(knifes[i].getBoundingClientRect().x -
                            uncookedFoodImages[j].getBoundingClientRect().x, 2) +
                            Math.pow(knifes[i].getBoundingClientRect().y -
                                uncookedFoodImages[j].getBoundingClientRect().y, 2))
                        if (dist < 45) {
                            knifes[i].remove()
                            knifeMoveUpward = 0
                            ++winCounter
                            uncookedFoodImages[j].style.display = "None"
                            score += 10
                            scoreText.innerHTML = "SCORE: " + score
                            FadeOutAnimation(j)
                            break
                        }
                    }
                }
            }

            /////////// Restart Game //////////////
            if (restartGame === true) {
                airplane.style.opacity = "1"
                // zeroing the score 
                score = 0
                scoreText.innerHTML = "SCORE: " + 0
                // recreate everything
                restartTimer = setInterval(() => {
                    for (let i = 0; i < uncookedFoodContainers.length; i++) {
                        uncookedFoodContainers[i].remove()
                    }
                    if (uncookedFoodContainers.length === 0) {
                        LevelHandler()
                        clearInterval(restartTimer)
                    }
                }, 20)

                winCounter = 0
                winInstructionPanel.style.display = "none"
                lostInstructionPanel.style.display = "none"
                restartGame = false
            }
        }

        /////////// Win Game /////////////////
        if (winCounter === 32 && airplane.style.opacity === "1") {
            airplane.style.opacity = "0"
            winInstructionPanel.style.display = "block"
            winCounter = 0
        }
    }, 30)

    //////////// Create Obstacles //////////
    obstacleTimer = setInterval(() => {
        for (let i = 0; i < obstacleContainers.length; i++) {
            obstacleTopPos = parseInt(obstacleContainers[i].style.top)
            obstacleTopPos += 1
            obstacleContainers[i].style.top = obstacleTopPos + "px"

            obstacleDist = Math.sqrt(Math.pow(airplane.getBoundingClientRect().x -
                obstacleContainers[i].getBoundingClientRect().x, 2) +
                Math.pow(airplane.getBoundingClientRect().y -
                    obstacleContainers[i].getBoundingClientRect().y, 2))


                if (obstacleDist < 34 && airplane.style.opacity !== "0") {
                    airplane.style.opacity = "0"
                    lostInstructionPanel.style.display = "block"
                    restartGame = false
                    gameIsPaused = true
                    break
                }

            if (parseInt(obstacleContainers[i].style.top) > 680) {
                obstacleContainers[i].remove()
                clearTimeout(recreateObstaclesTimer)
                obstacleTopPos = -250
            }
        }

        if (obstacleContainers.length <= 0) {
            recreateObstaclesTimer = setTimeout(() => {
                CreateObstacles()
            }, 6)
        }
    }, 3)
}

function FadeOutAnimation(index) {
    let fadeOutTimer = setInterval(() => {
        uncookedFoodXpTexts[index].style.display = "block"
        let xpTextTop = parseInt(uncookedFoodXpTexts[index].style.top)
        xpTextTop -= 1
        uncookedFoodXpTexts[index].style.top = xpTextTop + "px"
        uncookedFoodXpTexts[index].style.opacity = "0.5"

        if (xpTextTop === -30) {
            uncookedFoodXpTexts[index].style.display = "none"
            clearInterval(fadeOutTimer)
        }
    }, 50)
}

function Shoot() {
    if (gameIsPaused === false)
    {
        if(canShoot)
        {
            canShoot = false
            clearTimeout(coolDownTimer)
            Knife()
        }

        coolDownTimer = setTimeout(()=>
        {
           canShoot = true;
        },1000)
    }
}


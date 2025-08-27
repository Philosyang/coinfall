// Virtual Piggy Bank - p5.js sketch

let coins = [];
let hourlyWage = 0;
let startTime = null;
let isEarning = false;
let ground = [];
let nextCoinTime = 0;
let totalCoinsDispensed = 0; // Track actual value of coins thrown
let lastCoinTime = 0; // For realistic timing
let showText = false; // Toggle for text visibility

// Coin values and colors
const coinTypes = [
  { value: 0.01, color: [139, 69, 19], size: 15, name: "penny" },     // bronze
  { value: 0.05, color: [192, 192, 192], size: 18, name: "nickel" },  // silver
  { value: 0.10, color: [192, 192, 192], size: 16, name: "dime" },    // silver
  { value: 0.25, color: [192, 192, 192], size: 22, name: "quarter" }, // silver
  { value: 1.00, color: [255, 215, 0], size: 24, name: "dollar" },    // gold
];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent('sketch-container');
  
  // Initialize ground array to track heights
  for (let i = 0; i < width; i++) {
    ground[i] = height;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Reinitialize ground array for new width
  let newGround = [];
  for (let i = 0; i < width; i++) {
    if (i < ground.length) {
      newGround[i] = ground[i];
    } else {
      newGround[i] = height;
    }
  }
  ground = newGround;
}

function mousePressed() {
  // Toggle text visibility on mouse click
  if (isEarning) {
    showText = !showText;
  }
}

function draw() {
  background(240); // Light gray background
  
  // Calculate current earnings
  if (isEarning && startTime) {
    let hoursWorked = (millis() - startTime) / (1000 * 60 * 60); // Convert to hours
    let currentEarnings = hourlyWage * hoursWorked;
    
    // Display earnings (only if showText is true)
    if (showText) {
      fill(0); // Black text
      noStroke();
      textSize(24);
      text(`Expected: $${currentEarnings.toFixed(2)}`, 20, 40);
      text(`Dispensed: $${totalCoinsDispensed.toFixed(2)}`, 20, 70);
      text(`Gap: $${(currentEarnings - totalCoinsDispensed).toFixed(2)}`, 20, 100);
      textSize(18);
      text(`Hourly Wage: $${hourlyWage.toFixed(2)}`, 20, 125);
    }
    
    // Smart coin dispensing based on earnings gap
    let earningsGap = currentEarnings - totalCoinsDispensed;
    
    // Only dispense coin if there's a meaningful gap and enough time has passed
    if (earningsGap >= 0.01 && millis() > nextCoinTime) {
      let coinType = selectCoinForGap(earningsGap);
      if (coinType) {
        addCoin(coinType);
        totalCoinsDispensed += coinType.value;
        
        // Realistic timing based on wage rate and coin value
        let delayMs = calculateRealisticDelay(coinType, hourlyWage);
        nextCoinTime = millis() + delayMs;
        lastCoinTime = millis();
      }
    }
  }
  
  // Update and draw all coins
  for (let i = 0; i < coins.length; i++) {
    coins[i].update();
    
    // Check collisions with other coins (optimized for performance)
    let maxChecks = Math.min(coins.length - i - 1, 50); // Limit checks for performance
    for (let j = i + 1; j < i + 1 + maxChecks; j++) {
      if (j >= coins.length) break;
      coins[i].checkCollision(coins[j]);
    }
    
    coins[i].display();
    
    // Update ground when coins settle (but don't remove them)
    if (coins[i].isSettled() && !coins[i].groundUpdated) {
      updateGround(coins[i]);
      coins[i].groundUpdated = true; // Mark so we don't update ground multiple times
    }
  }
  
  // Display total value (only if showText is true)
  if (isEarning && showText) {
    let totalValue = calculateTotalValue();
    fill(0); // Black text
    noStroke();
    textSize(28);
    text(`In Piggy Bank: $${totalValue.toFixed(2)}`, 20, height - 40);
    
    // Display coin count
    textSize(20);
    text(`Coins: ${coins.length}`, 20, height - 15);
  }
  
  // Show hint when text is hidden
  if (isEarning && !showText) {
    fill(0, 0, 0, 100); // Semi-transparent black
    noStroke();
    textSize(14);
    text(`Click to show stats`, width - 120, height - 10);
  }
}

class Coin {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.vx = random(-0.5, 0.5);
    this.vy = 0;
    this.gravity = 0.25;
    this.bounce = 0.4;
    this.settled = false;
    this.settleCounter = 0;
    this.groundUpdated = false; // Track if this coin has updated the ground
  }
  
  update() {
    if (this.settled) return;
    
    // Apply gravity
    this.vy += this.gravity;
    
    // Update position
    this.x += this.vx;
    this.y += this.vy;
    
    // Check ground collision
    let groundHeight = this.getGroundHeight();
    if (this.y + this.type.size/2 >= groundHeight) {
      this.y = groundHeight - this.type.size/2;
      this.vy *= -this.bounce;
      this.vx *= 0.8; // Friction
      
      // Check if coin has settled
      if (abs(this.vy) < 0.5 && abs(this.vx) < 0.1) {
        this.settleCounter++;
        if (this.settleCounter > 30) { // 30 frames of being still
          this.settled = true;
          this.vy = 0;
          this.vx = 0;
        }
      }
    }
    
    // Bounce off walls
    if (this.x - this.type.size/2 < 0 || this.x + this.type.size/2 > width) {
      this.vx *= -0.5;
      this.x = constrain(this.x, this.type.size/2, width - this.type.size/2);
    }
  }
  
  getGroundHeight() {
    let index = Math.floor(this.x);
    index = constrain(index, 0, ground.length - 1);
    return ground[index];
  }
  
  display() {
    push();
    translate(this.x, this.y);
    
    // Coin shadow
    fill(0, 0, 0, 50);
    ellipse(2, 2, this.type.size);
    
    // Coin body
    fill(this.type.color);
    stroke(0);
    strokeWeight(1);
    ellipse(0, 0, this.type.size);
    
    // Coin shine
    fill(255, 255, 255, 100);
    ellipse(-this.type.size/6, -this.type.size/6, this.type.size/3);
    
    pop();
  }
  
  isSettled() {
    return this.settled;
  }
  
  checkCollision(other) {
    // Skip collision if both coins are settled (for performance)
    if (this.settled && other.settled) return;
    
    // Quick distance check without sqrt for performance
    let dx = other.x - this.x;
    let dy = other.y - this.y;
    let distanceSquared = dx * dx + dy * dy;
    
    // Calculate minimum distance (sum of radii)
    let minDistance = (this.type.size + other.type.size) / 2;
    let minDistanceSquared = minDistance * minDistance;
    
    // Quick rejection test - if too far apart, skip expensive calculations
    if (distanceSquared > minDistanceSquared * 1.5) return;
    
    // Now calculate actual distance
    let distance = Math.sqrt(distanceSquared);
    
    // Check if coins are colliding
    if (distance < minDistance && distance > 0) {
      // Calculate overlap amount
      let overlap = minDistance - distance;
      
      // Normalize collision vector
      let nx = dx / distance;
      let ny = dy / distance;
      
      // Separate coins by moving them apart
      let separation = overlap / 2;
      this.x -= nx * separation;
      this.y -= ny * separation;
      other.x += nx * separation;
      other.y += ny * separation;
      
      // Calculate relative velocity
      let dvx = other.vx - this.vx;
      let dvy = other.vy - this.vy;
      
      // Calculate relative velocity along collision normal
      let dvn = dvx * nx + dvy * ny;
      
      // Only resolve collision if objects are moving towards each other
      if (dvn > 0) return;
      
      // Collision restitution (bounciness)
      let restitution = 0.6;
      
      // Calculate impulse magnitude
      let impulse = -(1 + restitution) * dvn;
      
      // Apply impulse to velocities (assuming equal mass)
      this.vx -= impulse * nx * 0.5;
      this.vy -= impulse * ny * 0.5;
      other.vx += impulse * nx * 0.5;
      other.vy += impulse * ny * 0.5;
      
      // Reset settle counters due to collision
      this.settleCounter = 0;
      other.settleCounter = 0;
      this.settled = false;
      other.settled = false;
    }
  }
}

function selectCoinForGap(gap) {
  // Choose the largest coin that fits within the gap, with some smart logic
  if (gap >= 1.00) {
    // For large gaps, prefer dollar coins but add some variety
    if (random() < 0.7) return coinTypes[4]; // Dollar (70% chance)
    else return coinTypes[3]; // Quarter (30% chance)
  } else if (gap >= 0.25) {
    // For medium gaps, prefer quarters
    if (random() < 0.8) return coinTypes[3]; // Quarter (80% chance)
    else return coinTypes[2]; // Dime (20% chance)
  } else if (gap >= 0.10) {
    // For small gaps, prefer dimes
    if (random() < 0.7) return coinTypes[2]; // Dime (70% chance)
    else return coinTypes[1]; // Nickel (30% chance)
  } else if (gap >= 0.05) {
    return coinTypes[1]; // Nickel
  } else if (gap >= 0.01) {
    return coinTypes[0]; // Penny
  }
  return null; // No coin if gap is too small
}

function addCoin(coinType) {
  // Add coin at random x position at top with some spacing
  let margin = coinType.size;
  let newCoin = new Coin(random(margin, width - margin), -coinType.size, coinType);
  coins.push(newCoin);
}

function calculateRealisticDelay(coinType, hourlyWage) {
  // Calculate how long this coin's value should take to earn at current wage
  let secondsToEarnCoin = (coinType.value / hourlyWage) * 3600; // Convert to seconds
  
  // Add randomness (±50%) to make it feel natural
  let randomFactor = random(0.5, 1.5);
  let baseDelay = secondsToEarnCoin * 1000 * randomFactor; // Convert to milliseconds
  
  // Clamp delays to reasonable bounds (0.5 to 30 seconds)
  return constrain(baseDelay, 500, 30000);
}

function updateGround(coin) {
  // Update ground height where coin landed
  let startX = Math.max(0, Math.floor(coin.x - coin.type.size/2));
  let endX = Math.min(ground.length - 1, Math.floor(coin.x + coin.type.size/2));
  
  for (let i = startX; i <= endX; i++) {
    ground[i] = Math.min(ground[i], coin.y + coin.type.size/2);
  }
}

function calculateTotalValue() {
  // Return the actual value of coins dispensed
  return totalCoinsDispensed;
}

// Functions called from HTML
function startEarning() {
  let wageInput = document.getElementById('hourlyWage');
  let wage = parseFloat(wageInput.value);
  
  if (wage && wage > 0) {
    hourlyWage = wage;
    startTime = millis();
    isEarning = true;
    totalCoinsDispensed = 0;
    nextCoinTime = millis() + 1000; // First coin after 1 second
    lastCoinTime = millis();
    showText = false; // Hide text by default
    
    // Hide setup screen and show game screen
    document.getElementById('setup-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    
    // Trigger canvas resize to full screen
    resizeCanvas(windowWidth, windowHeight);
    
    // Reinitialize ground for full-screen canvas
    for (let i = 0; i < width; i++) {
      ground[i] = height;
    }
  } else {
    alert('Please enter a valid hourly wage!');
  }
}



# Virtual Piggy Bank 🪙

A fun p5.js app that simulates a virtual piggy bank where coins fall from the sky based on your hourly wage!

## How to Run

1. Simply open `index.html` in your web browser
2. Enter your hourly wage in dollars
3. Click "Start" to watch coins fall
4. Click anywhere to toggle stats display
5. Refresh the page to reset

## How It Works

- Enter your hourly wage (e.g., 15.50 for $15.50/hour)
- Coins fall from the top representing your **actual** earnings with realistic timing
- **Smart coin dispensing**: The app tracks your expected earnings vs. coins dispensed, and drops coins to catch up
- **Realistic timing**: If you make $60/hour ($1/minute), coins drop at intervals that make sense
- Different coin types with intelligent selection:
  - 🪙 Penny (1¢) - bronze
  - 🪙 Nickel (5¢) - silver  
  - 🪙 Dime (10¢) - silver
  - 🪙 Quarter (25¢) - silver
  - 🪙 Dollar (100¢) - gold
- Coins stack up permanently with realistic physics
- Track the gap between expected vs. dispensed earnings in real-time

## Built With

- [p5.js](https://p5js.org/) - Creative coding library for the web
- HTML5 Canvas for rendering
- Vanilla JavaScript for interactions

## Features

- ✅ Physics-based coin falling animation with **coin-to-coin collisions**
- ✅ Realistic coin stacking and bouncing
- ✅ Smart earnings-based coin dispensing
- ✅ Different coin types and values
- ✅ Minimalist interface (click to toggle stats)
- ✅ Full-screen immersive experience
- ✅ Performance-optimized collision detection
- ✅ Responsive design

## Next Steps (Ideas for Enhancement)

- Add sound effects for coin drops
- Implement coin collection/clicking for bonuses
- Add different piggy bank themes
- Save earnings history
- Add achievements/milestones
- Mobile-friendly touch controls

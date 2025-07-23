# Plant Drinker PWA 🌱💧

A Progressive Web App that helps you track your daily water intake while watching a virtual plant grow. Built with Bootstrap 5 and vanilla JavaScript.

## 🚀 [Live Demo](https://your-username.github.io/plant-drinker)

## ✨ Features

- **💧 Water Tracking**: Quick buttons for 250ml, 500ml, and customizable amounts
- **🧠 Smart Memory**: Remembers your last custom amount as a quick option  
- **🌱 Plant Growth**: Virtual plant grows through 10 stages based on your daily progress
- **🎯 Daily Goals**: Customizable daily water intake targets (1.5L - 5L)
- **📊 Progress Tracking**: Visual progress bar and 7-day history chart
- **⏰ Reminders**: Optional notifications to remind you to stay hydrated
- **📱 PWA Features**: Installable, works offline, mobile-optimized
- **🎨 Responsive Design**: Works great on mobile and desktop
- **🎮 Retro Aesthetics**: Pixelated plant sprites with smooth animations

## 🎮 How to Use

1. **Set Your Goal**: Choose from preset targets (1.5L, 2L, 2.5L, 3L) or set a custom amount
2. **Track Your Intake**: Use quick buttons (250ml, 500ml, 750ml) or add custom amounts
3. **Watch Your Plant Grow**: Your virtual plant grows through 10 stages as you reach your daily goal
4. **Stay Motivated**: View your 7-day history and maintain your streak

## 🖼️ Screenshots

*Add screenshots here showing the app in action*

## 🛠️ Setup Instructions

### 1. Clone or Download
```bash
git clone https://github.com/your-username/plant-drinker.git
cd plant-drinker
```

### 2. Plant Sprites
The app comes with placeholder sprite paths. Create pixelated plant sprites and place them in `assets/plant-sprites/`:
- `stage-1.png` through `stage-10.png` - Progressive growth stages
- `stage-wilted.png` - Wilted/dehydrated state

**Recommended sprite dimensions**: 80x120px (portrait format)
**Style**: Retro pixel art, 8-bit gaming aesthetic

### 3. PWA Icons  
Create app icons and place them in `assets/icons/`:
- `icon-72x72.png` through `icon-512x512.png`

### 4. Serving the App

#### Option 1: Local Development
```bash
# Using Python 3
python -m http.server 8000

# Using Python 2  
python -m SimpleHTTPServer 8000

# Using Node.js http-server
npx http-server
```

#### Option 2: GitHub Pages (Recommended for Public Deployment)
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select "Deploy from a branch" and choose `main` branch
4. Your app will be available at `https://your-username.github.io/repository-name`

#### Option 3: Netlify (Easy Deployment)
1. Connect your GitHub repository to Netlify
2. Deploy automatically on every push
3. Get a custom domain

#### Option 4: Vercel
1. Connect your GitHub repository to Vercel  
2. Automatic deployments and preview builds

## 🔧 Technical Details

### Built With
- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: Bootstrap 5 + Custom CSS
- **Charts**: Chart.js
- **PWA**: Service Worker for offline support
- **Storage**: localStorage for data persistence

### Browser Support
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

### File Structure
```
plant-drinker/
├── index.html          # Main app interface
├── style.css           # Custom styles and animations  
├── app.js             # Application logic
├── sw.js              # Service worker for PWA
├── manifest.json      # PWA manifest
├── assets/
│   ├── icons/         # PWA icons
│   ├── plant-sprites/ # Plant growth sprites
│   └── pot/           # Plant pot sprite
└── README.md
```

# Using PHP (if available)
php -S localhost:8000
```

#### Option 2: Deploy to Static Hosting
Upload all files to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

## 💡 Features in Detail

### 💧 Smart Water Tracking
- **Quick Actions**: 250ml, 500ml, and custom amounts
- **Memory**: Remembers your last custom amount for faster logging
- **Flexible**: Support for any amount from 1ml to 2000ml
- **Persistent**: All data stored locally, works offline

### 🌱 Plant Growth System  
- **10 Growth Stages**: From tiny sprout to full bloom
- **Dynamic Progress**: Growth tied to daily goal percentage
- **Wilting Mechanism**: Plant wilts if neglected for 6+ hours
- **Recovery Animation**: Smooth revival when you drink water
- **Visual Feedback**: Satisfying animations between growth stages

### 📊 Progress Analytics
- **Daily Tracking**: Real-time progress bar
- **7-Day History**: Interactive chart showing your week
- **Goal Visualization**: Color-coded bars (blue = in progress, green = goal met)
- **Statistics**: Track your consistency and patterns

### 🔔 Smart Reminders
- **Customizable Intervals**: 1, 2, 3, or 4-hour reminders
- **Gentle Nudges**: Non-intrusive notifications
- **Hydration Prompts**: Motivating messages to keep you going

## 🎯 Goals & Motivation

The app uses psychology-based motivation techniques:
- **Visual Progress**: Watching your plant grow creates emotional investment
- **Daily Reset**: Fresh start each day prevents discouragement
- **Achievable Milestones**: 10 growth stages make progress feel rewarding
- **Positive Reinforcement**: Celebrate reaching goals with visual feedback

## 🛠️ Development

### Local Development
```bash
# Start local server
python -m http.server 8000

# Open in browser
open http://localhost:8000
```

### Contributing
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Bootstrap 5 for responsive UI components
- Chart.js for beautiful data visualization
- PWA techniques for offline functionality
- Pixel art inspiration from classic 8-bit games

## 📧 Support

If you have questions or need help:
- Open an issue on GitHub
- Check the [documentation](README.md)
- Review the code - it's well-commented!

---

**Happy Hydrating! 🌱💧**

*Remember: This app is for tracking purposes only. Consult healthcare professionals for personalized hydration advice.*
Edit `style.css` to modify the color scheme:
- `--primary-color`: Main app color
- Plant growth animations
- Progress bar colors

### Adjusting Growth Algorithm
Modify the `updatePlantStage()` function in `app.js` to change when the plant grows:
```javascript
// Current thresholds: 31%, 61% for 3 growth stages
// Wilting occurs after 6+ hours without water when below 50% progress
// Adjust these percentages and timing as needed
```

### Notification Timing
Change reminder intervals in the settings or modify the default in `app.js`:
```javascript
// Default: every 2 hours
this.settings = {
    notifications: false,
    reminderInterval: 2  // Change this value
};
```

## File Structure

```
/
├── index.html          # Main app interface
├── app.js             # Application logic
├── style.css          # Custom styles
├── manifest.json      # PWA manifest
├── sw.js             # Service worker
├── README.md         # This file
└── assets/
    ├── plant-sprites/ # Your 4 tulip sprites (3 growth + 1 wilted)
    └── icons/        # PWA icons (8 sizes)
```

## Contributing

Feel free to customize and improve the app! Some ideas:
- Add more pixelated plant varieties (roses, sunflowers, etc.)
- Implement achievement system for consistent watering
- Add social sharing features for plant growth milestones  
- Create weekly/monthly statistics and streaks
- Add different liquid types (tea, coffee, juice, etc.)
- Create seasonal plant variants or decorations
- Add weather effects that influence plant growth
- Implement plant care mini-games

## License

This project is open source. Feel free to use and modify as needed.

---

**Happy hydrating! 🌱💧**
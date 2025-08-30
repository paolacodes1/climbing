<div align="center">
  <img src="public/logo1.png" alt="ChalkUp Logo" width="200" />
</div>

# 🧗‍♀️ Bouldering Tracker PWA

A comprehensive Progressive Web App for tracking your bouldering progress, designed for climbers who want to analyze their performance and stay motivated.

**🌐 Live App:** [https://paolacodes1.github.io/climbing/](https://paolacodes1.github.io/climbing/)

## ✨ Features

### 📝 Climb Logging
- **Detailed tracking**: Route name, grade (V0-V17), attempts, and completion status
- **Flash button**: Quick logging for one-attempt sends
- **Comprehensive details**: Wall angle, hold types, route styles, and personal notes
- **Photo support**: Attach images to remember challenging problems
- **Gym management**: Organize climbs by your favorite climbing gyms

### 📊 Progress Analytics
- **Interactive charts**: Visualize your climbing data with grade distributions and monthly trends
- **Success metrics**: Track completion rates, flash percentages, and personal bests
- **Achievement system**: Unlock milestones as you progress through grades
- **Performance insights**: Identify strengths and areas for improvement

### 👤 User Profile
- **Personal dashboard**: Customize your climbing profile and track your journey
- **Goal setting**: Set and monitor climbing objectives
- **Streak tracking**: Stay motivated with climbing consistency metrics
- **Data export**: Download your complete climbing history

### 🌐 Community Features
- **Leaderboards**: See how you rank against other climbers
- **Weekly challenges**: Participate in community climbing goals
- **Activity feed**: Stay updated with recent climber achievements
- **Local rankings**: Compare progress with climbers in your area

### 📱 PWA Benefits
- **Offline functionality**: Log climbs without internet connection
- **Mobile-first design**: Optimized for smartphone use at the gym
- **Install on iPhone**: Add directly to home screen without App Store
- **Fast performance**: Instant loading with cached data
- **Cross-platform**: Works on iOS, Android, and desktop

## 🚀 Technology Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui for consistent, accessible design
- **Data Visualization**: Recharts for interactive climbing analytics
- **Database**: IndexedDB with Dexie.js for offline-first data storage
- **State Management**: Zustand for efficient app state handling
- **PWA**: next-pwa for Progressive Web App capabilities
- **Deployment**: GitHub Pages with automated CI/CD

## 🏃‍♀️ Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/paolacodes1/climbing.git
   cd climbing
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

This creates an optimized static export in the `out` directory, ready for deployment.

## 🎨 Design System

The app features a custom **Caribbean Current** color theme:
- **Primary**: Deep teal (#0D5C63) for trust and reliability
- **Secondary**: Cambridge blue (#88BB92) for growth and progress
- **Accent**: Goldenrod (#D19C1D) for achievements and highlights
- **Destructive**: Persian red (#C3423F) for warnings and deletions

## 🔒 Privacy & Data

- **Local storage**: All climbing data stays on your device
- **No tracking**: Zero external analytics or user tracking
- **Export control**: Full ownership of your climbing history
- **Offline-first**: Works completely without internet connection

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📱 Screenshots

### Climb Logging Interface
<img src="public/screenshots/Screenshot 2025-08-30 at 1.54.55 PM.png" alt="Log New Climb Interface" width="600">

*Comprehensive climb logging with route details, grades, hold types, and notes*

### Progress Analytics Dashboard
<img src="public/screenshots/Screenshot 2025-08-30 at 1.55.12 PM.png" alt="Progress Analytics Dashboard" width="600">

*Track your climbing statistics with interactive charts and performance metrics*

### Community Features
<img src="public/screenshots/Screenshot 2025-08-30 at 1.55.21 PM.png" alt="Community Leaderboards" width="600">

*Connect with fellow climbers and compete on leaderboards*

### Personal Profile
<img src="public/screenshots/Screenshot 2025-08-30 at 1.55.28 PM.png" alt="Personal Profile Dashboard" width="600">

*Monitor your climbing journey with personalized stats and achievements*

---

**Start tracking your bouldering journey today!** 🧗‍♂️

[Launch App](https://paolacodes1.github.io/climbing/) | [Report Issues](https://github.com/paolacodes1/climbing/issues) | [Contribute](https://github.com/paolacodes1/climbing/pulls)

class PlantDrinkerApp {
    constructor() {
        this.currentIntake = 0;
        this.dailyTarget = 2000;
        this.lastCustomAmount = 750;
        this.thirdButtonAmount = 750;
        this.isCustomThirdButton = false;
        this.plantStage = 1;
        this.isWilted = false;
        this.lastWaterTime = Date.now();
        this.todayData = [];
        this.drinksCount = 0;
        this.isManuallyEdited = false;
        this.largestDrink = 0;
        this.dailyHistory = []; // Array to store daily totals: [{date: 'YYYY-MM-DD', total: 2000}]
        this.historyChart = null;
        this.settings = {
            notifications: false,
            reminderInterval: 2
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateDisplay();
        this.setupPWA();
        this.checkDayReset();
        this.startWiltingCheck();
        // Remove broken progress logic from init, handled in updatePlantStage
        this.updatePlantStage();
        this.initializeChart();
    }

    setupEventListeners() {
        const intakeButtons = document.querySelectorAll('.intake-btn');
        intakeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.currentTarget.dataset.amount);
                this.addWater(amount);
                this.addHapticFeedback();
            });
        });

        // Remove any existing listeners and add fresh one for third button
        const thirdBtn = document.getElementById('thirdBtn');
        const newThirdBtn = thirdBtn.cloneNode(true);
        thirdBtn.parentNode.replaceChild(newThirdBtn, thirdBtn);
        
        document.getElementById('thirdBtn').addEventListener('click', (e) => {
            // Always use the current thirdButtonAmount instead of dataset
            this.addWater(this.thirdButtonAmount);
            this.addHapticFeedback();
        });

        document.getElementById('newCustomBtn').addEventListener('click', () => {
            this.showCustomAmountModal();
        });

        document.getElementById('addCustomAmountBtn').addEventListener('click', () => {
            this.addCustomAmountFromModal();
        });

        // Preset button listeners
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const amount = parseInt(e.target.dataset.amount);
                document.getElementById('customAmountInput').value = amount;
                this.updatePresetButtons(amount);
                this.addHapticFeedback();
            });
        });

        document.getElementById('customAmountInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addCustomAmountFromModal();
            }
        });

        document.getElementById('settingsBtn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        document.getElementById('notificationsToggle').addEventListener('change', (e) => {
            if (e.target.checked) {
                this.requestNotificationPermission();
            }
            this.toggleReminderOptions(e.target.checked);
        });

        // Target preset buttons
        document.querySelectorAll('.target-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = parseInt(e.target.dataset.target);
                document.getElementById('targetInput').value = target;
                this.updateTargetPresetButtons(target);
                this.addHapticFeedback();
            });
        });

        // Edit water amount functionality
        document.getElementById('editIntakeBtn').addEventListener('click', () => {
            this.showEditIntakeModal();
        });

        document.getElementById('saveEditedIntake').addEventListener('click', () => {
            this.saveEditedIntake();
        });

        document.getElementById('resetDayBtn').addEventListener('click', () => {
            this.showResetDayModal();
        });

        document.getElementById('confirmResetDay').addEventListener('click', () => {
            this.resetDay();
        });
    }

    loadData() {
        const saved = localStorage.getItem('plantDrinkerData');
        if (saved) {
            const data = JSON.parse(saved);
            this.currentIntake = data.currentIntake || 0;
            this.dailyTarget = data.dailyTarget || 2000;
            this.lastCustomAmount = data.lastCustomAmount || 750;
            this.thirdButtonAmount = data.thirdButtonAmount || 750;
            this.isCustomThirdButton = data.isCustomThirdButton || false;
            this.plantStage = data.plantStage || 1;
            this.isWilted = data.isWilted || false;
            this.lastWaterTime = data.lastWaterTime || Date.now();
            this.todayData = data.todayData || [];
            this.drinksCount = data.drinksCount || 0;
            this.isManuallyEdited = data.isManuallyEdited || false;
            this.largestDrink = data.largestDrink || 0;
            this.dailyHistory = data.dailyHistory || [];
            this.settings = { ...this.settings, ...data.settings };
        }
    }

    saveData() {
        const data = {
            currentIntake: this.currentIntake,
            dailyTarget: this.dailyTarget,
            lastCustomAmount: this.lastCustomAmount,
            thirdButtonAmount: this.thirdButtonAmount,
            isCustomThirdButton: this.isCustomThirdButton,
            plantStage: this.plantStage,
            isWilted: this.isWilted,
            lastWaterTime: this.lastWaterTime,
            todayData: this.todayData,
            drinksCount: this.drinksCount,
            isManuallyEdited: this.isManuallyEdited,
            largestDrink: this.largestDrink,
            dailyHistory: this.dailyHistory,
            settings: this.settings,
            lastSaveDate: new Date().toDateString()
        };
        localStorage.setItem('plantDrinkerData', JSON.stringify(data));
    }

    checkDayReset() {
        const saved = localStorage.getItem('plantDrinkerData');
        if (saved) {
            const data = JSON.parse(saved);
            const lastSaveDate = data.lastSaveDate;
            const today = new Date().toDateString();
            
            if (lastSaveDate && lastSaveDate !== today) {
                // Save yesterday's total to history before resetting
                const yesterday = new Date(lastSaveDate);
                const yesterdayString = yesterday.toISOString().split('T')[0];
                this.saveDailyTotal(yesterdayString, this.currentIntake);
                
                this.currentIntake = 0;
                this.todayData = [];
                this.drinksCount = 0;
                this.isManuallyEdited = false;
                this.largestDrink = 0;
                this.plantStage = 1;
                this.isWilted = false;
                this.lastWaterTime = Date.now();
                this.saveData();
            }
        }
    }

    addWater(amount) {
        const wasWilted = this.isWilted;
        
        this.currentIntake += amount;
        this.lastWaterTime = Date.now();
        this.drinksCount++;
        
        if (amount > this.largestDrink) {
            this.largestDrink = amount;
        }
        
        this.todayData.push({
            amount: amount,
            time: new Date().toLocaleTimeString(),
            timestamp: Date.now()
        });
        
        this.updatePlantStage();
        this.updateDisplay();
        this.updateChart(); // Update chart with new data
        this.saveData();
        this.showSuccessAnimation();
        
        if (wasWilted && !this.isWilted) {
            this.animatePlantRecovery();
        }
        
        if (this.currentIntake >= this.dailyTarget && this.settings.notifications) {
            this.showNotification('Congratulations!', 'You\'ve reached your daily water goal! 🎉');
        }
    }

    showCustomAmountModal() {
        document.getElementById('customAmountInput').value = this.lastCustomAmount;
        this.updatePresetButtons(this.lastCustomAmount);
        const modal = new bootstrap.Modal(document.getElementById('customAmountModal'));
        modal.show();
        
        // Focus input after modal is shown
        setTimeout(() => {
            document.getElementById('customAmountInput').focus();
            document.getElementById('customAmountInput').select();
        }, 300);
    }

    addCustomAmountFromModal() {
        const amountInput = document.getElementById('customAmountInput');
        const amount = parseInt(amountInput.value);
        
        if (amount && amount > 0 && amount <= 2000) {
            this.lastCustomAmount = amount;
            this.thirdButtonAmount = amount;
            this.isCustomThirdButton = true;
            this.addWater(amount);
            this.updateThirdButton();
            this.addHapticFeedback();
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('customAmountModal'));
            modal.hide();
            
            // Clear input for next time
            setTimeout(() => {
                amountInput.value = '';
                this.clearPresetButtons();
            }, 300);
        } else {
            amountInput.classList.add('is-invalid');
            setTimeout(() => amountInput.classList.remove('is-invalid'), 2000);
        }
    }

    updatePresetButtons(amount) {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.amount) === amount) {
                btn.classList.add('active');
            }
        });
    }

    clearPresetButtons() {
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
        });
    }

    updateThirdButton() {
        const thirdBtn = document.getElementById('thirdBtn');
        const thirdBtnText = document.getElementById('thirdBtnText');
        
        if (this.isCustomThirdButton) {
            thirdBtnText.textContent = `${this.thirdButtonAmount}ml`;
            thirdBtn.classList.remove('btn-primary');
            thirdBtn.classList.add('btn-success');
        } else {
            thirdBtnText.textContent = '750ml';
            thirdBtn.classList.remove('btn-success');
            thirdBtn.classList.add('btn-primary');
        }
    }

    updatePlantStage() {
        const progressPercentage = (this.currentIntake / this.dailyTarget) * 100;
        const currentTime = Date.now();
        const hoursSinceLastWater = (currentTime - this.lastWaterTime) / (1000 * 60 * 60);

        // Check for wilting conditions
        const shouldWilt = hoursSinceLastWater > 6 && progressPercentage < 50;

        if (shouldWilt && !this.isWilted) {
            this.isWilted = true;
            this.animatePlantWilting();
            if (this.settings.notifications) {
                this.showNotification('Your plant needs water! 🥀', 'It\'s been too long since your last drink. Your tulip is wilting!');
            }
            return;
        }

        // Recovery from wilting
        if (this.isWilted && (progressPercentage >= 25 || hoursSinceLastWater < 2)) {
            this.isWilted = false;
        }

        // Determine growth stage (1-10, 0 is wilted)
        let newStage = 1;
        if (progressPercentage >= 100) newStage = 10;
        else if (progressPercentage >= 90) newStage = 9;
        else if (progressPercentage >= 80) newStage = 8;
        else if (progressPercentage >= 70) newStage = 7;
        else if (progressPercentage >= 60) newStage = 6;
        else if (progressPercentage >= 50) newStage = 5;
        else if (progressPercentage >= 40) newStage = 4;
        else if (progressPercentage >= 30) newStage = 3;
        else if (progressPercentage >= 20) newStage = 2;
        else newStage = 1;

        if (newStage !== this.plantStage) {
            this.plantStage = newStage;
            this.animatePlantGrowth();
        }
    }

    animatePlantGrowth() {
        const plantSprite = document.getElementById('plantSprite');
        plantSprite.classList.add('plant-grow');
        setTimeout(() => {
            plantSprite.classList.remove('plant-grow');
        }, 1200);
    }

    animatePlantWilting() {
        const plantSprite = document.getElementById('plantSprite');
        plantSprite.classList.add('plant-wilt');
        setTimeout(() => {
            plantSprite.classList.remove('plant-wilt');
            plantSprite.classList.add('plant-wilted');
        }, 1000);
    }

    animatePlantRecovery() {
        const plantSprite = document.getElementById('plantSprite');
        plantSprite.classList.remove('plant-wilted');
        plantSprite.classList.add('plant-recover');
        setTimeout(() => {
            plantSprite.classList.remove('plant-recover');
        }, 1200);
    }

    updateDisplay() {
        document.getElementById('currentIntake').textContent = this.currentIntake;
        document.getElementById('dailyTarget').textContent = this.dailyTarget;

        const progressPercentage = Math.min((this.currentIntake / this.dailyTarget) * 100, 100);
        document.getElementById('progressPercentage').textContent = Math.round(progressPercentage);

        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${progressPercentage}%`;
        progressBar.setAttribute('aria-valuenow', progressPercentage);

        if (progressPercentage >= 100) {
            progressBar.classList.remove('bg-info');
            progressBar.classList.add('bg-success');
        } else {
            progressBar.classList.remove('bg-success');
            progressBar.classList.add('bg-info');
        }

        const plantSprite = document.getElementById('plantSprite');
        const plantPot = document.getElementById('plantPot');
        if (this.currentIntake === 0) {
            plantSprite.style.display = 'none';
            plantPot.style.display = 'block';
        } else {
            plantSprite.style.display = 'block';
            plantPot.style.display = 'block';
            if (this.isWilted) {
                plantSprite.src = `assets/plant-sprites/stage-wilted.png`;
                plantSprite.classList.add('plant-wilted');
            } else {
                plantSprite.src = `assets/plant-sprites/stage-${this.plantStage}.png`;
                plantSprite.classList.remove('plant-wilted');
                // Animate first sprite entry
                if (this.plantStage === 1 && this.todayData.length === 1) {
                    plantSprite.classList.add('plant-entry');
                    setTimeout(() => {
                        plantSprite.classList.remove('plant-entry');
                    }, 1000);
                }
            }
        }

        // this.updateDailySummary(); // COMMENTED OUT - Daily Summary removed
        this.updateThirdButton();
    }

    addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }

    // COMMENTED OUT - Daily Summary functions removed
    /*
    updateDailySummary() {
        // Update drinks count
        document.getElementById('drinksCount').textContent = this.drinksCount;
        
        // Update average drink size
        const averageDrink = this.drinksCount > 0 ? Math.round(this.currentIntake / this.drinksCount) : 0;
        document.getElementById('averageDrink').textContent = `${averageDrink}ml`;
        
        // Update largest drink
        document.getElementById('largestDrink').textContent = `${this.largestDrink}ml`;
        
        // Update time since last drink
        const timeSinceLastDrink = this.calculateTimeSinceLastDrink();
        document.getElementById('timeSinceLastDrink').textContent = timeSinceLastDrink;
        
        // Show/hide edit indicator
        const editIndicator = document.getElementById('editIndicator');
        if (this.isManuallyEdited) {
            editIndicator.style.display = 'block';
        } else {
            editIndicator.style.display = 'none';
        }
    }

    calculateTimeSinceLastDrink() {
        if (this.drinksCount === 0) {
            return 'Never';
        }
        
        const now = Date.now();
        const timeDiff = now - this.lastWaterTime;
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours === 0) {
            return minutes === 0 ? 'Just now' : `${minutes}m`;
        } else if (hours < 24) {
            return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
        } else {
            const days = Math.floor(hours / 24);
            return `${days}d`;
        }
    }
    */

    showSuccessAnimation() {
        const progressBar = document.getElementById('progressBar');
        progressBar.classList.add('success-pulse');
        setTimeout(() => {
            progressBar.classList.remove('success-pulse');
        }, 600);
    }

    showSettings() {
        document.getElementById('targetInput').value = this.dailyTarget;
        document.getElementById('notificationsToggle').checked = this.settings.notifications;
        
        // Set radio button for reminder interval
        const intervalRadio = document.getElementById(`interval${this.settings.reminderInterval}`);
        if (intervalRadio) {
            intervalRadio.checked = true;
        }
        
        this.updateTargetPresetButtons(this.dailyTarget);
        this.toggleReminderOptions(this.settings.notifications);
        
        const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
        modal.show();
    }

    saveSettings() {
        const newTarget = parseInt(document.getElementById('targetInput').value);
        const notifications = document.getElementById('notificationsToggle').checked;
        const reminderInterval = parseInt(document.querySelector('input[name="reminderInterval"]:checked').value);
        
        if (newTarget >= 500 && newTarget <= 5000) {
            this.dailyTarget = newTarget;
        }
        
        this.settings.notifications = notifications;
        this.settings.reminderInterval = reminderInterval;
        
        this.saveData();
        this.updateDisplay();
        this.addHapticFeedback();
        
        if (notifications) {
            this.scheduleReminders();
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
        modal.hide();
    }

    updateTargetPresetButtons(target) {
        document.querySelectorAll('.target-preset').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
            
            if (parseInt(btn.dataset.target) === target) {
                btn.classList.remove('btn-outline-primary');
                btn.classList.add('btn-primary');
            }
        });
    }

    toggleReminderOptions(enabled) {
        const reminderOptions = document.getElementById('reminderOptions');
        if (enabled) {
            reminderOptions.style.opacity = '1';
            reminderOptions.style.pointerEvents = 'auto';
        } else {
            reminderOptions.style.opacity = '0.5';
            reminderOptions.style.pointerEvents = 'none';
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                document.getElementById('notificationsToggle').checked = false;
                this.settings.notifications = false;
            }
        }
    }

    showNotification(title, message) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: 'assets/icons/icon-192x192.png',
                badge: 'assets/icons/icon-72x72.png'
            });
        }
    }

    scheduleReminders() {
        if (!this.settings.notifications || !('Notification' in window)) return;
        
        const intervalHours = this.settings.reminderInterval;
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        const checkReminder = () => {
            const now = Date.now();
            const lastEntry = this.todayData[this.todayData.length - 1];
            
            if (!lastEntry || (now - lastEntry.timestamp) > intervalMs) {
                const hoursAgo = lastEntry ? 
                    Math.floor((now - lastEntry.timestamp) / (1000 * 60 * 60)) : 
                    intervalHours;
                
                this.showNotification(
                    'Time to hydrate! 💧',
                    `It's been ${hoursAgo} hours since your last drink. Your plant is waiting!`
                );
            }
        };
        
        setInterval(checkReminder, 30 * 60 * 1000);
    }

    startWiltingCheck() {
        // Check for wilting every 30 minutes
        setInterval(() => {
            this.updatePlantStage();
            this.updateDisplay();
            this.saveData();
        }, 30 * 60 * 1000);
    }

    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const amount = urlParams.get('amount');
        
        if (amount) {
            const waterAmount = parseInt(amount);
            if (waterAmount > 0 && waterAmount <= 2000) {
                // Small delay to ensure UI is loaded
                setTimeout(() => {
                    this.addWater(waterAmount);
                    this.addHapticFeedback();
                    
                    // Show a toast notification
                    this.showNotification('Water Added!', `Added ${waterAmount}ml from shortcut`);
                    
                    // Clear the URL parameter
                    window.history.replaceState({}, document.title, window.location.pathname);
                }, 500);
            }
        }
    }

    showEditIntakeModal() {
        document.getElementById('editIntakeInput').value = this.currentIntake;
        const modal = new bootstrap.Modal(document.getElementById('editIntakeModal'));
        modal.show();
    }

    saveEditedIntake() {
        const newAmount = parseInt(document.getElementById('editIntakeInput').value);
        
        if (newAmount >= 0 && newAmount <= 8000) {
            const oldAmount = this.currentIntake;
            this.currentIntake = newAmount;
            this.isManuallyEdited = true;
            
            // Recalculate plant stage
            this.updatePlantStage();
            this.updateDisplay();
            this.saveData();
            this.addHapticFeedback();
            
            // Show confirmation
            this.showNotification('Amount Updated', `Water intake changed from ${oldAmount}ml to ${newAmount}ml`);
            
            const modal = bootstrap.Modal.getInstance(document.getElementById('editIntakeModal'));
            modal.hide();
        } else {
            const input = document.getElementById('editIntakeInput');
            input.classList.add('is-invalid');
            setTimeout(() => input.classList.remove('is-invalid'), 2000);
        }
    }

    showResetDayModal() {
        const modal = new bootstrap.Modal(document.getElementById('resetDayModal'));
        modal.show();
    }

    resetDay() {
        this.currentIntake = 0;
        this.todayData = [];
        this.drinksCount = 0;
        this.isManuallyEdited = false;
        this.largestDrink = 0;
        this.plantStage = 1;
        this.isWilted = false;
        this.lastWaterTime = Date.now();
        
        this.updateDisplay();
        this.saveData();
        this.addHapticFeedback();
        
        this.showNotification('Day Reset', 'Your daily progress has been reset');
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('resetDayModal'));
        modal.hide();
    }

    setupPWA() {
        let deferredPrompt;
        
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            
            const installBtn = document.createElement('button');
            installBtn.className = 'btn btn-success install-btn';
            installBtn.innerHTML = '<i class="bi bi-download"></i>';
            installBtn.style.display = 'flex';
            installBtn.title = 'Install App';
            
            installBtn.addEventListener('click', async () => {
                if (deferredPrompt) {
                    deferredPrompt.prompt();
                    const { outcome } = await deferredPrompt.userChoice;
                    if (outcome === 'accepted') {
                        installBtn.remove();
                    }
                    deferredPrompt = null;
                }
            });
            
            document.body.appendChild(installBtn);
        });
        
        window.addEventListener('appinstalled', () => {
            const installBtn = document.querySelector('.install-btn');
            if (installBtn) {
                installBtn.remove();
            }
        });
    }

    saveDailyTotal(date, total) {
        // Remove existing entry for this date if it exists
        this.dailyHistory = this.dailyHistory.filter(entry => entry.date !== date);
        
        // Add new entry
        this.dailyHistory.push({ date, total });
        
        // Keep only last 30 days
        this.dailyHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
        if (this.dailyHistory.length > 30) {
            this.dailyHistory = this.dailyHistory.slice(-30);
        }
        
        // Update chart if it exists
        if (this.historyChart) {
            this.updateChart();
        }
    }

    initializeChart() {
        const ctx = document.getElementById('historyChart');
        if (!ctx) return;
        
        const chartData = this.getChartData();
        
        this.historyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Water Intake (ml)',
                    data: chartData.data,
                    backgroundColor: (ctx) => {
                        const value = ctx.parsed.y;
                        const target = this.dailyTarget;
                        return value >= target ? '#198754' : '#0dcaf0';
                    },
                    borderColor: (ctx) => {
                        const value = ctx.parsed.y;
                        const target = this.dailyTarget;
                        return value >= target ? '#198754' : '#0dcaf0';
                    },
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed.y;
                                const percentage = Math.round((value / this.dailyTarget) * 100);
                                return `${value}ml (${percentage}% of goal)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: Math.max(this.dailyTarget * 1.2, 3000),
                        ticks: {
                            callback: function(value) {
                                return value >= 1000 ? (value/1000) + 'L' : value + 'ml';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                elements: {
                    bar: {
                        borderSkipped: false,
                    }
                }
            }
        });
    }

    getChartData() {
        const last7Days = this.getLast7Days();
        const labels = last7Days.map(date => {
            const d = new Date(date);
            return d.toLocaleDateString('en-US', { weekday: 'short' });
        });
        
        const data = last7Days.map(date => {
            const entry = this.dailyHistory.find(h => h.date === date);
            if (date === new Date().toISOString().split('T')[0]) {
                // Today's data is current intake
                return this.currentIntake;
            }
            return entry ? entry.total : 0;
        });
        
        return { labels, data };
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    updateChart() {
        if (!this.historyChart) return;
        
        const chartData = this.getChartData();
        this.historyChart.data.labels = chartData.labels;
        this.historyChart.data.datasets[0].data = chartData.data;
        this.historyChart.update();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PlantDrinkerApp();
});
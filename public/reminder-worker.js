// Worker state
let medicines = [];
let history = [];
let snoozeTimeout = null;
let nextDoseTimeout = null;

// Function to calculate the next dose time for a single medicine
function getNextDoseTime(med, now) {
    const [hour, minute] = med.time.split(':');
    let nextDoseTime = new Date(now);
    nextDoseTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

    // If it's a weekly medicine, adjust for the correct day of the week
    if (med.frequency === 'weekly') {
        const scheduleDay = 0; // Assuming Sunday for now, needs to be part of medicine model
        let daysUntilNext = (scheduleDay - now.getDay() + 7) % 7;
        if (daysUntilNext === 0 && nextDoseTime.getTime() < now.getTime()) {
            daysUntilNext = 7;
        }
        nextDoseTime.setDate(now.getDate() + daysUntilNext);
    }

    // If the calculated time is in the past for a daily med, move to the next day
    if (med.frequency === 'daily' && nextDoseTime.getTime() < now.getTime()) {
        nextDoseTime.setDate(nextDoseTime.getDate() + 1);
    }
    
    return nextDoseTime;
}

function wasTakenToday(medId) {
    const today = new Date();
    return history.some(log => {
        const logDate = new Date(log.date);
        return log.medicineId === medId &&
               logDate.getDate() === today.getDate() &&
               logDate.getMonth() === today.getMonth() &&
               logDate.getFullYear() === today.getFullYear();
    });
}


// Function to find the very next dose to schedule from all medicines
function scheduleNextReminder() {
    // Clear any existing timeouts to avoid duplicates
    if (nextDoseTimeout) clearTimeout(nextDoseTimeout);
    if (snoozeTimeout) clearTimeout(snoozeTimeout);

    const now = new Date();
    let closestDose = null;
    let closestMed = null;

    medicines.forEach(med => {
        // Crucially, check if the medicine for today has already been taken
        if (wasTakenToday(med.id)) {
            return; // Skip this medicine if it was already taken today
        }
        
        const nextTime = getNextDoseTime(med, now);

        if (!closestDose || nextTime.getTime() < closestDose.getTime()) {
            closestDose = nextTime;
            closestMed = med;
        }
    });

    if (closestDose && closestMed) {
        const delay = closestDose.getTime() - now.getTime();
        if (delay > 0) {
            nextDoseTimeout = setTimeout(() => {
                postMessage(closestMed); // Send the reminder
                scheduleNextReminder(); // Immediately schedule the next one after this
            }, delay);
        }
    }
}

self.onmessage = (event) => {
    const { type, payload } = event.data;

    if (type === 'UPDATE_DATA') {
        medicines = payload.medicines || [];
        history = payload.history || [];
        scheduleNextReminder();
    }
    
    if (type === 'SNOOZE') {
        if(nextDoseTimeout) clearTimeout(nextDoseTimeout);
        snoozeTimeout = setTimeout(() => {
            postMessage(payload);
            scheduleNextReminder();
        }, 5 * 60 * 1000); // 5 minutes
    }
};

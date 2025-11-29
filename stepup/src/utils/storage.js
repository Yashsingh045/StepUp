import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    WORKOUTS: '@stepup_workouts',
    WEEKLY_GOALS: '@stepup_weekly_goals',
    CUSTOM_TYPES: '@stepup_custom_types',
    USER: '@stepup_user',
    REST_DAYS: '@stepup_rest_days',
    REGISTERED_USERS: '@stepup_registered_users',
};


export const saveWorkout = async (workout) => {
    try {
        const existingWorkouts = await getWorkouts();
        const newWorkouts = [workout, ...existingWorkouts];
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(newWorkouts));
        return newWorkouts;
    } catch (e) {
        console.error("Error saving workout:", e);
        return [];
    }
};

export const updateWorkout = async (updatedWorkout) => {
    try {
        const existingWorkouts = await getWorkouts();
        const newWorkouts = existingWorkouts.map(w =>
            w.id === updatedWorkout.id ? updatedWorkout : w
        );
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(newWorkouts));
        return newWorkouts;
    } catch (e) {
        console.error("Error updating workout:", e);
        return [];
    }
};

export const deleteWorkout = async (workoutId) => {
    try {
        const existingWorkouts = await getWorkouts();
        const newWorkouts = existingWorkouts.filter(w => w.id !== workoutId);
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(newWorkouts));
        return newWorkouts;
    } catch (e) {
        console.error("Error deleting workout:", e);
        return [];
    }
};

export const getWorkouts = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUTS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading workouts:", e);
        return [];
    }
};



export const saveWeeklyGoal = async (goal) => {
    try {
        const existingGoals = await getWeeklyGoals();

        const newGoals = [...existingGoals, goal];
        await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify(newGoals));
        return newGoals;
    } catch (e) {
        console.error("Error saving weekly goal:", e);
        return [];
    }
};

export const getWeeklyGoals = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_GOALS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading weekly goals:", e);
        return [];
    }
};


export const getLatestGoal = async () => {
    const goals = await getWeeklyGoals();
    return goals.length > 0 ? goals[goals.length - 1] : null;
};



export const getCustomTypes = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_TYPES);
        return jsonValue != null ? JSON.parse(jsonValue) : ["Strength", "Cardio", "Yoga", "HIIT", "Pilates"];
    } catch (e) {
        return ["Strength", "Cardio", "Yoga", "HIIT", "Pilates"];
    }
};

export const addCustomType = async (newType) => {
    try {
        const existingTypes = await getCustomTypes();
        if (!existingTypes.includes(newType)) {
            const newTypes = [...existingTypes, newType];
            await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_TYPES, JSON.stringify(newTypes));
            return newTypes;
        }
        return existingTypes;
    } catch (e) {
        console.error("Error adding custom type:", e);
        return [];
    }
};


export const seedInitialData = async () => {
    const workouts = await getWorkouts();
    if (workouts.length === 0) {
        const initialWorkouts = [
            {
                id: "uuid-1",
                date: new Date().toISOString().split('T')[0], // Today
                type: "Strength",
                duration: 45,
                steps: 1200,
                calories: 300,
                notes: "Upper body focus",
            },
            {
                id: "uuid-2",
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                type: "Cardio",
                duration: 30,
                steps: 4000,
                calories: 250,
                notes: "Morning run",
            },
            {
                id: "uuid-3",
                date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
                type: "Yoga",
                duration: 60,
                steps: 500,
                calories: 150,
                notes: "Relaxing flow",
            }
        ];
        await AsyncStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(initialWorkouts));
    }

    const goals = await getWeeklyGoals();
    if (goals.length === 0) {
        const initialGoal = {
            weekStart: new Date().toISOString().split('T')[0],
            targetMinutes: 300,
            targetWorkouts: 5,
            targetSteps: 50000,
            targetCalories: 2000
        };
        await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_GOALS, JSON.stringify([initialGoal]));
    }
    return true;
};


export const getWeeklyStats = async () => {
    const workouts = await getWorkouts();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
    }

    const stats = last7Days.map(dateStr => {
        const dayWorkouts = workouts.filter(w => w.date === dateStr);
        const totalSteps = dayWorkouts.reduce((sum, w) => sum + (parseInt(w.steps) || 0), 0);
        const totalCalories = dayWorkouts.reduce((sum, w) => sum + (parseInt(w.calories) || 0), 0);
        const totalDuration = dayWorkouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);

        const dateObj = new Date(dateStr);
        return {
            label: days[dateObj.getDay()],
            steps: totalSteps,
            calories: totalCalories,
            duration: totalDuration,
            fullDate: dateStr
        };
    });

    return {
        labels: stats.map(s => s.label),
        datasets: [
            {
                data: stats.map(s => s.steps),
                strokeWidth: 2
            }
        ],
        fullStats: stats
    };
};

export const saveUser = async (user) => {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return true;
    } catch (e) {
        console.error("Error saving user:", e);
        return false;
    }
};

export const getUser = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error("Error reading user:", e);
        return null;
    }
};

export const getRegisteredUsers = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading registered users:", e);
        return [];
    }
};

export const saveRestDay = async (date) => {
    try {
        const existingRestDays = await getRestDays();
        if (!existingRestDays.includes(date)) {
            const newRestDays = [...existingRestDays, date];
            await AsyncStorage.setItem(STORAGE_KEYS.REST_DAYS, JSON.stringify(newRestDays));
            return newRestDays;
        }
        return existingRestDays;
    } catch (e) {
        console.error("Error saving rest day:", e);
        return [];
    }
};

export const getRestDays = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.REST_DAYS);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {
        console.error("Error reading rest days:", e);
        return [];
    }
};

export const getStreak = async () => {
    const workouts = await getWorkouts();
    const restDays = await getRestDays();

    // Combine workout dates and rest days
    const activityDates = new Set([
        ...workouts.map(w => w.date),
        ...restDays
    ]);

    const sortedDates = Array.from(activityDates).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if streak is active (today or yesterday present)
    if (!activityDates.has(today) && !activityDates.has(yesterday)) {
        return 0;
    }

    // Iterate backwards from today/yesterday
    let checkDate = new Date();
    if (!activityDates.has(today)) {
        checkDate.setDate(checkDate.getDate() - 1); // Start checking from yesterday
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (activityDates.has(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
};

export const getBestWeek = async () => {
    const workouts = await getWorkouts();
    if (workouts.length === 0) return { weekStart: null, totalDuration: 0 };

    // Group by week
    const weeks = {};
    workouts.forEach(w => {
        const date = new Date(w.date);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
        const monday = new Date(date.setDate(diff)).toISOString().split('T')[0];

        if (!weeks[monday]) weeks[monday] = 0;
        weeks[monday] += parseInt(w.duration) || 0;
    });

    let bestWeek = { weekStart: null, totalDuration: 0 };
    for (const [weekStart, duration] of Object.entries(weeks)) {
        if (duration > bestWeek.totalDuration) {
            bestWeek = { weekStart, totalDuration: duration };
        }
    }
    return bestWeek;
};

export const getWeeklyTypeBreakdown = async () => {
    const workouts = await getWorkouts();
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff)).toISOString().split('T')[0];

    const thisWeekWorkouts = workouts.filter(w => w.date >= monday);

    const breakdown = {};
    thisWeekWorkouts.forEach(w => {
        if (!breakdown[w.type]) breakdown[w.type] = 0;
        breakdown[w.type] += parseInt(w.duration) || 0;
    });

    return Object.entries(breakdown).map(([type, duration]) => ({ type, duration }));
};

export const getTotalDurationForWeek = async (weekOffset = 0) => {
    const workouts = await getWorkouts();
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1) - (weekOffset * 7); // Monday of the target week

    const mondayDate = new Date(today);
    mondayDate.setDate(diff);
    const mondayStr = mondayDate.toISOString().split('T')[0];

    const nextMondayDate = new Date(mondayDate);
    nextMondayDate.setDate(mondayDate.getDate() + 7);
    const nextMondayStr = nextMondayDate.toISOString().split('T')[0];

    const weekWorkouts = workouts.filter(w => w.date >= mondayStr && w.date < nextMondayStr);

    return weekWorkouts.reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
};

export const getStreakCalendarData = async () => {
    const workouts = await getWorkouts();
    const restDays = await getRestDays();
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday

    const calendarData = [];
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(diff + i);
        const dateStr = d.toISOString().split('T')[0];

        let status = 'none';
        const isFuture = d > new Date();
        const isToday = dateStr === today.toISOString().split('T')[0];

        if (isFuture && !isToday) {
            status = 'future';
        } else {
            const hasWorkout = workouts.some(w => w.date === dateStr);
            const isRest = restDays.includes(dateStr);

            if (hasWorkout) status = 'completed';
            else if (isRest) status = 'rest';
            else if (isToday) status = 'today';
        }

        calendarData.push({
            day: days[i],
            date: dateStr,
            status
        });
    }
    return calendarData;
};

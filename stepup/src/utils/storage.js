import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
    WORKOUTS: '@stepup_workouts',
    WEEKLY_GOALS: '@stepup_weekly_goals',
    CUSTOM_TYPES: '@stepup_custom_types',
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

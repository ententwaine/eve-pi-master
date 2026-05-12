const VIRTUAL_PLANNER_KEY = 'eve_pi_master_virtual_planners';
const PI_PLANNER_KEY = 'eve_pi_master_pi_planners';

// VIRTUAL PLANNER STORAGE
export const getSavedVirtualPlanners = () => {
    try {
        const data = localStorage.getItem(VIRTUAL_PLANNER_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to load virtual planners", e);
        return [];
    }
};

export const saveVirtualPlanner = (plannerData) => {
    try {
        const planners = getSavedVirtualPlanners();
        const existingIndex = planners.findIndex(p => p.id === plannerData.id);
        
        if (existingIndex >= 0) {
            planners[existingIndex] = plannerData;
        } else {
            planners.push({
                ...plannerData,
                id: plannerData.id || Date.now().toString()
            });
        }
        
        localStorage.setItem(VIRTUAL_PLANNER_KEY, JSON.stringify(planners));
        return planners;
    } catch (e) {
        console.error("Failed to save virtual planner", e);
        return getSavedVirtualPlanners();
    }
};

// PI PLANNER STORAGE
export const getSavedPiPlanners = () => {
    try {
        const data = localStorage.getItem(PI_PLANNER_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error("Failed to load PI planners", e);
        return [];
    }
};

export const savePiPlanner = (plannerData) => {
    try {
        const planners = getSavedPiPlanners();
        const existingIndex = planners.findIndex(p => p.id === plannerData.id);
        
        if (existingIndex >= 0) {
            planners[existingIndex] = plannerData;
        } else {
            planners.push({
                ...plannerData,
                id: plannerData.id || Date.now().toString()
            });
        }
        
        localStorage.setItem(PI_PLANNER_KEY, JSON.stringify(planners));
        return planners;
    } catch (e) {
        console.error("Failed to save PI planner", e);
        return getSavedPiPlanners();
    }
};

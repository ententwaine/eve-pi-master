import { commodities } from '../../data/pi_data';

/**
 * Calculates the production chain steps for a given commodity and quantity.
 * Returns an array of steps, where each step is an array of required commodities.
 * 
 * Step 0: The target item itself.
 * Step 1: Immediate inputs.
 * Step 2: Inputs for the items in Step 1.
 * ...
 */
export const calculateSchematicChain = (targetId, quantity = 1) => {
    const targetItem = commodities.find(c => c.id === Number(targetId));
    if (!targetItem) return [];

    const steps = [];

    const yieldAmount = targetItem.outputYield || 1;
    const cycles = Math.ceil(Number(quantity) / yieldAmount);
    const producedQty = cycles * yieldAmount;

    // Step 0: The Target
    steps.push([{ ...targetItem, quantity: producedQty }]);

    let currentStepItems = steps[0];

    while (true) {
        const nextStepMap = new Map();
        let hasInputs = false;

        for (const item of currentStepItems) {
            // Find the master record to get schematic inputs
            const masterRecord = commodities.find(c => c.id === item.id);
            if (!masterRecord || !masterRecord.inputs || masterRecord.inputs.length === 0) {
                continue;
            }

            hasInputs = true;

            const yieldAmount = masterRecord.outputYield || 1;
            const cycles = Math.ceil(item.quantity / yieldAmount);
            for (const input of masterRecord.inputs) {
                const totalReq = cycles * input.quantity;

                const existing = nextStepMap.get(input.id) || 0;
                nextStepMap.set(input.id, existing + totalReq);
            }
        }

        if (!hasInputs) break;

        // Convert Map to Array for this step
        const nextStepArray = [];
        for (const [id, qty] of nextStepMap.entries()) {
            const commodity = commodities.find(c => c.id === id);
            if (commodity) {
                nextStepArray.push({
                    ...commodity,
                    quantity: qty
                });
            }
        }

        // Sort by name for consistent display
        nextStepArray.sort((a, b) => a.name.localeCompare(b.name));

        steps.push(nextStepArray);
        currentStepItems = nextStepArray; // Move to next level
    }

    return steps;
};

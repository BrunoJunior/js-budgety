/**
 *
 * @type {{
 * totals: {exp: number, inc: number},
 * items: {exp: Expense[], inc: Income[]},
 * balance: number,
 * percentage: number|undefined,
 * }}
 */
const data = {
    items: {
        exp: [],
        inc: [],
    },
    totals: {
        exp: 0.0,
        inc: 0.0,
    },
    balance: 0.0,
    percentage: undefined,
};

/**
 * @param {number} value
 * @return {number|undefined}
 */
function calculatePct(value) {
    return 0 === data.totals.inc ? undefined : Math.round(value * 100.0 / data.totals.inc);
}

/**
 * Update the balance
 */
function updateBalance() {
    data.balance = data.totals.inc - data.totals.exp;
    data.percentage = calculatePct(data.totals.exp);
}

/**
 * Ancestor Expense or Income
 */
export class Value {
    /**
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @throws Error
     */
    constructor(id, description, value) {
        if ('' === description) {
            throw new Error("Please specify a description!");
        }
        if (isNaN(value) || value <= 0.0) {
            throw new Error("Please specify a valid positive value!");
        }
        this.id = id;
        this.description = description;
        this.value = value;
    }
}

/**
 * Expense class
 */
export class Expense extends Value {
    /**
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @throws Error
     */
    constructor(id, description, value) {
        super(id, description, value);
    }

    /**
     * Calculate and getting the expense percentage
     * @return {number|undefined}
     */
    getPercentage() {
        return calculatePct(this.value);
    }
}

/**
 * Income «class»
 */
export class Income extends Value {
    /**
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @throws Error
     */
    constructor(id, description, value) {
        super(id, description, value);
    }
}

/**
 * The budget controller (static class)
 * @type {{addItem: (function({description: string, type: string, value: string}): Expense|Income), removeItem: BudgetController.removeItem, getBudget: (function(): {balance: number, percentage: (number|undefined), totalInc: number, totalExp: number}), getPercentage: (function(Value): number|undefined), getExpenses: (function(): Expense[])}}
 */
export const BudgetController = {
    /**
     * Adding an item
     * @param {{description: string, type: string, value: string}} input
     * @returns {Expense|Income}
     * @throws Error
     */
    addItem: input => {
        /**
         * The container depends on the data type
         * @var {Value[]}
         */
        const container = data.items[input.type];
        // The ID is the last one in the container + 1
        const id = container.length === 0 ? 1 : container[container.length - 1].id + 1;
        // We transforme the string value into a number one
        const val = parseFloat(input.value);
        // Getting the right object depending of the type
        const newItem = 'exp' === input.type
            ? new Expense(id, input.description, val)
            : new Income(id, input.description, val);
        // Adding the new item into the correct container
        container.push(newItem);
        // Increase the total
        data.totals[input.type] += val;
        updateBalance();
        return newItem;
    },
    /**
     * Remove an item and return it.
     * Return undefined if item wasn't found
     * @param {number} id
     * @param {'exp'|'inc'} type
     * @returns {undefined|Value}
     */
    removeItem: (id, type) => {
        /**
         * @var {Array<Value>}
         */
        const container = data.items[type];
        // Looking for the right element by its id
        for (let i = 0; i < container.length; i++) {
            const element = container[i];
            // Found
            if (id === element.id) {
                // Decrease the total
                data.totals[type] -= element.value;
                updateBalance();
                // Remove the item from the container
                data.items[type] = container.splice(i);
                return element;
            }
        }
        return undefined;
    },
    /**
     * Getting the budget
     * @return {{balance: number, percentage: (number|undefined), totalInc: number, totalExp: number}}
     */
    getBudget: () => ({
            totalInc: data.totals['inc'],
            totalExp: data.totals['exp'],
            balance: data.balance,
            percentage: data.percentage,
        }),
    /**
     * Getting the percentage of an item
     * @param {Value} item
     * @return {number|undefined}
     */
    getPercentage: item => calculatePct(item.value),
    /**
     * Calculate the expenses percentage
     * @return {Array<Expense>}
     */
    getExpenses: ()  => [...data.items.exp],
};

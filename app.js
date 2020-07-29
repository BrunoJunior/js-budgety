/**
 *
 * @type {{}}
 */
const budgetController = (function() {

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
     * Ancestor Expense or Income
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @constructor
     * @throws Error
     */
    function Value(id, description, value) {
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

    /**
     * Expense «class»
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @constructor
     * @throws Error
     */
    function Expense(id, description, value) {
        Value.call(this, id, description, value);
    }

    /**
     * Calculate and getting the expense percentage
     * @return {number|undefined}
     */
    Expense.prototype.getPercentage = function () {
        return calculatePct(this.value);
    }

    /**
     * Income «class»
     * @param {number} id
     * @param {string} description
     * @param {number} value
     * @constructor
     * @throws Error
     */
    function Income(id, description, value) {
        Value.call(this, id, description, value);
    }

    /**
     * Adding an item
     * @param {{description: string, type: string, value: string}} input
     * @returns {Expense|Income}
     * @throws Error
     */
    function addItem(input) {
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
    }

    /**
     * Update the balance
     */
    function updateBalance() {
        data.balance = data.totals.inc - data.totals.exp;
        data.percentage = calculatePct(data.totals.exp);
    }

    /**
     * @param {number} value
     * @return {number|undefined}
     */
    function calculatePct(value) {
        return 0 === data.totals.inc ? undefined : Math.round(value * 100.0 / data.totals.inc);
    }

    /**
     * Remove an item and return it.
     * Return undefined if item wasn't found
     * @param {number} id
     * @param {'exp'|'inc'} type
     * @returns {undefined|Value}
     */
    function removeItem(id, type) {
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
    }

    return {
        /**
         * Adding an item
         * @param {{description: string, type: 'inc'|'exp', value: string}} input
         * @returns {Income|Expense}
         */
        addItem: addItem,
        /**
         * Removing an item
         * @param {number} id
         * @param {'exp'|'inc'} type
         * @returns {undefined|Value}
         */
        removeItem: removeItem,
        /**
         *
         * @return {{balance: number, percentage: (number|undefined), totalInc: number, totalExp: number}}
         */
        getBudget: function () {
            return {
                totalInc: data.totals['inc'],
                totalExp: data.totals['exp'],
                balance: data.balance,
                percentage: data.percentage,
            };
        },
        /**
         * @param item {Value}
         * @return number|undefined
         */
        getPercentage: function (item) {
            return calculatePct(item.value);
        },
        /**
         * Calculate the expenses percentage
         * @return {Array<Expense>}
         */
        getExpenses: function () {
            return [...data.items.exp];
        }
    };
})();

/**
 *
 * @type {{updateBudget: UIController.updateBudget, clearFields: UIController.clearFields, domStrings: {input: {val: string, type: string, desc: string}, containers: {exp: string, inc: string, parent: string}, totals: {balance: string, percentage: string, exp: string, inc: string}, btn: {add: string}}, getInput: (function(): {description: *, type: *, value: *}), addListItem: UIController.addListItem}}
 */
const UIController = (function() {

    const LOCAL_OPTIONS = {minimumIntegerDigits: 1, minimumFractionDigits: 2, maximumFractionDigits: 2};

    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'Novembre', 'December'];

    /**
     * Selectors
     */
    const DOM_STRINGS = {
        title: {
            month: '.budget__title--month',
        },
        input: {
            type: '.add__type',
            desc: '.add__description',
            val: '.add__value',
        },
        btn: {
            add: '.add__btn',
        },
        containers: {
            parent: '.container',
            inc: '.income__list',
            exp: '.expenses__list',
        },
        totals: {
            balance: '.budget__value',
            inc: '.budget__income--value',
            exp: '.budget__expenses--value',
            percentage: '.budget__expenses--percentage',
        }
    };

    /**
     * HTML templates
     * @type {{exp: string, inc: string}}
     */
    const HTML_TEMPLATES = {
        inc: '<div class="item clearfix" id="inc-{{id}}"><div class="item__description">{{desc}}</div><div class="right clearfix"><div class="item__value">+ {{val}}</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>',
        exp: '<div class="item clearfix" id="exp-{{id}}"><div class="item__description">{{desc}}</div><div class="right clearfix"><div class="item__value">- {{val}}</div><div class="item__percentage">{{pct}}%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>',
    };

    /**
     * @param {'balance'|'exp'|'inc'} type
     * @param {number} value
     */
    function refreshTotal(type, value) {
        const sign = value < 0 ? '- ' : '+ ';
        document.querySelector(DOM_STRINGS.totals[type]).textContent = sign + Math.abs(value).toLocaleString(undefined, LOCAL_OPTIONS);
    }

    /**
     * @param {Element} el
     * @param {number|undefined} value
     */
    function displayPercentage(el, value) {
        el.textContent = undefined === value ? '--' : (`${value.toFixed()} %`);
    }

    return {
        /**
         * @returns {{description: string, type: 'inc'|'exp', value: string}}
         */
        getInput: function () {
            const inputSelectors = DOM_STRINGS.input;
            return {
                type: document.querySelector(inputSelectors.type).value, // inc or exp
                description: document.querySelector(inputSelectors.desc).value,
                value: document.querySelector(inputSelectors.val).value,
            };
        },
        /**
         * @type {{
         * input: {val: string, type: string, desc: string},
         * containers: {exp: string, inc: string, parent: string},
         * totals: {balance: string, percentage: string, exp: string, inc: string},
         * btn: {add: string}}}
         */
        domStrings: Object.create(DOM_STRINGS),
        /**
         *
         * @param {Value} item
         * @param {'inc'|'exp'} type
         * @param {number|undefined} percentage
         */
        addListItem: function (item, type, percentage) {
            const newHtml = HTML_TEMPLATES[type].replace('{{id}}', item.id)
                .replace('{{desc}}', item.description)
                .replace('{{val}}', item.value.toLocaleString(undefined, LOCAL_OPTIONS))
                .replace('{{pct}}', undefined !== percentage ? percentage : '--');
            document.querySelector(DOM_STRINGS.containers[type]).insertAdjacentHTML("beforeend", newHtml);
        },
        /**
         * @param budget {{totalInc: number, totalExp: number, balance: number, percentage: number|undefined}}
         */
        updateBudget: function (budget) {
            refreshTotal('balance', budget.balance);
            refreshTotal('exp', -budget.totalExp);
            refreshTotal('inc', budget.totalInc);
            displayPercentage(document.querySelector(DOM_STRINGS.totals.percentage), budget.percentage);
        },
        /**
         * Clear the input fields
         */
        clearFields: function () {
            const fields = document.querySelectorAll([DOM_STRINGS.input.val, DOM_STRINGS.input.desc].join(', '));
            fields.forEach(function (node) {node.value = '';});
            fields.item(0).focus();
        },
        /**
         * @param {Array<Expense>} expenses
         */
        updatePercentages: function (expenses) {
            expenses.forEach(function (exp) {
                displayPercentage(document.querySelector(`#exp-${exp.id} .item__percentage`), exp.getPercentage());
            });
        },
        /**
         * Display the current month of the current year
         */
        displayMonth: function () {
            const now = new Date();
            document.querySelector(DOM_STRINGS.title.month).textContent = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
        },
        /**
         * The input type has changed (switched between expense and income)
         */
        changedType: function () {
            document.querySelectorAll(`${DOM_STRINGS.input.type},${DOM_STRINGS.input.desc},${DOM_STRINGS.input.val}`)
                .forEach(function (el) {el.classList.toggle('red-focus')});
            document.querySelector(DOM_STRINGS.btn.add).classList.toggle('red');
        },
    };
})();

/**
 *
 * @type {{init: controller.init}}
 */
const controller = (function(budgetCtrl, uiCtrl) {

    /**
     * @param {Event} event
     * @return {undefined|{id: number, type: "inc"|"exp", element: Node}}
     */
    function getItem(event) {
        let item = event.target;
        const parent = item.parentNode;
        // User did not click on the delete button => Do nothing
        if (!item.classList.contains('item__delete--btn') && !parent.classList.contains('item__delete--btn')) {
            return undefined;
        }
        // Find the first parent with the «item» class
        while (item) {
            // The element does not have the «item» class: next
            if (!item.classList || !item.classList.contains('item')) {
                item = item.parentNode;
                continue;
            }
            const parts = item.id.split('-');
            return {
                id: parseInt(parts[1], 10),
                type: parts[0],
                element: item,
            };
        }
        return undefined;
    }

    /**
     * Init event listeners
     */
    function setupEventListeners() {
        document.querySelector(uiCtrl.domStrings.btn.add).addEventListener('click', ctrlAddItem);
        document.addEventListener('keydown', function (ev) {
            if (ev.key !== 'Enter') {
                return;
            }
            ctrlAddItem();
        });
        document.querySelector(uiCtrl.domStrings.containers.parent).addEventListener('click', ctrlRemoveItem);
        document.querySelector(uiCtrl.domStrings.input.type).addEventListener('change', uiCtrl.changedType);
    }

    /**
     * Update the UI
     */
    function updateUI() {
        uiCtrl.updateBudget(budgetCtrl.getBudget());
        uiCtrl.updatePercentages(budgetCtrl.getExpenses());
    }

    /**
     * Adding an item from input data
     */
    function ctrlAddItem() {
        // Getting the input
        const input = uiCtrl.getInput();
        try {
            // Create the item
            const newItem = budgetCtrl.addItem(input);
            // Add the item to the correct list
            uiCtrl.addListItem(newItem, input.type, budgetCtrl.getPercentage(newItem));
            uiCtrl.clearFields();
            // Refresh the totals UI
            updateUI();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    /**
     * Remove an item from the list
     * @param {Event} event
     */
    function ctrlRemoveItem(event) {
        const item = getItem(event);
        if (undefined === item) {
            return;
        }
        budgetCtrl.removeItem(item.id, item.type);
        item.element.parentNode.removeChild(item.element);
        updateUI();
    }

    return {
        init: function () {
            uiCtrl.displayMonth();
            updateUI();
            setupEventListeners();
        }
    };
})(budgetController, UIController);

controller.init();

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

/**
 * The UI controller
 * @type {{updatePercentages: UIController.updatePercentages, updateBudget: UIController.updateBudget, changedType: UIController.changedType, clearFields: UIController.clearFields, displayMonth: UIController.displayMonth, domStrings: {input: {val: string, type: string, desc: string}, containers: {exp: string, inc: string, parent: string}, totals: {balance: string, percentage: string, exp: string, inc: string}, btn: {add: string}}, getInput: (function(): {description: *, type: *, value: *}), addListItem: UIController.addListItem}}
 */
export const UIController = {
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

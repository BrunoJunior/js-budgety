import {BudgetController} from "./budget.js";
import {UIController} from "./ui.js";

/**
 * @param event
 * @return {undefined|{id: number, type: string, element: string | Element | EventTarget | Node | SVGAnimatedString | HTMLElement}}
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
    document.querySelector(UIController.domStrings.btn.add).addEventListener('click', ctrlAddItem);
    document.addEventListener('keydown', ev => {
        if (ev.key !== 'Enter') {
            return;
        }
        ctrlAddItem();
    });
    document.querySelector(UIController.domStrings.containers.parent).addEventListener('click', ctrlRemoveItem);
    document.querySelector(UIController.domStrings.input.type).addEventListener('change', UIController.changedType);
}

/**
 * Update the UI
 */
function updateUI() {
    UIController.updateBudget(BudgetController.getBudget());
    UIController.updatePercentages(BudgetController.getExpenses());
}

/**
 * Adding an item from input data
 */
function ctrlAddItem() {
    // Getting the input
    const input = UIController.getInput();
    try {
        // Create the item
        const newItem = BudgetController.addItem(input);
        // Add the item to the correct list
        UIController.addListItem(newItem, input.type, BudgetController.getPercentage(newItem));
        UIController.clearFields();
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
    BudgetController.removeItem(item.id, item.type);
    item.element.parentNode.removeChild(item.element);
    updateUI();
}

export const Controller = {
    init: () => {
        UIController.displayMonth();
        updateUI();
        setupEventListeners();
    }
}

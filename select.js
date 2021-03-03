export default class Select {
    constructor(element) {
        this.element = element;
        this.options = getFormattedOptions(element.querySelectorAll('option'))
        this.customElement = document.createElement('div')
        this.labelElement = document.createElement('span')
        this.optionsCustomElement = document.createElement('ul')
        setupCustomElement(this)
        // Hide the original select element by default
        element.style.display = "none"
        element.after(this.customElement)
    }
    // Getter for returning selected options
    get selectedOption() {
        return this.options.find(option => option.selected)
    }
    // Getter for getting selected option index
    get selectedOptionIndex() {
        return this.options.indexOf(this.selectedOption)
    }

    selectValue(value) {
        const newSelectedOption = this.options.find(option => {
            return option.value === value
        })
        const prevSelectedOption = this.selectedOption
        prevSelectedOption.selected = false
        prevSelectedOption.element.selected = false

        newSelectedOption.selected = true
        newSelectedOption.element.selected = true
        this.labelElement.innerText = newSelectedOption.label
        // Highlight current selected value for the up arrow
        this.optionsCustomElement.querySelector(`[data-value = "${prevSelectedOption.value}"]`)
            .classList.remove('selected')

        const newCustomElement = this.optionsCustomElement.querySelector(`[data-value = "${newSelectedOption.value}"]`)
        newCustomElement.classList.add('selected')
        newCustomElement.scrollIntoView({ block: "nearest" })
    }
}
// Setuo custom element for adding classes, appending the value, etc...
function setupCustomElement(select) {
    // Add class for the custom div(container element)
    select.customElement.classList.add('custom-select-container')
    // Add tab index so that it can be focused
    select.customElement.tabIndex = 0
    // Add class for the custom span (label element)
    select.labelElement.classList.add('custom-select-value')
    // Set value for the custom span element
    select.labelElement.innerText = select.selectedOption.label
    // Append the lebel element to custom div element
    select.customElement.append(select.labelElement)
    // Add the class 'custom-select-options' to the custom ul element
    select.optionsCustomElement.classList.add('custom-select-options')
    // create and append the li to the custom ul element
    select.options.forEach(option => {
        // Create a custom li element
        const optionElement = document.createElement('li')
        // Add class for the custom li created
        optionElement.classList.add('custom-select-option')
        // Toggle the selected class in the li element based on the object obtained from the select HTML element in DOM
        optionElement.classList.toggle('selected', option.selected)
        // Set inner text for the li element form the object obtained from select HTML in DOM
        optionElement.innerText = option.label
        // Set data attribute value for the li element form the object obtained from select HTML in DOM
        optionElement.dataset.value = option.value
        // Add/Remove class show/selected from the dropdown list
        optionElement.addEventListener('click', () => {
            select.selectValue(option.value)
            select.optionsCustomElement.classList.remove('show')
        })
        // Append the options custom element to custom element div
        select.optionsCustomElement.append(optionElement)
    })
    // Append the options element created to the custom div element
    select.customElement.append(select.optionsCustomElement)

    // Toggle the dropdown options while clicking
    select.labelElement.addEventListener('click', () => {
        select.optionsCustomElement.classList.toggle('show')
    })

    // Close the list while clicking outside of the select container
    select.customElement.addEventListener('blur', () => {
        select.optionsCustomElement.classList.remove('show')
    })
    // Variable for debounce timeout
    let debounceTimeout
    let searchTerm = ""
    // For keyboard navigation
    select.customElement.addEventListener('keydown', e => {
        switch (e.code) {
            case "Space": 
                select.optionsCustomElement.classList.toggle('show')
                break
            
            case "ArrowUp": {
                const prevOption = select.options[select.selectedOptionIndex - 1]
                if (prevOption) select.selectValue(prevOption.value)
                break
            }

            case "ArrowDown": {
                const nextOption = select.options[select.selectedOptionIndex + 1]
                if (nextOption) select.selectValue(nextOption.value)
                break
            }

            case "Enter":
            case "Escape":
                select.optionsCustomElement.classList.remove("show")
                break

            default: {
                clearTimeout(debounceTimeout)
                searchTerm += e.key
                debounceTimeout = setTimeout(() => {
                    searchTerm = ""
                }, 500)

                const searchedOption = select.options.find(option => {
                    return option.label.toLowerCase().startsWith(searchTerm)
                })
                if (searchedOption) select.selectValue(searchedOption.value)
            }
        }
    })
}
// Get options object from the select element in the HTML
function getFormattedOptions(optionElements) {
    return [...optionElements].map(optionElement => {
        return {
            value: optionElement.value,
            label: optionElement.label,
            selected: optionElement.selected,
            element: optionElement
        }
    })
}
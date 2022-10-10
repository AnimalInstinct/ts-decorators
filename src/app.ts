function Logger(message: string) {
    console.log('Logger factory')
    return function (_: Function) {
        console.log(message)
    }
}

// Running logic during class declaration

// function WithTemplate(template: string, hookId: string) {
//     console.log('Template factory')
//     return function (constructor: any) {
//         console.log('Rendering template...')
//         const hookEl = document.querySelector(hookId)
//         const p = new constructor()
//         p.header = "Good morning!"
//         if (hookEl) {
//             hookEl.innerHTML = template
//             hookEl.querySelector('h1')!.textContent = p.header
//         }
//     }
// }

// Running logic during class instantiation

function WithTemplate(template: string, hookId: string) {
    console.log('TEMPLATE FACTORY')
    return function <T extends { new(...args: any[]): { header: string } }>(
        originalConstructor: T
    ) {
        // The new class returned extends the original class, and adds a new logic
        return class extends originalConstructor {
            constructor(..._: any[]) {
                super()
                console.log('Rendering template')
                const hookEl = document.getElementById(hookId)
                if (hookEl) {
                    hookEl.innerHTML = template
                    hookEl.querySelector('h1')!.textContent = this.header
                }
            }
        }
    }
}

@WithTemplate(`<main><h1><h1><main>`, '#app')
@Logger('Some log')

class Page {
    private _header: string = ""
    // private _content: string = ""

    constructor() {
        console.log('Creating page object...')
    }

    set header(text: string) {
        if (typeof text !== 'string') {
            return
        }

        this._header = text
    }

    get header() {
        return this._header
    }
}

const page = new Page()

//------------------------------------------------------------------


function Log(target: any, propertyName: string | Symbol) {
    console.log('Property decorator::target::', target)
    console.log('Property decorator::property::', propertyName)
}

function Log2(target: any, name: string, descriptor: PropertyDescriptor) {
    console.log('Accessor decorator::target', target)
    console.log('Accessor decorator::name', name)
    console.log('Accessor decorator::descriptor', descriptor)
}

function Log3(
    target: any,
    name: string | Symbol,
    descriptor: PropertyDescriptor
) {
    console.log('Method decorator::target', target)
    console.log('Method decorator::name', name)
    console.log('Method decorator::descriptor', descriptor)
}

function Log4(target: any, name: string | Symbol, position: number) {
    console.log('Parameter decorator::target', target)
    console.log('Parameter decorator::name', name)
    console.log('Parameter decorator::position', position)
}

class Product {
    @Log
    title: string
    private _price: number

    @Log2
    set price(val: number) {
        if (val > 0) {
            this._price = val
        } else {
            throw new Error('Invalid price - should be positive!')
        }
    }

    get price() {
        return this._price
    }

    constructor(t: string, p: number) {
        this.title = t
        this._price = p
    }

    @Log3
    getPriceWithTax(@Log4 tax: number) {
        return this._price * (1 + tax)
    }
}


function Autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    console.log('Autobind::Descriptior::', descriptor)
    console.log('Autobind::Original method::', originalMethod)
    const adjDescriptor: PropertyDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            console.log('Autobind::get() executed::')

            const boundFn = originalMethod.bind(this)
            return boundFn
        }
    }
    console.log('Autobind::Adjusted descriptor::', adjDescriptor)
    return adjDescriptor
}

class Printer {
    message = 'This works!';

    @Autobind
    showMessage() {
        console.log(this.message)
    }
}

const p = new Printer()

console.log(p.showMessage())

const button = document.querySelector('button')
button && button.addEventListener('click', p.showMessage)


// ---

interface ValidatorConfig {
    [property: string]: {
        [validatableProp: string]: string[] // ['required', 'positive']
    }
}

const registeredValidators: ValidatorConfig = {}

console.log('Validator::Init::registered validators::', registeredValidators)

function Required(target: any, propName: string) {
    console.log('Validator::Init::Required::target', target)
    console.log('Validator::Init::Required::propName', propName)
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['required']
    }
    console.log('Validator::Init::registered validators::', registeredValidators)
}

function PositiveNumber(target: any, propName: string) {
    console.log('Validator::Init::Positive number::target', target)
    console.log('Validator::Init::Positive number::propName', propName)
    registeredValidators[target.constructor.name] = {
        ...registeredValidators[target.constructor.name],
        [propName]: ['positive']
    }
    console.log('Validator::Init::registered validators::', registeredValidators)
}

function validate(obj: any) {
    const objValidatorConfig = registeredValidators[obj.constructor.name]
    console.log('Validator::validate::objetc', obj)
    console.log('Validator::validate::config', objValidatorConfig)
    if (!objValidatorConfig) {
        return true
    }
    let isValid = true
    for (const prop in objValidatorConfig) {
        for (const validator of objValidatorConfig[prop]) {
            switch (validator) {
                case 'required':
                    isValid = isValid && !!obj[prop]
                    break
                case 'positive':
                    isValid = isValid && obj[prop] > 0
                    break
            }
        }
    }
    return isValid
}

class Course {
    @Required
    title: string
    @PositiveNumber
    price: number

    constructor(t: string, p: number) {
        this.title = t
        this.price = p
    }
}

const courseForm = document.querySelector('form')!
courseForm && courseForm.addEventListener('submit', event => {
    event.preventDefault()
    const titleEl = document.getElementById('title') as HTMLInputElement
    const priceEl = document.getElementById('price') as HTMLInputElement

    const title = titleEl.value
    const price = +priceEl.value

    const createdCourse = new Course(title, price)

    console.log('CourseForm::New course created::', createdCourse)

    if (!validate(createdCourse)) {
        alert('Invalid input, please try again!')
        return
    }
    console.log(createdCourse)
})
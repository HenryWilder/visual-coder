const catelog = document.getElementById('catelog');
const editor = document.getElementById('editor');

let selectedElement = null;
const selectElement = (element) => {
    if (selectedElement) {
        selectedElement.classList.remove('selected');
    }
    selectedElement = element;
    if (selectedElement) { // Might be null
        selectedElement.classList.add('selected');
    }
}

const socketShapes = {
    /* Inline sockets */
    'expression': 'span',
    'type': 'span',
    /* Block sockets */
    'statement': 'div',
    'class-body': 'div',
    'function-body': 'div',
};

const snippets = [
    {
        buttonText: [{ syntax:'flow-control', text:'if' }],
        shape: 'statement',
        element: [
            { what: 'text', syntax: 'flow-control', text: 'if ' },
            { what: 'socket', shape: 'expression' },
            { what: 'socket', shape: 'statement' },
        ]
    },
    {
        buttonText: [{ syntax:'flow-control', text:'if else' }],
        shape: 'statement',
        element: [
            { what: 'text', syntax: 'flow-control', text: 'if ' },
            { what: 'socket', shape: 'expression' },
            { what: 'socket', shape: 'statement' },
            { what: 'text', syntax: 'flow-control', text: 'else' },
            { what: 'socket', shape: 'statement' },
        ]
    },
];

class NestingSocket extends HTMLElement {
    shape = 'socket';

    constructor() {
        super();
        this.shape = this.getAttribute('data-shape');
        if (!this.shape)
            this.shape = 'undefined';
        this.addEventListener('click', () => { selectElement(this); });
    }

    add(snippet) {
        if (snippet.shape === this.shape) {
            this.appendChild(snippet);
        } else {
            throw new Error(`Cannot add a ${snippet.shape} to a ${this.shape}`);
        }
    }

    clear() {
        this.innerHTML = `<span class="placeholder">${this.shape}</span>`;
    }
}
window.customElements.define('nesting-socket', NestingSocket);

const createSocket = (shape) => {
    const socket = document.createElement('nesting-socket');
    socket.setAttribute('data-shape', shape);
    socket.clear();
    return socket;
};

const createSnippet = (snippet) => {
    const snippetElement = document.createElement(socketShapes[snippet.shape]);
    for (const word of snippet.element) {
        switch (word.what) {
            case 'text': {
                const wordElement = document.createElement('span');
                wordElement.classList.add(`syntax-${word.syntax}`);
                wordElement.innerText = word.text;
                snippetElement.appendChild(wordElement);
            } break;
            
            case 'socket': {
                snippetElement.appendChild(createSocket(word.shape));
            } break;
            
            default:
                throw new Error(`Unknown element type ${word.what}`);
        }
    }
    return snippetElement;
}

const createSnippetButton = (snippet) => {
    const snippetButton = document.createElement('button');
    snippetButton.classList.add('snippet-button');
    for (const word of snippet.buttonText) {
        const wordElement = document.createElement('span');
        wordElement.classList.add(`syntax-${word.syntax}`);
        wordElement.innerText = word.text;
        snippetButton.appendChild(wordElement);
    }
    snippetButton.addEventListener('click', () => {
        editor.appendChild(createSnippet(snippet));
    });
    return snippetButton;
}

for (const snippet of snippets) {
    catelog.appendChild(createSnippetButton(snippet));
}

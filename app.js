const catelog = document.getElementById('catelog');
const editor = document.getElementById('editor');

const socketShapes = {
    /* Inline sockets */
    'expression': {
        tag:'span',
        accepts: ['variable', 'literal', 'keyword']
    },
    'type': {
        tag:'span',
        accepts: []
    },
    'keyword': {
        tag:'span',
        accepts: []
    },
    'literal': {
        tag:'span',
        accepts: []
    },
    'variable': {
        tag:'span',
        accepts: []
    },
    /* Block sockets */
    'statement': {
        tag:'div',
        accepts: ['variable', 'literal', 'keyword', 'function', 'class', 'object', 'array']
    },
    'object': {
        tag:'div',
        accepts: []
    },
    'array': {
        tag:'div',
        accepts: []
    },
    'class': {
        tag:'div',
        accepts: []
    },
    'function': {
        tag:'div',
        accepts: []
    },
};

class NestingSocket extends HTMLElement {
    static selected = null;

    constructor() {
        super();
        this.addEventListener('click', (event) => {
            if (event.target === this)
                this.select();
        });
    }

    initialize(shape) {
        this.setAttribute('data-shape', shape);
        this.shape = shape;
        this.clear();
    }

    /**
     * 
     * @param {HTMLElement} snippetElement 
     */
    add(snippetElement) {
        const snippetShape = Array.from(snippetElement.classList).find(x => x !== 'snippet');
        if (snippetShape === this.shape) {
            this.appendChild(snippetElement);
            if (this.firstChild.classList.contains('placeholder')) {
                this.children[0].remove();
            }
        } else {
            throw new Error(`Cannot add a ${snippetShape} to a ${this.shape}`);
        }
    }

    clear() {
        this.innerHTML = '';
        const placeholder = document.createElement('span');
        placeholder.classList.add('placeholder');
        placeholder.innerText = this.shape;
        this.appendChild(placeholder);
    }

    deselect() {
        this.classList.remove('selected');
        NestingSocket.selected = null;
    }

    select() {
        NestingSocket.selected?.deselect();
        NestingSocket.selected = this;
        this.classList.add('selected');
    }
}
customElements.define('nesting-socket', NestingSocket);

editor.addEventListener('click', (event) => {
    if (event.target === editor)
        NestingSocket.selected?.deselect();
});

const createSocket = (shape) => {
    const socket = document.createElement('nesting-socket');
    socket.initialize(shape);
    return socket;
};

const createSnippetOptions = (snippet) => {
    const snippetOptions = document.createElement('div');
    snippetOptions.classList.add('snippet-options');
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('snippet-delete');
    deleteButton.type = 'button';
    deleteButton.innerText = 'x';
    deleteButton.addEventListener('click', () => {
        const parentSocket = snippetOptions.parentElement.parentElement;
        NestingSocket.selected?.deselect();
        if (parentSocket !== editor && parentSocket.children.length === 1) {
            parentSocket.clear();
        } else {
            snippetOptions.parentElement.remove();
        }
    });
    snippetOptions.appendChild(deleteButton);
    return snippetOptions;
};

const createSnippet = (snippet) => {
    const tag = socketShapes[snippet.shape].tag;
    const snippetElement = document.createElement(tag);
    snippetElement.classList.add('snippet', snippet.shape);
    const snippetContent = document.createElement(tag);
    snippetElement.appendChild(snippetContent);
    for (const word of snippet.element) {
        switch (word.what) {
            case 'text': {
                const wordElement = document.createElement('span');
                wordElement.classList.add(`syntax-${word.syntax}`);
                wordElement.innerText = word.text;
                snippetContent.appendChild(wordElement);
            } break;

            case 'socket': {
                snippetContent.appendChild(createSocket(word.shape));
            } break;

            default:
                throw new Error(`Unknown element type ${word.what}`);
        }
    }
    snippetElement.appendChild(createSnippetOptions(snippet));
    return snippetElement;
};

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
        const snippetElement = createSnippet(snippet);
        if (!!NestingSocket.selected) {
            NestingSocket.selected.add(snippetElement);
        } else {
            editor.appendChild(snippetElement);
        }
    });
    return snippetButton;
}

let snippets = [];
async function loadSnippets() {
    const response = await fetch('snippets.json');
    snippets = await response.json();
    console.log(snippets);
    for (const snippet of snippets) {
        catelog.appendChild(createSnippetButton(snippet));
    }
    
}
loadSnippets();

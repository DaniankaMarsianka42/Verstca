const inputField = document.getElementById('inputField');
const parseBtn = document.getElementById('parseBtn');
const elementsContainer = document.getElementById('elementsContainer');
const dropZone = document.getElementById('dropZone');
const displayArea = document.getElementById('displayArea');

let dropColor = null;
let clickedValues = [];

const getRandomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

// "Разобрать"
parseBtn.addEventListener('click', () => {
    const parts = inputField.value.trim().split(/[-–]/).map(p => p.trim()).filter(Boolean);
    
    const aWords = parts.filter(p => !isNaN(p) ? false : p[0] === p[0].toLowerCase()).sort((x,y) => x.localeCompare(y, 'ru'));
    const bWords = parts.filter(p => !isNaN(p) ? false : p[0] === p[0].toUpperCase()).sort((x,y) => x.localeCompare(y, 'ru'));
    const numbers = parts.filter(p => !isNaN(p)).map(Number).sort((x,y) => x - y);
    
    elementsContainer.innerHTML = '';
    dropZone.innerHTML = '';
    dropColor = null;
    clickedValues = [];
    displayArea.innerHTML = '<span class="hint">Нажмите на элемент в синем блоке</span>';
    
    let idx = 0;
    aWords.forEach((word, i) => {
        const key = `a${i+1}`;
        createElement(key, word, idx++);
    });
    bWords.forEach((word, i) => {
        const key = `b${i+1}`;
        createElement(key, word, idx++);
    });
    numbers.forEach((num, i) => {
        const key = `n${i+1}`;
        createElement(key, num, idx++);
    });
});

function createElement(key, value, globalIdx) {
    const el = document.createElement('div');
    el.className = 'element';
    el.draggable = true;
    el.textContent = `${key} ${value}`;
    el.dataset.key = key;
    el.dataset.value = value;
    el.dataset.originalColor = getRandomColor();
    el.style.background = el.dataset.originalColor;
    
    el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('key', key);
        e.dataTransfer.setData('value', value);
        e.dataTransfer.setData('originalColor', el.dataset.originalColor);
        e.target.classList.add('dragging');
    });
    el.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    
    elementsContainer.appendChild(el);
}

dropZone.addEventListener('dragover', e => { 
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move'; 
    dropZone.classList.add('drag-over'); 
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    
    const key = e.dataTransfer.getData('key');
    const value = e.dataTransfer.getData('value');
    const originalColor = e.dataTransfer.getData('originalColor');
    
    const dragged = [...elementsContainer.children].find(el => el.dataset.key === key);
    if (dragged) dragged.remove();
    
    if (!dropColor) dropColor = getRandomColor();
    
    const el = document.createElement('div');
    el.className = 'element';
    el.draggable = true;
    el.textContent = `${key} ${value}`;
    el.dataset.key = key;
    el.dataset.value = value;
    el.style.background = dropColor;
    el.style.position = 'absolute';
    const rect = dropZone.getBoundingClientRect();
    el.style.left = Math.max(0, e.clientX - rect.left - 25) + 'px';
    el.style.top = Math.max(0, e.clientY - rect.top - 15) + 'px';
    
    el.addEventListener('click', () => {
        clickedValues.push(value);
        displayArea.textContent = clickedValues.join(' '); 
    });
    
    el.addEventListener('dragstart', e => {
        e.dataTransfer.setData('key', key);
        e.dataTransfer.setData('value', value);
        e.dataTransfer.setData('originalColor', originalColor);
        e.target.classList.add('dragging');
    });
    el.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    
    dropZone.appendChild(el);
    
    [...dropZone.children].forEach(child => {
        if (child.classList.contains('element')) child.style.background = dropColor;
    });
});

elementsContainer.addEventListener('dragover', e => { 
    e.preventDefault(); 
    e.dataTransfer.dropEffect = 'move'; 
});
elementsContainer.addEventListener('drop', e => {
    e.preventDefault();
    
    const key = e.dataTransfer.getData('key');
    const value = e.dataTransfer.getData('value');
    const originalColor = e.dataTransfer.getData('originalColor');
    
    const dragged = [...dropZone.children].find(el => el.dataset.key === key);
    if (dragged) dragged.remove();
    
    const els = [...elementsContainer.children];
    const newEl = document.createElement('div');
    newEl.className = 'element';
    newEl.draggable = true;
    newEl.textContent = `${key} ${value}`;
    newEl.dataset.key = key;
    newEl.dataset.value = value;
    newEl.dataset.originalColor = originalColor;
    newEl.style.background = originalColor;
    
    newEl.addEventListener('dragstart', e => {
        e.dataTransfer.setData('key', key);
        e.dataTransfer.setData('value', value);
        e.dataTransfer.setData('originalColor', originalColor);
        e.target.classList.add('dragging');
    });
    newEl.addEventListener('dragend', e => e.target.classList.remove('dragging'));
    
    els.push(newEl);
    els.sort((a,b) => {
        const typeA = a.dataset.key[0], typeB = b.dataset.key[0];
        if (typeA !== typeB) return typeA.localeCompare(typeB);
        return parseInt(a.dataset.key.slice(1)) - parseInt(b.dataset.key.slice(1));
    }).forEach(el => elementsContainer.appendChild(el));
    
    if (!dropZone.children.length) {
        clickedValues = [];
        displayArea.innerHTML = '<span class="hint">Нажмите на элемент в синем блоке</span>';
    }
});

window.addEventListener('load', () => {
    inputField.value = 'лес - бочка - 20 – бык - крик - 3 -Бок';
});

document.getElementById('generateBtn').addEventListener('click', generateSquares);

function generateSquares() {
    const count = parseInt(document.getElementById('count').value);
    const container = document.getElementById('squares');
    
    if (isNaN(count) || count <= 0 || count > 50) {
        alert('Введите число от 1 до 50!');
        return;
    }
    
    container.innerHTML = ''; // Очищаем предыдущие квадраты
    
    for (let i = 1; i <= count; i++) {
        const square = document.createElement('div');
        square.className = `square ${i % 2 === 0 ? 'even' : 'odd'}`;
        container.appendChild(square);
    }
}

// Дополнительно: Enter в поле ввода
document.getElementById('count').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateSquares();
    }
});

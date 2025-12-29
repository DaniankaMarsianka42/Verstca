(function () {
    let proceed = confirm("Приступаем?");
    let main = document.getElementById('main');

    if (!proceed) {
        main.innerHTML = "<h2>Ходите босиком.</h2>";
        return;
    }

    main.innerHTML = `
        <h2>Расчет длины каблука</h2>
        <input type="text" id="footLen" placeholder="Длина стопы (см)">
        <br>
        <label><input type="radio" name="gender" value="male"> Мужской</label>
        <label><input type="radio" name="gender" value="female"> Женский</label>
        <br>
        <button id="calcBtn">Рассчитать</button>
        <div id="result"></div>
    `;

    document.getElementById("calcBtn").onclick = function () {
        let footLen = parseFloat(document.getElementById("footLen").value);
        let gender = document.querySelector('input[name="gender"]:checked');
        let resDiv = document.getElementById("result");
        resDiv.innerHTML = "";

        if (!gender || isNaN(footLen) || footLen <= 0) {
            resDiv.innerText = "Пожалуйста, введите корректную длину стопы и выберите пол.";
            return;
        }

        if (gender.value === "male") {
            resDiv.innerHTML = "Высота каблука 1 см.<br><img src='boot2.png' alt='Мужской ботинок'>";
        } else {
            let heel = (footLen / 7).toFixed(2);
            resDiv.innerHTML = `Высота каблука ${heel} см.<br>`;
            if (heel > 5) {
                resDiv.innerHTML += "<img src='boot3.png' alt='Высокий каблук'>";
            } else {
                resDiv.innerHTML += "<img src='boot1.png' alt='Маленький каблук'>";
            }
        }
    };
})();

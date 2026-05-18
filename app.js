let basePrice = 239; // Základní cena pizzy
        let currentPrice = basePrice;
        const priceDisplay = document.getElementById('totalPriceDisplay');

        function toggleIng(element, price) {
            // Přepne třídu 'selected' pro žlutý/šedý background a změnu textu
            element.classList.toggle('selected');
            const icon = element.querySelector('i');

            if (element.classList.contains('selected')) {
                // Přidáno
                currentPrice += price;
                icon.classList.remove('ph-plus');
                icon.classList.add('ph-trash'); // Změní ikonu na koš
            } else {
                // Odebráno
                currentPrice -= price;
                icon.classList.remove('ph-trash');
                icon.classList.add('ph-plus'); // Vrátí plusko
            }

            // Aktualizuje text ceny na obrazovce
            priceDisplay.innerText = currentPrice + ',-';
        }
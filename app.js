let basePrice = 181;
let currentPrice = basePrice;

// Funkce pro detail.html (Ingredience)
function toggleIng(element, price) {
    const priceDisplay = document.getElementById('totalPriceDisplay');
    if (!priceDisplay) return; // Pokud nejsme na detailu, nic nedělej

    element.classList.toggle('selected');
    const icon = element.querySelector('i');

    if (element.classList.contains('selected')) {
        currentPrice += price;
        icon.classList.remove('ph-plus');
        icon.classList.add('ph-trash');
    } else {
        currentPrice -= price;
        icon.classList.remove('ph-trash');
        icon.classList.add('ph-plus');
    }
    priceDisplay.innerText = currentPrice + ',-';
}

// Funkce pro kosik.html (Změna počtu)
function updateQty(btn, change) {
    const qtySpan = btn.parentElement.querySelector('.qty-number');
    if (!qtySpan) return;

    let currentQty = parseInt(qtySpan.innerText);
    let newQty = currentQty + change;

    if (newQty >= 1) {
        qtySpan.innerText = newQty;
    }
}

// Funkce pro kosik.html (Smazání položky)
function removeItem(btn) {
    const item = btn.closest('.cart-item');
    if (!item) return;

    item.style.opacity = '0';
    item.style.transform = 'translateX(20px)';
    setTimeout(() => {
        item.remove();
    }, 300); 
}

// Funkce pro kosik.html (Slevový kód)
function togglePromo() {
    const promoWrapper = document.getElementById('promoWrapper');
    if (promoWrapper) {
        promoWrapper.classList.toggle('active');
    }
}
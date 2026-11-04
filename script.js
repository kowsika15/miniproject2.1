// Digital Library Script

// Page load message
document.addEventListener("DOMContentLoaded", function () {

    console.log("Digital Library loaded successfully!");

    // Get Started button
    const getStarted = document.querySelector(".get-started");

    if (getStarted) {
        getStarted.addEventListener("click", function () {
            console.log("Opening Login Page...");
        });
    }


    // Book cards
    const bookCards = document.querySelectorAll(".book-card");

    bookCards.forEach(function (card) {

        card.addEventListener("click", function () {

            const bookTitle = card.querySelector("h3").innerText;

            alert("You selected: " + bookTitle);

        });

    });

});
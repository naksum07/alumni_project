//Mobile 
        const menuBtn =
            document.getElementById("menuBtn");

        const mobileMenu =
            document.getElementById("mobileMenu");

        const menuIcon =
            document.getElementById("menuIcon");


        menuBtn.addEventListener(
            "click",
            function () {

                mobileMenu.classList.toggle(
                    "hidden"
                );


                if (
                    mobileMenu.classList.contains(
                        "hidden"
                    )
                ) {

                    menuIcon.classList.remove(
                        "fa-xmark"
                    );

                    menuIcon.classList.add(
                        "fa-bars"
                    );

                } else {

                    menuIcon.classList.remove(
                        "fa-bars"
                    );

                    menuIcon.classList.add(
                        "fa-xmark"
                    );

                }

            }
        );


        /* =================================================
           CLOSE MOBILE MENU AFTER CLICK
        ================================================= */

        document
            .querySelectorAll(".mobile-link")
            .forEach(function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mobileMenu.classList.add(
                            "hidden"
                        );

                        menuIcon.classList.remove(
                            "fa-xmark"
                        );

                        menuIcon.classList.add(
                            "fa-bars"
                        );

                    }
                );

            });


        /* =================================================
           STAR RATING
        ================================================= */

        const stars =
            document.querySelectorAll(
                ".star"
            );

        const ratingInput =
            document.getElementById(
                "rating"
            );

        const ratingText =
            document.getElementById(
                "ratingText"
            );


        const ratingMessages = {

            1: "Poor",

            2: "Needs Improvement",

            3: "Good",

            4: "Very Good",

            5: "Excellent"

        };


        stars.forEach(function (star) {

            star.addEventListener(
                "click",
                function () {

                    const selectedRating =
                        Number(
                            this.dataset.rating
                        );


                    ratingInput.value =
                        selectedRating;


                    stars.forEach(
                        function (
                            currentStar,
                            index
                        ) {

                            if (
                                index <
                                selectedRating
                            ) {

                                currentStar.classList
                                    .remove(
                                        "text-gray-300"
                                    );

                                currentStar.classList
                                    .add(
                                        "text-yellow-400"
                                    );

                            } else {

                                currentStar.classList
                                    .remove(
                                        "text-yellow-400"
                                    );

                                currentStar.classList
                                    .add(
                                        "text-gray-300"
                                    );

                            }

                        }
                    );


                    ratingText.textContent =
                        selectedRating +
                        " / 5 — " +
                        ratingMessages[
                            selectedRating
                        ];

                    ratingText.classList
                        .remove(
                            "text-gray-500"
                        );

                    ratingText.classList
                        .add(
                            "text-yellow-600",
                            "font-medium"
                        );

                }
            );


            /* Hover effect */

            star.addEventListener(
                "mouseenter",
                function () {

                    const hoverRating =
                        Number(
                            this.dataset.rating
                        );


                    stars.forEach(
                        function (
                            currentStar,
                            index
                        ) {

                            if (
                                index <
                                hoverRating
                            ) {

                                currentStar.classList
                                    .add(
                                        "text-yellow-400"
                                    );

                            } else {

                                if (
                                    Number(
                                        ratingInput.value
                                    ) <= index
                                ) {

                                    currentStar.classList
                                        .remove(
                                            "text-yellow-400"
                                        );

                                }

                            }

                        }
                    );

                }
            );

        });

        const feedback =
            document.getElementById(
                "feedback"
            );
        const charCount =
            document.getElementById(
                "charCount"
            );
        feedback.setAttribute(
            "maxlength",
            "500"
        );
        feedback.addEventListener(
            "input",
            function () {
                const length =
                    feedback.value.length;
                charCount.textContent =
                    length + " / 500";
                if (length >= 450) {
                    charCount.classList
                    .remove(
                        "text-gray-400"
                    );
                    charCount.classList
                    .add(
                        "text-orange-500"
                    );
                }else{
                    charCount.classList
                    .remove(
                        "text-orange-500"
                    );
                    charCount.classList
                    .add(
                        "text-gray-400"
                        );
                    }
            }
        );

        const feedbackForm =
            document.getElementById(
                "feedbackForm"
            );
        const successModal =
            document.getElementById(
                "successModal"
            );

        feedbackForm.addEventListener(
            "submit",
            async function (event) {
                event.preventDefault();

                /* Require rating */
                if (
                    ratingInput.value === ""
                ) {
                    ratingText.textContent =
                        "Please select a rating before submitting.";
                    ratingText.classList
                        .remove(
                            "text-gray-500"
                        );
                    ratingText.classList
                        .add(
                            "text-red-600",
                            "font-semibold"
                        );
                    return;
                }

                /* Call the backend API */
                try {
                    const token = localStorage.getItem('token');
                    const headers = { 'Content-Type': 'application/json' };
                    if (token) headers['Authorization'] = `Bearer ${token}`;

                    const res = await fetch('/api/feedback', {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            rating: Number(ratingInput.value),
                            message: feedback.value
                        }),
                    });

                    if (!res.ok) {
                        const data = await res.json();
                        ratingText.textContent = data.message || 'Submission failed. Please try again.';
                        ratingText.classList.remove('text-gray-500');
                        ratingText.classList.add('text-red-600', 'font-semibold');
                        return;
                    }
                } catch (err) {
                    console.error('Feedback error:', err);
                    ratingText.textContent = 'Could not reach the server. Please try again later.';
                    ratingText.classList.remove('text-gray-500');
                    ratingText.classList.add('text-red-600', 'font-semibold');
                    return;
                }

                /* Show success modal */
                successModal.classList.remove(
                    "hidden"
                );
                successModal.classList.add(
                    "flex"
                );
                document.body.style.overflow ="hidden";
                /* Reset form */

                feedbackForm.reset();
                ratingInput.value ="";

                stars.forEach(
                    function (star) {

                        star.classList
                            .remove(
                                "text-yellow-400"
                            );

                        star.classList
                            .add(
                                "text-gray-300"
                            );

                    }
                );


                ratingText.textContent =
                    "Please select a rating.";

                ratingText.classList
                    .remove(
                        "text-yellow-600",
                        "text-red-600",
                        "font-medium",
                        "font-semibold"
                    );

                ratingText.classList
                    .add(
                        "text-gray-500"
                    );


                charCount.textContent =
                    "0 / 500";

            }
        );


        function closeSuccessModal() {
            successModal.classList.add(
                "hidden"
            );
            successModal.classList.remove(
                "flex"
            );
            document.body.style.overflow ="";
        }
        successModal.addEventListener(
            "click",
            function (event) {
                if (
                    event.target ===
                    successModal
                ) {
                    closeSuccessModal();
                }
            }
        );
        document.addEventListener(
            "keydown",
            function (event) {
                if (
                    event.key === "Escape"
                ) {
                    closeSuccessModal();
                }
            }
        );

//Contact
        function contactMessage() {

            alert(
                "Thank you for contacting Alumni Connect. Our Alumni Office will get back to you soon."
            );

        }

        const scrollTopBtn =
            document.getElementById(
                "scrollTopBtn"
            );
        window.addEventListener(
            "scroll",
            function () {
                if (
                    window.scrollY > 300
                ) {
                    scrollTopBtn.classList
                        .remove(
                            "hidden"
                        );
                } else {
                    scrollTopBtn.classList
                        .add(
                            "hidden"
                        );
                }
            }
        );
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
        window.addEventListener(
            "resize",
            function () {
                if (
                    window.innerWidth >= 768
                ) {
                    mobileMenu.classList.add(
                        "hidden"
                    );
                    menuIcon.classList.remove(
                        "fa-xmark"
                    );
                    menuIcon.classList.add(
                        "fa-bars"
                    );
                }
            }
        );
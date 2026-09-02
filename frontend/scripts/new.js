


        /* =================================================
           NEWS MODAL
        ================================================= */

        const newsModal =
            document.getElementById(
                "newsModal"
            );

        const modalTitle =
            document.getElementById(
                "modalTitle"
            );

        const modalDate =
            document.getElementById(
                "modalDate"
            );

        const modalDescription =
            document.getElementById(
                "modalDescription"
            );


        function openNews(
            title,
            description,
            date
        ) {

            modalTitle.textContent =
                title;

            modalDate.textContent =
                date;

            modalDescription.textContent =
                description;


            newsModal.classList.remove(
                "hidden"
            );


            newsModal.classList.add(
                "flex"
            );


            document.body.style.overflow =
                "hidden";

        }


        function closeNews() {

            newsModal.classList.add(
                "hidden"
            );


            newsModal.classList.remove(
                "flex"
            );


            document.body.style.overflow =
                "";

        }


        /* Close modal when clicking outside */

        newsModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === newsModal
                ) {

                    closeNews();

                }

            }
        );


        /* Close modal with ESC */

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Escape"
                ) {

                    closeNews();

                }

            }
        );


        /* =================================================
           CONTACT
        ================================================= */

        function contactMessage() {

            alert(
                "Thank you for contacting the Alumni Office!"
            );

        }


        /* =================================================
           SCROLL TO TOP
        ================================================= */

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

                    scrollTopBtn.classList.remove(
                        "hidden"
                    );

                } else {

                    scrollTopBtn.classList.add(
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





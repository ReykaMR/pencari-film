const API_KEY = "6033a7d2";

$(document).ready(function () {
    loadRandomMovies();

    let searchTimer;
    $("#searchInput").on("input", function () {
        const keyword = $(this).val().trim();
        clearTimeout(searchTimer);

        if (!keyword) {
            loadRandomMovies();
            $("#section-title").text("🎥 Rekomendasi Film Terbaru");
            return;
        }

        searchTimer = setTimeout(() => {
            searchMovies(keyword);
        }, 500);
    });
});

function showDefaultMessage(message = "Ketik judul film untuk mencari 🎥") {
    const isMobile = window.innerWidth < 768;
    const shortMessage = "Cari film...";

    $("#movie-list").html(`
        <div class="placeholder-text">
            ${isMobile ? shortMessage : message}
        </div>
    `);
}

function safeData(data, fallback = "-") {
    return data === "N/A" ? fallback : data;
}

function getYear(yearString) {
    if (!yearString) return 0;
    const year = parseInt(yearString.substring(0, 4));
    return isNaN(year) ? 0 : year;
}

function renderMovies(movies) {
    let html = "";

    if (movies.length === 0) {
        showDefaultMessage("Film tidak ditemukan 🎭");
        return;
    }

    $.each(movies, function (i, movie) {
        html += `
            <div class="col-md-3 d-flex">
                <div class="card flex-fill fade-in text-center" style="animation-delay:${i * 0.1}s">
                    <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/300x450?text=No+Poster"}" class="card-img-top" alt="${movie.Title}" onerror="this.src='https://placehold.co/300x450?text=No+Poster'">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${movie.Title}">${movie.Title}</h5>
                        <p class="card-text">${movie.Year}</p>
                        <div class="mt-auto">
                            <button class="btn btn-danger w-100" data-bs-toggle="modal" data-bs-target="#movieDetailModal" onclick="getMovieDetail('${movie.imdbID}')">
                                Detail
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    $("#movie-list").html(html);

    $(".card").each(function (index) {
        setTimeout(() => $(this).addClass("fade-in"), index * 100);
    });
}

function searchMovies(keyword) {
    $("#section-title").text(`Hasil Pencarian: "${keyword}"`);

    $("#movie-list").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Mencari film...</p>
        </div>
    `);

    $.ajax({
        url: `https://www.omdbapi.com/?apikey=${API_KEY}&s=${keyword}&type=movie`,
        success: function (result) {
            if (result.Response === "True") {
                let sortedMovies = result.Search.sort((a, b) =>
                    getYear(b.Year) - getYear(a.Year)
                );

                renderMovies(sortedMovies);
            } else {
                showDefaultMessage("Film tidak ditemukan 🎭");
            }
        },
        error: function () {
            showDefaultMessage("Terjadi kesalahan saat mengambil data.");
        }
    });
}

function loadRandomMovies() {
    $("#section-title").text("🎥 Rekomendasi Film Terbaru");

    $("#movie-list").html(`
        <div class="col-12 text-center">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Memuat film rekomendasi...</p>
        </div>
    `);

    $.ajax({
        url: `https://www.omdbapi.com/?apikey=${API_KEY}&s=action&type=movie`,
        success: function (result) {
            if (result.Response === "True") {
                const sortedByYear = result.Search.sort((a, b) =>
                    getYear(b.Year) - getYear(a.Year)
                );
                const selected = sortedByYear.slice(0, 8);

                renderMovies(selected);
            } else {
                showDefaultMessage("Gagal memuat film rekomendasi 🎭");
            }
        },
        error: function () {
            showDefaultMessage("Terjadi kesalahan saat mengambil data rekomendasi.");
        }
    });
}

function getMovieDetail(id) {
    $("#modalBodyContent").html(`
        <div class="text-center mt-3">
            <div class="spinner-border" role="status"></div>
            <p class="mt-2">Mengambil detail film...</p>
        </div>
    `);

    $.ajax({
        url: `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`,
        success: function (movie) {
            if (movie.Response === "True") {
                $("#modalBodyContent").html(`
                <div class="row">
                    <div class="col-md-4 text-center mb-3 mb-md-0">
                        <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://placehold.co/300x450?text=No+Poster"}" class="img-fluid rounded shadow-sm" alt="${movie.Title}" onerror="this.src='https://placehold.co/300x450?text=No+Poster'">
                    </div>
                    <div class="col-md-8">
                        <div class="movie-detail-content" style="max-height: 350px; overflow-y: auto; padding-right: 10px;">
                            <h4 class="mb-3">${movie.Title} <small class="text-muted">(${movie.Year})</small></h4>
                            <p><strong>Released:</strong> ${safeData(movie.Released)}</p>
                            <p><strong>Runtime:</strong> ${safeData(movie.Runtime)}</p>
                            <p><strong>Genre:</strong> ${safeData(movie.Genre)}</p>
                            <p><strong>Director:</strong> ${safeData(movie.Director)}</p>
                            <p><strong>Writer:</strong> ${safeData(movie.Writer)}</p>
                            <p><strong>Actors:</strong> ${safeData(movie.Actors)}</p>
                            <p><strong>Language:</strong> ${safeData(movie.Language)}</p>
                            <p><strong>Country:</strong> ${safeData(movie.Country)}</p>
                            <p><strong>Production:</strong> ${safeData(movie.Production)}</p>
                            <p><strong>Awards:</strong> ${safeData(movie.Awards)}</p>
                            <p><strong>Box Office:</strong> ${safeData(movie.BoxOffice)}</p>
                            <p><strong>Metascore:</strong> ${safeData(movie.Metascore)}</p>
                            <p><strong>IMDB Rating:</strong> ⭐ ${safeData(movie.imdbRating)}</p>
                            <p><strong>Plot:</strong> ${safeData(movie.Plot)}</p>
                        </div>
                    </div>
                </div>
            `);
            } else {
                $("#modalBodyContent").html(`<div class="text-center text-danger">${movie.Error}</div>`);
            }
        },
        error: function () {
            $("#modalBodyContent").html(`<div class="text-center text-danger">Gagal memuat detail film.</div>`);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    var loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            //console.log('Button clicked');
            var clientId = '6edeb07d24f54d92a171b85c858bfe09';
            //var clientSecret = ''
            var redirectUri = encodeURIComponent('https://bielvitooor.github.io/TOPFY/home.html');
            var scopes = encodeURIComponent('user-top-read user-read-private user-read-email user-read-recently-played user-top-read playlist-read-private');

            var url = 'https://accounts.spotify.com/authorize?client_id=' + clientId +
                '&response_type=token&redirect_uri=' + redirectUri +
                '&scope=' + scopes;

            window.location.href = url;
        });
    }
});
function getAccessToken() {
    var accessToken = null;
    var expires = null;
    var url = window.location.href;
    var hasToken = url.indexOf('#access_token=') > -1;
    if (hasToken) {
        var tokenArray = url.split('#access_token=');
        var tokenParams = tokenArray[1].split('&');
        accessToken = tokenParams[0];
        expires = tokenParams[2];
        //window.location.hash = '';
    }
    return accessToken;
}
//para fins de teste do professor use o token fixo, descomentando a linha abaixo
//let token="BQCoRW5eiCfccXiZmSUF1UZSAf4zi8w60NvkgtSEaYbRqNM1WbpaklENOH1tYcu2uboEMxqypCFNKX7ntLAL5Um4VxyijAAiXdyHAi9wQnP9qApCg6Mhvv-rTdcdOjA3EVk5M_E2UREzXgj2K6NzMB6ra2wDHbTtpMmwXmiBrsQ-0hSkB7t7ZqGzQt7wssnrXEQP6DgOdw5LEw3PTp7V5UbPB-AmBDHgyJkNAQ"
function getUserData() {
    //para fins de teste do professor use o token fixo, comentando a linha abaixo
    let token = getAccessToken();
    if (token) {
        var url = 'https://api.spotify.com/v1/me';
        var headers = {
            'Authorization': 'Bearer ' + token
        };
        fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                //console.log(data);
                document.getElementById('name').innerHTML = data.display_name;
                //document.getElementById('picture').src = data.images[0].url;
            });
    }
};
function fetchWebApi(endpoint, method, body) {
    //para fins de teste do professor use o token fixo, comentando a linha abaixo
    let token = getAccessToken();
    return fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        method,
        body: JSON.stringify(body)
    })
        .then(res => res.text())
        .then(text => JSON.parse(text));
}

function getTopTracks() {
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    return fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=10', 'GET')
        .then(response => response.items)
}
function getTopTracksArr() {
    return getTopTracks()
};

let trackCount = 0;

function displayTopTracks() {
    getTopTracksArr().then(topTracks => {
        const container = document.getElementById('tracksContainer');
        container.innerHTML = ''; // Limpar o conteúdo existente

        topTracks.forEach(track => {
            trackCount++;
            const trackDiv = createTrackElement(track, trackCount);
            container.appendChild(trackDiv);
        });
    });
}

function createTrackElement(track, trackNumber) {
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track';
    const infoDiv = document.createElement('div');
    infoDiv.className = 'info';

    const title = document.createElement('h2');
    title.className = 'title';
    title.textContent = track.name;

    const artist = document.createElement('p');
    artist.className = 'artist';

    const albumCover = document.createElement('img');
    albumCover.className = 'album-cover';

    const removeTrack = document.createElement('button');
    removeTrack.className = 'remove-track';
    removeTrack.textContent = 'Remover';

    artist.textContent = track.artists.map(artist => artist.name).join(', ');
    albumCover.src = track.album.images[0].url;


    const trackNumberElement = document.createElement('span');
    trackNumberElement.className = 'track-number';
    trackNumberElement.textContent = trackNumber;

    trackDiv.appendChild(trackNumberElement);
    trackDiv.appendChild(albumCover);
    infoDiv.appendChild(title);
    infoDiv.appendChild(artist);
    trackDiv.appendChild(infoDiv);
    trackDiv.appendChild(removeTrack);
    removeTrack.addEventListener('click', () => {
        trackDiv.remove();
    });

    return trackDiv;
}
if (window.location.href.indexOf('home.html') > -1) {
    getUserData();
    displayTopTracks();
    /*window.location.hash = '';
    if (window.performance.getEntriesByType("navigation")[0].type === "reload") {
        window.location.href = 'index.html';
    }*/
}



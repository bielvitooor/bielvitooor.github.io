document.addEventListener('DOMContentLoaded', function () {
    var loginButton = document.getElementById('loginButton');
    if (loginButton) {
        loginButton.addEventListener('click', function () {
            console.log('Button clicked');
            var clientId = '6edeb07d24f54d92a171b85c858bfe09';
            var clientSecret=''
            var redirectUri = encodeURIComponent('http://localhost/232pwi-javascript-grupo7/home.html');
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
        //remove hash from url loll
        //window.location.hash = '';
    }
    return accessToken;
} 
function getUserData() {
    var accessToken =getAccessToken();
    if (accessToken) {
        var url = 'https://api.spotify.com/v1/me';
        var headers = {
            'Authorization': 'Bearer ' + accessToken
        };
        fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                console.log(data);
            });
    } else {
        console.error('Access token not found');
    }
};
async function fetchWebApi(endpoint, method, body) {
    let token = getAccessToken();
    console.log(token);
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method,
      body:JSON.stringify(body)
    });
    const text = await res.text();
    console.log(text);
    return JSON.parse(text);
  }
  
  async function getTopTracks(){
    // Endpoint reference : https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks
    const response = await fetchWebApi('v1/me/top/tracks?time_range=short_term&limit=10', 'GET');
    console.log(response);
    return response.items;
  }
  async function getTopTracksArr(){
      
      const topTracks = await getTopTracks();
        return topTracks;
  };
  async function displayTopTracks() {
    const topTracks = await getTopTracksArr();
    const container = document.getElementById('tracksContainer');

    topTracks.forEach(track => {
        const trackDiv = document.createElement('div');
        trackDiv.className = 'track jumbotron jumbotron-fluid';
        const infoDiv=document.createElement('div');
        infoDiv.className='info';

        const title = document.createElement('h2');
        title.className = 'title';
        title.textContent = track.name;

        const artist = document.createElement('p');
        artist.className = 'artist';

        const albumCover = document.createElement('img');
        albumCover.className = 'album-cover';

        const removeTrack= document.createElement('button');
        removeTrack.className = 'remove-track';
        removeTrack.textContent = 'Remove';

        artist.textContent = track.artists.map(artist => artist.name).join(', ');
        albumCover.src = track.album.images[0].url;

        trackDiv.appendChild(albumCover);
        infoDiv.appendChild(title);
        infoDiv.appendChild(artist);
        trackDiv.appendChild(infoDiv);
        trackDiv.appendChild(removeTrack);
        removeTrack.addEventListener('click', () => {
            trackDiv.remove()
        });

        container.appendChild(trackDiv);
    });
}

displayTopTracks();
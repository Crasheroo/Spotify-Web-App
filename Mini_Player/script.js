const APIController = {
  clientId: '5bf2479f0535486db66009f5f024b82c',
  clientSecret: 'd7fba6b1b914480ab90fa175e5cdf726',
  accessToken: null,

  async getToken() {
    try {
      const result = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + btoa(this.clientId + ':' + this.clientSecret)
        },
        body: 'grant_type=client_credentials'
      });

      const data = await result.json();
      this.accessToken = data.access_token;
      return this.accessToken;
    } catch (error) {
      throw error;
    }
  },

  async searchArtist(artistName) {
    try {
      const accessToken = await this.getToken();
      const result = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      const data = await result.json();

      if (data.artists.items.length > 0) {
        const artistId = data.artists.items[0].id;
        await this.displayPopularSongs(artistId);
      } else {
        console.error('No artist found.');
      }
    } catch (error) {
      console.error('Error searching artist:', error);
    }
  },

  async getArtistDetails(artistId) {
    try {
      const accessToken = await this.getToken();
      const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      const data = await result.json();
      return data;
    } catch (error) {
      console.error('Error getting artist details:', error);
      return {};
    }
  },

  async getPopularSongs(artistId) {
    try {
      const accessToken = await this.getToken();
      const result = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });

      const data = await result.json();
      return data.tracks;
    } catch (error) {
      console.error('Error getting popular songs:', error);
      return [];
    }
  },

  updateMiniPlayer(artistName, songName, previewUrl, artistPhotoUrl) {
    const artistInfo = document.getElementById('artistInfo');
    const songInfo = document.getElementById('songInfo');
    const audioPlayer = document.getElementById('audioPlayer');
    const artistPhoto = document.getElementById('artistPhoto');

    artistInfo.textContent = `Artist: ${artistName}`;
    songInfo.textContent = `Song: ${songName}`;
    audioPlayer.src = previewUrl;

    if (artistPhotoUrl) {
      artistPhoto.src = artistPhotoUrl;
      artistPhoto.alt = `Photo of ${artistName}`;
    }
  },

  async displayPopularSongs(artistId) {
    const popularSongsContainer = document.getElementById('popularSongs');
    popularSongsContainer.innerHTML = '';
  
    try {
      const [artist, popularSongs] = await Promise.all([
        this.getArtistDetails(artistId),
        this.getPopularSongs(artistId),
      ]);
  
      if (artist.images && artist.images.length > 0) {
        const artistPhoto = document.getElementById('artistPhoto');
        artistPhoto.src = artist.images[0].url;
        artistPhoto.alt = `Photo of ${artist.name}`;
      }
  
      const gridContainer = document.createElement('div');
      gridContainer.classList.add('grid-container');
      popularSongsContainer.appendChild(gridContainer);
  
      for (let i = 0; i < popularSongs.length; i++) {
        this.displaySong(popularSongs[i], gridContainer);
      }
    } catch (error) {
      console.error('Error displaying popular songs:', error);
    }
  },
  

  displaySong(song, container) {
    const songElement = document.createElement('div');
    songElement.classList.add('song');

    const songName = document.createElement('p');
    songName.textContent = `Song: ${song.name}`;
    songElement.appendChild(songName);

    const artistName = document.createElement('p');
    artistName.textContent = `Artist: ${song.artists[0].name}`;
    songElement.appendChild(artistName);

    if (song.album.images && song.album.images.length > 0) {
      const songPhoto = document.createElement('img');
      songPhoto.src = song.album.images[0].url
      songPhoto.alt = `Cover of ${song.name}`;
      songPhoto.classList.add('song-photo');
      songElement.appendChild(songPhoto);
    }

    songElement.addEventListener('click', () => {
      this.updateMiniPlayer(song.artists[0].name, song.name, song.preview_url, song.album.images[0].url);
    });

    container.appendChild(songElement);
  },
};

async function searchArtist() {
  const artistName = document.getElementById('artistName').value;

  await APIController.searchArtist(artistName);

  const accessToken = await APIController.getToken();
  const result = await fetch(`https://api.spotify.com/v1/search?q=${artistName}&type=artist`, {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    }
  });

  const data = await result.json();
  const artistId = data.artists.items[0].id;

  await APIController.displayPopularSongs(artistId);
}

/**
 * app.js - Script principal para Tokyo Box
 * Responsável pela inicialização da UI e gerenciamento das telas
 */

// Namespace principal da aplicação
const TokyoBox = {
    // Estado da aplicação
    state: {
        isUIOpen: false,
        currentScreen: 'home',
        currentTrack: null,
        isPlaying: false,
        volume: 70,
        playlists: [],
        favorites: [],
        recentSearches: [],
        currentPlaylist: null,
        activeModal: null,
        searchResults: []
    },

    // Elementos DOM frequentemente usados
    elements: {},

    // Inicialização da aplicação
    init: function() {
        // Carregar elementos DOM
        this.cacheElements();
        // Configurar handlers para eventos
        this.setupEventListeners();
        // Inicializar ícones
        this.initializeFeatherIcons();
        // Inicializar relógio
        this.startClock();
        // Configurar interação com o FiveM NUI
        this.setupNUI();
        
        console.log('Tokyo Box: Interface inicializada');
    },

    // Guardar referências para elementos DOM
    cacheElements: function() {
        // Container principal
        this.elements.app = document.getElementById('tokyo-box-app');
        
        // Telas
        this.elements.screens = {
            home: document.getElementById('home-screen'),
            search: document.getElementById('search-screen'),
            library: document.getElementById('library-screen'),
            playlist: document.getElementById('playlist-screen')
        };
        
        // Botões da navegação
        this.elements.navButtons = {
            home: document.getElementById('nav-home'),
            search: document.getElementById('nav-search'),
            library: document.getElementById('nav-library')
        };
        
        // Player de música
        this.elements.player = {
            container: document.getElementById('music-player'),
            miniPlayer: document.querySelector('.mini-player'),
            fullPlayer: document.querySelector('.full-player'),
            currentTitle: document.getElementById('current-title'),
            currentArtist: document.getElementById('current-artist'),
            currentThumbnail: document.getElementById('current-thumbnail'),
            fullTitle: document.getElementById('full-title'),
            fullArtist: document.getElementById('full-artist'),
            fullThumbnail: document.getElementById('full-thumbnail'),
            toggleButton: document.getElementById('player-toggle'),
            fullToggleButton: document.getElementById('full-player-toggle'),
            prevButton: document.getElementById('prev-track'),
            nextButton: document.getElementById('next-track'),
            progressBar: document.getElementById('progress-current'),
            currentTime: document.getElementById('current-time'),
            totalTime: document.getElementById('total-time'),
            volumeSlider: document.getElementById('volume-slider'),
            minimizeButton: document.getElementById('minimize-player'),
            favoriteButton: document.getElementById('favorite-track'),
            addToPlaylistButton: document.getElementById('add-to-playlist'),
            audioElement: document.getElementById('audio-player')
        };
        
        // Componentes da UI principal
        this.elements.closeButton = document.getElementById('close-app');
        this.elements.clock = document.querySelector('.time');
        this.elements.recentPlaylists = document.getElementById('recent-playlists');
        this.elements.recentTracks = document.getElementById('recent-tracks');
        this.elements.userPlaylists = document.getElementById('user-playlists');
        this.elements.favoritesList = document.getElementById('favorites-list');
        
        // Componentes de busca
        this.elements.searchInput = document.getElementById('search-input');
        this.elements.searchButton = document.getElementById('search-button');
        this.elements.searchResults = document.getElementById('search-results');
        this.elements.recentSearches = document.querySelector('.recent-searches-list');
        
        // Componentes de playlist
        this.elements.playlistName = document.getElementById('playlist-name');
        this.elements.playlistOwner = document.getElementById('playlist-owner');
        this.elements.playlistDetails = document.getElementById('playlist-details');
        this.elements.playlistTracks = document.getElementById('playlist-tracks');
        this.elements.playPlaylistButton = document.getElementById('play-playlist');
        this.elements.deletePlaylistButton = document.getElementById('delete-playlist');
        
        // Modais
        this.elements.createPlaylistModal = document.getElementById('create-playlist-modal');
        this.elements.addToPlaylistModal = document.getElementById('add-to-playlist-modal');
        this.elements.createPlaylistButton = document.getElementById('create-playlist');
        this.elements.closeCreateModalButton = document.getElementById('close-create-modal');
        this.elements.cancelCreatePlaylistButton = document.getElementById('cancel-create-playlist');
        this.elements.confirmCreatePlaylistButton = document.getElementById('confirm-create-playlist');
        this.elements.playlistNameInput = document.getElementById('playlist-name-input');
        this.elements.playlistDescriptionInput = document.getElementById('playlist-description-input');
        this.elements.closeAddModalButton = document.getElementById('close-add-modal');
        this.elements.playlistSelection = document.getElementById('playlist-selection');
        
        // Contêiner de notificações
        this.elements.notificationContainer = document.getElementById('notification-container');
    },

    // Configurar event listeners para interações do usuário
    setupEventListeners: function() {
        // Eventos de navegação
        for (const [screenName, button] of Object.entries(this.elements.navButtons)) {
            button.addEventListener('click', () => this.changeScreen(screenName));
        }
        
        // Botão de fechar
        this.elements.closeButton.addEventListener('click', () => this.closeUI());
        
        // Interações com o player
        this.elements.player.miniPlayer.addEventListener('click', (e) => {
            if (e.target.closest('.player-controls') === null) {
                this.toggleFullPlayer(true);
            }
        });
        this.elements.player.minimizeButton.addEventListener('click', () => this.toggleFullPlayer(false));
        this.elements.player.toggleButton.addEventListener('click', () => this.togglePlayback());
        this.elements.player.fullToggleButton.addEventListener('click', () => this.togglePlayback());
        this.elements.player.prevButton.addEventListener('click', () => this.previousTrack());
        this.elements.player.nextButton.addEventListener('click', () => this.nextTrack());
        this.elements.player.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.player.favoriteButton.addEventListener('click', () => this.toggleFavorite());
        this.elements.player.addToPlaylistButton.addEventListener('click', () => this.showAddToPlaylistModal());
        
        // Progress bar clicável
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            const progressBar = e.currentTarget;
            const clickPosition = e.offsetX / progressBar.offsetWidth;
            const duration = this.elements.player.audioElement.duration;
            if (duration && !isNaN(duration)) {
                this.seekTrack(clickPosition * duration);
            }
        });
        
        // Busca
        this.elements.searchButton.addEventListener('click', () => this.performSearch());
        this.elements.searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Playlist
        this.elements.createPlaylistButton.addEventListener('click', () => this.showCreatePlaylistModal());
        this.elements.closeCreateModalButton.addEventListener('click', () => this.hideModals());
        this.elements.cancelCreatePlaylistButton.addEventListener('click', () => this.hideModals());
        this.elements.confirmCreatePlaylistButton.addEventListener('click', () => this.createPlaylist());
        this.elements.closeAddModalButton.addEventListener('click', () => this.hideModals());
        this.elements.playPlaylistButton.addEventListener('click', () => this.playCurrentPlaylist());
        this.elements.deletePlaylistButton.addEventListener('click', () => this.deleteCurrentPlaylist());
    },

    // Inicializar ícones Feather
    initializeFeatherIcons: function() {
        feather.replace();
    },

    // Iniciar relógio
    startClock: function() {
        const updateClock = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            this.elements.clock.textContent = `${hours}:${minutes}`;
        };
        
        updateClock();
        setInterval(updateClock, 60000);
    },

    // Configurar comunicação com o NUI do FiveM
    setupNUI: function() {
        window.addEventListener('message', (event) => {
            const data = event.data;
            
            switch (data.action) {
                case 'open':
                    this.openUI();
                    this.state.volume = data.volume || 70;
                    this.elements.player.volumeSlider.value = this.state.volume;
                    break;
                    
                case 'close':
                    this.closeUI();
                    break;
                    
                case 'updatePlaylists':
                    this.updatePlaylists(data.playlists || []);
                    break;
                    
                case 'updateFavorites':
                    this.updateFavorites(data.favorites || []);
                    break;
                    
                case 'updateSettings':
                    this.updateSettings(data.settings || {});
                    break;
                    
                case 'updateSearchResults':
                    this.displaySearchResults(data.results || []);
                    break;
                    
                case 'updateCurrentTrack':
                    this.updateCurrentTrack(data.track);
                    break;
                    
                case 'updatePlaybackState':
                    this.updatePlaybackState(data.isPlaying, data.track);
                    break;
                    
                case 'updatePlaylistTracks':
                    this.updatePlaylistTracks(data.playlistId, data.tracks, data.playlistInfo);
                    break;
                    
                case 'updateVolume':
                    this.elements.player.volumeSlider.value = data.volume;
                    this.state.volume = data.volume;
                    if (this.elements.player.audioElement) {
                        this.elements.player.audioElement.volume = data.volume / 100;
                    }
                    break;
                    
                case 'notification':
                    this.showNotification(data.message, data.type);
                    break;
                    
                case 'playAudio':
                    this.playAudioFallback(data.track, data.volume);
                    break;
                    
                case 'pauseAudio':
                    this.pauseAudioFallback();
                    break;
                    
                case 'resumeAudio':
                    this.resumeAudioFallback();
                    break;
                    
                case 'stopAudio':
                    this.stopAudioFallback();
                    break;
                    
                case 'seekAudio':
                    this.seekAudioFallback(data.position);
                    break;
                    
                case 'setVolume':
                    this.setAudioVolumeFallback(data.volume);
                    break;
            }
        });
    },

    // Abrir a interface
    openUI: function() {
        this.state.isUIOpen = true;
        this.elements.app.classList.remove('hide');
    },

    // Fechar a interface
    closeUI: function() {
        this.state.isUIOpen = false;
        this.elements.app.classList.add('hide');
        this.sendNUICallback('closeUI', {});
    },

    // Mudança de tela
    changeScreen: function(screenName) {
        // Remover classe 'active' de todas as telas e botões
        Object.values(this.elements.screens).forEach(screen => screen.classList.remove('active'));
        Object.values(this.elements.navButtons).forEach(button => button.classList.remove('active'));
        
        // Ativar a tela e botão selecionados
        this.elements.screens[screenName].classList.add('active');
        this.elements.navButtons[screenName].classList.add('active');
        
        // Atualizar o estado
        this.state.currentScreen = screenName;
    },

    // Abrir a tela de playlist com dados específicos
    openPlaylistScreen: function(playlistId) {
        // Enviar uma solicitação para obter as músicas da playlist
        this.sendNUICallback('playPlaylist', { playlistId: playlistId });
        
        // Alterar para a tela de playlist
        // Nota: Os detalhes serão preenchidos quando recebermos os dados do lado do servidor
        Object.values(this.elements.screens).forEach(screen => screen.classList.remove('active'));
        this.elements.screens.playlist.classList.add('active');
    },

    // Alternar o player expandido
    toggleFullPlayer: function(show) {
        if (show) {
            this.elements.player.fullPlayer.classList.add('active');
        } else {
            this.elements.player.fullPlayer.classList.remove('active');
        }
    },

    // Enviar uma callback para o script Lua
    sendNUICallback: function(name, data, cb) {
        fetch(`https://tokyo_box/${name}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(resp => resp.json())
        .then(resp => {
            if (cb) cb(resp);
        })
        .catch(error => {
            console.error('Tokyo Box: Erro na callback NUI', error);
        });
    },

    // Ações do Player
    togglePlayback: function() {
        if (!this.state.currentTrack) return;
        
        if (this.state.isPlaying) {
            this.sendNUICallback('pauseTrack', {});
        } else {
            this.sendNUICallback('resumeTrack', {});
        }
    },

    previousTrack: function() {
        this.sendNUICallback('previousTrack', {});
    },

    nextTrack: function() {
        this.sendNUICallback('nextTrack', {});
    },

    setVolume: function(volume) {
        volume = parseInt(volume);
        this.state.volume = volume;
        
        // Atualizar o volume do elemento de áudio (fallback)
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.volume = volume / 100;
        }
        
        // Enviar para o script Lua
        this.sendNUICallback('setVolume', { volume: volume });
    },

    seekTrack: function(position) {
        // Atualizar a interface visual
        if (this.elements.player.audioElement && this.elements.player.audioElement.duration) {
            this.elements.player.audioElement.currentTime = position;
        }
        
        // Enviar para o script Lua
        this.sendNUICallback('seekTrack', { position: position });
    },

    toggleFavorite: function() {
        if (!this.state.currentTrack) return;
        
        const trackId = this.state.currentTrack.id;
        const isFavorite = this.isFavorite(trackId);
        
        if (isFavorite) {
            this.sendNUICallback('removeFromFavorites', { trackId: trackId });
        } else {
            this.sendNUICallback('addToFavorites', { trackId: trackId });
        }
    },

    showAddToPlaylistModal: function() {
        if (!this.state.currentTrack) return;
        
        // Preencher o modal com as playlists do usuário
        this.updatePlaylistSelectionModal();
        
        // Mostrar o modal
        this.elements.addToPlaylistModal.classList.add('active');
        this.state.activeModal = 'addToPlaylist';
    },

    updatePlaylistSelectionModal: function() {
        const container = this.elements.playlistSelection;
        container.innerHTML = '';
        
        if (this.state.playlists.length === 0) {
            container.innerHTML = '<div class="empty-message">Você não tem playlists</div>';
            return;
        }
        
        this.state.playlists.forEach(playlist => {
            const item = document.createElement('div');
            item.className = 'playlist-select-item';
            item.dataset.id = playlist.id;
            
            item.innerHTML = `
                <div class="playlist-mini-cover">
                    <img src="img/playlist-default.svg" alt="${playlist.name}">
                </div>
                <div class="playlist-mini-info">
                    <div class="playlist-mini-name">${playlist.name}</div>
                    <div class="playlist-mini-details">Adicionar música</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                this.addTrackToPlaylist(this.state.currentTrack.id, playlist.id);
                this.hideModals();
            });
            
            container.appendChild(item);
        });
    },

    // Adicionar música a uma playlist
    addTrackToPlaylist: function(trackId, playlistId) {
        this.sendNUICallback('addToPlaylist', { 
            trackId: trackId,
            playlistId: playlistId
        });
    },

    // Procurar músicas
    performSearch: function() {
        const query = this.elements.searchInput.value.trim();
        if (query.length === 0) return;
        
        // Mostrar loader
        this.elements.searchResults.innerHTML = '<div class="loader"></div>';
        
        // Enviar a consulta para o script Lua
        this.sendNUICallback('search', { query: query });
        
        // Salvar na lista de buscas recentes
        if (!this.state.recentSearches.includes(query)) {
            this.state.recentSearches.unshift(query);
            if (this.state.recentSearches.length > 10) {
                this.state.recentSearches.pop();
            }
            
            // Atualizar a lista de buscas recentes na UI
            this.updateRecentSearchesUI();
        }
    },

    // Exibir resultados da busca
    displaySearchResults: function(results) {
        const container = this.elements.searchResults;
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="empty-message">Nenhum resultado encontrado</div>';
            return;
        }
        
        this.state.searchResults = results;
        
        results.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.dataset.id = track.id;
            
            item.innerHTML = `
                <div class="track-thumbnail">
                    <img src="${track.album_art || 'img/default-album.svg'}" alt="${track.title}">
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-actions">
                    <button class="btn-icon track-play" data-index="${index}">
                        <i data-feather="play"></i>
                    </button>
                    <button class="btn-icon track-add" data-index="${index}">
                        <i data-feather="plus"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Inicializar ícones
        feather.replace();
        
        // Adicionar event listeners para os botões
        container.querySelectorAll('.track-play').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const track = this.state.searchResults[index];
                this.playTrack(track.id);
            });
        });
        
        container.querySelectorAll('.track-add').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.currentTarget.dataset.index;
                const track = this.state.searchResults[index];
                
                // Mostrar modal para escolher playlist
                this.state.currentTrack = track;
                this.showAddToPlaylistModal();
            });
        });
    },

    // Atualizar UI de buscas recentes
    updateRecentSearchesUI: function() {
        const container = this.elements.recentSearches;
        container.innerHTML = '';
        
        if (this.state.recentSearches.length === 0) return;
        
        this.state.recentSearches.forEach(query => {
            const item = document.createElement('div');
            item.className = 'recent-search-item';
            item.textContent = query;
            
            item.addEventListener('click', () => {
                this.elements.searchInput.value = query;
                this.performSearch();
            });
            
            container.appendChild(item);
        });
    },

    // Criar uma nova playlist
    showCreatePlaylistModal: function() {
        this.elements.playlistNameInput.value = '';
        this.elements.playlistDescriptionInput.value = '';
        this.elements.createPlaylistModal.classList.add('active');
        this.state.activeModal = 'createPlaylist';
    },

    hideModals: function() {
        this.elements.createPlaylistModal.classList.remove('active');
        this.elements.addToPlaylistModal.classList.remove('active');
        this.state.activeModal = null;
    },

    createPlaylist: function() {
        const name = this.elements.playlistNameInput.value.trim();
        const description = this.elements.playlistDescriptionInput.value.trim();
        
        if (name.length === 0) {
            this.showNotification('Nome da playlist não pode estar vazio', 'error');
            return;
        }
        
        this.sendNUICallback('createPlaylist', {
            name: name,
            description: description
        });
        
        this.hideModals();
    },

    // Reproduzir a playlist atual
    playCurrentPlaylist: function() {
        if (!this.state.currentPlaylist) return;
        
        this.sendNUICallback('playPlaylist', {
            playlistId: this.state.currentPlaylist.id
        });
    },

    // Excluir a playlist atual
    deleteCurrentPlaylist: function() {
        if (!this.state.currentPlaylist) return;
        
        if (confirm('Tem certeza que deseja excluir esta playlist?')) {
            this.sendNUICallback('deletePlaylist', {
                playlistId: this.state.currentPlaylist.id
            });
            
            // Voltar para a tela da biblioteca
            this.changeScreen('library');
        }
    },

    // Reproduzir uma faixa
    playTrack: function(trackId) {
        this.sendNUICallback('playTrack', { trackId: trackId });
    },

    // Verificar se uma música está nos favoritos
    isFavorite: function(trackId) {
        return this.state.favorites.some(track => track.id === trackId);
    },

    // Atualizações da UI
    updatePlaylists: function(playlists) {
        this.state.playlists = playlists;
        
        // Atualizar a lista de playlists na biblioteca
        const container = this.elements.userPlaylists;
        container.innerHTML = '';
        
        if (playlists.length === 0) {
            container.innerHTML = '<div class="empty-message">Você ainda não tem playlists</div>';
            return;
        }
        
        playlists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card';
            card.dataset.id = playlist.id;
            
            card.innerHTML = `
                <div class="playlist-cover">
                    <img src="img/playlist-default.svg" alt="${playlist.name}">
                </div>
                <div class="playlist-name">${playlist.name}</div>
                <div class="playlist-details">${playlist.description || 'Sem descrição'}</div>
            `;
            
            card.addEventListener('click', () => {
                this.openPlaylistScreen(playlist.id);
            });
            
            container.appendChild(card);
        });
        
        // Atualizar playlists recentes na home
        const recentContainer = this.elements.recentPlaylists;
        recentContainer.innerHTML = '';
        
        if (playlists.length === 0) {
            recentContainer.innerHTML = '<div class="empty-message">Você ainda não tem playlists</div>';
            return;
        }
        
        // Mostrar apenas as 5 playlists mais recentes na home
        const recentPlaylists = playlists.slice(0, 5);
        
        recentPlaylists.forEach(playlist => {
            const card = document.createElement('div');
            card.className = 'playlist-card-horizontal';
            card.dataset.id = playlist.id;
            
            card.innerHTML = `
                <div class="playlist-cover">
                    <img src="img/playlist-default.svg" alt="${playlist.name}">
                </div>
                <div class="playlist-name">${playlist.name}</div>
            `;
            
            card.addEventListener('click', () => {
                this.openPlaylistScreen(playlist.id);
            });
            
            recentContainer.appendChild(card);
        });
    },

    updateFavorites: function(favorites) {
        this.state.favorites = favorites;
        
        // Atualizar favoritos na UI
        const container = this.elements.favoritesList;
        container.innerHTML = '';
        
        if (favorites.length === 0) {
            container.innerHTML = '<div class="empty-message">Você ainda não tem músicas favoritas</div>';
            return;
        }
        
        favorites.forEach(track => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.dataset.id = track.id;
            
            item.innerHTML = `
                <div class="track-thumbnail">
                    <img src="${track.album_art || 'img/default-album.svg'}" alt="${track.title}">
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-actions">
                    <button class="btn-icon track-play-fav" data-id="${track.id}">
                        <i data-feather="play"></i>
                    </button>
                    <button class="btn-icon track-remove-fav" data-id="${track.id}">
                        <i data-feather="x"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Inicializar ícones
        feather.replace();
        
        // Adicionar event listeners para os botões
        container.querySelectorAll('.track-play-fav').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackId = e.currentTarget.dataset.id;
                this.playTrack(trackId);
            });
        });
        
        container.querySelectorAll('.track-remove-fav').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackId = e.currentTarget.dataset.id;
                this.sendNUICallback('removeFromFavorites', { trackId: trackId });
            });
        });
        
        // Atualizar o botão de favorito no player se a música atual estiver nos favoritos
        if (this.state.currentTrack) {
            this.updateFavoriteButton();
        }
    },

    updateFavoriteButton: function() {
        if (!this.state.currentTrack) return;
        
        const isFavorite = this.isFavorite(this.state.currentTrack.id);
        
        if (isFavorite) {
            this.elements.player.favoriteButton.classList.add('active');
            this.elements.player.favoriteButton.querySelector('i').setAttribute('data-feather', 'heart');
            this.elements.player.favoriteButton.querySelector('i').classList.add('filled');
        } else {
            this.elements.player.favoriteButton.classList.remove('active');
            this.elements.player.favoriteButton.querySelector('i').setAttribute('data-feather', 'heart');
            this.elements.player.favoriteButton.querySelector('i').classList.remove('filled');
        }
        
        feather.replace();
    },

    updateSettings: function(settings) {
        if (settings.volume !== undefined) {
            this.state.volume = settings.volume;
            this.elements.player.volumeSlider.value = settings.volume;
        }
    },

    updateCurrentTrack: function(track) {
        if (!track) return;
        
        this.state.currentTrack = track;
        
        // Atualizar UI do player
        this.elements.player.currentTitle.textContent = track.title;
        this.elements.player.currentArtist.textContent = track.artist;
        this.elements.player.currentThumbnail.src = track.album_art || 'img/default-album.svg';
        
        this.elements.player.fullTitle.textContent = track.title;
        this.elements.player.fullArtist.textContent = track.artist;
        this.elements.player.fullThumbnail.src = track.album_art || 'img/default-album.svg';
        
        // Atualizar o botão de favorito
        this.updateFavoriteButton();
    },

    updatePlaybackState: function(isPlaying, track) {
        this.state.isPlaying = isPlaying;
        
        if (track) {
            this.updateCurrentTrack(track);
        }
        
        // Atualizar ícones de play/pause
        const playIcon = isPlaying ? 'pause' : 'play';
        this.elements.player.toggleButton.querySelector('i').setAttribute('data-feather', playIcon);
        this.elements.player.fullToggleButton.querySelector('i').setAttribute('data-feather', playIcon);
        
        feather.replace();
    },

    updatePlaylistTracks: function(playlistId, tracks, playlistInfo) {
        if (!playlistInfo) return;
        
        // Atualizar o estado da playlist atual
        this.state.currentPlaylist = {
            id: playlistId,
            name: playlistInfo.name,
            description: playlistInfo.description,
            tracks: tracks
        };
        
        // Atualizar cabeçalho da playlist
        this.elements.playlistName.textContent = playlistInfo.name;
        this.elements.playlistOwner.textContent = 'Sua playlist';
        
        // Calcular duração total
        let totalDuration = 0;
        tracks.forEach(track => {
            if (track.duration) {
                totalDuration += parseInt(track.duration);
            }
        });
        
        const minutes = Math.floor(totalDuration / 60);
        this.elements.playlistDetails.textContent = `${tracks.length} músicas, ${minutes} min`;
        
        // Atualizar lista de músicas
        const container = this.elements.playlistTracks;
        container.innerHTML = '';
        
        if (tracks.length === 0) {
            container.innerHTML = '<div class="empty-message">Esta playlist está vazia</div>';
            return;
        }
        
        tracks.forEach(track => {
            const item = document.createElement('div');
            item.className = 'track-item';
            item.dataset.id = track.id;
            
            item.innerHTML = `
                <div class="track-thumbnail">
                    <img src="${track.album_art || 'img/default-album.svg'}" alt="${track.title}">
                </div>
                <div class="track-details">
                    <div class="track-title">${track.title}</div>
                    <div class="track-artist">${track.artist}</div>
                </div>
                <div class="track-actions">
                    <button class="btn-icon track-play-playlist" data-id="${track.id}">
                        <i data-feather="play"></i>
                    </button>
                    <button class="btn-icon track-remove-playlist" data-id="${track.id}">
                        <i data-feather="x"></i>
                    </button>
                </div>
            `;
            
            container.appendChild(item);
        });
        
        // Inicializar ícones
        feather.replace();
        
        // Adicionar event listeners para os botões
        container.querySelectorAll('.track-play-playlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackId = e.currentTarget.dataset.id;
                this.playTrack(trackId);
            });
        });
        
        container.querySelectorAll('.track-remove-playlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackId = e.currentTarget.dataset.id;
                this.sendNUICallback('removeFromPlaylist', { 
                    trackId: trackId,
                    playlistId: playlistId
                });
            });
        });
    },

    // Exibir notificação
    showNotification: function(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.elements.notificationContainer.appendChild(notification);
        
        // Remover após 3s
        setTimeout(() => {
            notification.remove();
        }, 3300);
    },

    // Funções para fallback de áudio (usado quando xSound não está disponível)
    playAudioFallback: function(track, volume) {
        if (!track || !track.url) return;
        
        const audio = this.elements.player.audioElement;
        audio.src = track.url;
        audio.volume = (volume !== undefined ? volume : this.state.volume) / 100;
        
        // Evento para quando os metadados são carregados (duração, etc)
        audio.onloadedmetadata = () => {
            // Converter a duração para formato mm:ss
            const duration = audio.duration;
            const minutes = Math.floor(duration / 60);
            const seconds = Math.floor(duration % 60);
            this.elements.player.totalTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            // Enviar duração para o script Lua
            this.sendNUICallback('updateTrackDuration', { duration: duration });
        };
        
        // Evento para atualizar a posição atual
        audio.ontimeupdate = () => {
            const currentTime = audio.currentTime;
            const duration = audio.duration;
            
            if (!isNaN(duration) && duration > 0) {
                // Atualizar barra de progresso
                const progress = (currentTime / duration) * 100;
                this.elements.player.progressBar.style.width = `${progress}%`;
                
                // Atualizar texto do tempo atual
                const minutes = Math.floor(currentTime / 60);
                const seconds = Math.floor(currentTime % 60);
                this.elements.player.currentTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
                
                // Enviar posição atual para o script Lua
                this.sendNUICallback('updateTrackPosition', { position: currentTime });
            }
        };
        
        // Evento para quando a música termina
        audio.onended = () => {
            this.sendNUICallback('trackEnded', {});
        };
        
        audio.play().catch(error => {
            console.error('Tokyo Box: Erro ao reproduzir áudio', error);
            this.showNotification('Erro ao reproduzir a música', 'error');
        });
    },

    pauseAudioFallback: function() {
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.pause();
        }
    },

    resumeAudioFallback: function() {
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.play().catch(error => {
                console.error('Tokyo Box: Erro ao retomar áudio', error);
            });
        }
    },

    stopAudioFallback: function() {
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.pause();
            this.elements.player.audioElement.currentTime = 0;
        }
    },

    seekAudioFallback: function(position) {
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.currentTime = position;
        }
    },

    setAudioVolumeFallback: function(volume) {
        if (this.elements.player.audioElement) {
            this.elements.player.audioElement.volume = volume / 100;
        }
    }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    TokyoBox.init();
});

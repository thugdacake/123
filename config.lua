-- config.lua
Config = {}

-- Configurações gerais
Config.CommandName = "tokyobox" -- Comando para abrir o player de música
Config.ToggleKeybind = "F5" -- Tecla padrão para abrir/fechar o player

-- Configurações de permissões
Config.RequireVIP = true -- Se true, apenas VIPs podem usar o player
Config.VIPGroups = {"vip", "vip+", "admin", "superadmin"} -- Grupos que são considerados VIP
Config.VIPFlags = {"vip"} -- Flags que são consideradas VIP (se o servidor usar system de flags)

-- Configurações de interface
Config.PhonePosition = "right" -- Posição do "celular" na tela (right, left)
Config.DefaultVolume = 70 -- Volume padrão (0-100)
Config.EnableNotifications = true -- Habilitar notificações no jogo
Config.EnableDarkMode = true -- Habilitar modo escuro por padrão
Config.ResponsiveUI = true -- Adaptar UI para diferentes resoluções de tela

-- Configurações de áudio
Config.DefaultDistance = 5.0 -- Distância para áudio 3D (se habilitado)
Config.Enable3DAudio = false -- Se true, outros jogadores próximos podem ouvir sua música

-- Configurações de Bluetooth e compartilhamento de áudio
Config.AudioSharing = {
    EnableBluetoothFeatures = true,     -- Habilitar funcionalidades virtuais de Bluetooth
    MaxBluetoothConnections = 8,        -- Número máximo de conexões Bluetooth simultâneas
    AutoAcceptPairing = false,          -- Requer confirmação manual para solicitações de pareamento
    BluetoothRange = 15.0,              -- Alcance máximo para descoberta de dispositivos (unidades do jogo)
    SyncThreshold = 0.5,                -- Limiar máximo de dessincronização permitido antes da correção (segundos)
    ShareEqualizer = true,              -- Se as configurações do equalizador são compartilhadas com ouvintes
    DirectionalAudio = true,            -- Habilitar áudio direcional baseado na orientação do jogador
    EnvironmentalEffects = true,        -- Aplicar efeitos de ambiente como reverberação
    AudioOcclusion = true               -- Considerar obstáculos para oclusão de áudio 3D
}

-- Configurações de sessões em grupo
Config.GroupSessions = {
    Enabled = true,                     -- Habilitar sessões de audição em grupo
    MaxSessionSize = 16,                -- Máximo de participantes por sessão
    AllowPublicSessions = true,         -- Permitir sessões visíveis publicamente
    SessionBufferSize = 10,             -- Tamanho do buffer de faixas pré-carregadas para transições suaves
    EnableVotingSystem = true,          -- Habilitar sistema de votação para seleção da próxima faixa
    EnableChat = true,                  -- Habilitar chat entre membros da sessão
    AllowTrackSuggestions = true        -- Permitir que ouvintes sugiram faixas
}

-- Configurações de equalizador
Config.Equalizer = {
    Enabled = true,                     -- Habilitar funcionalidade de equalizador
    Bands = {60, 230, 910, 3600, 14000},-- Frequências das bandas do equalizador (Hz)
    MaxGain = 12,                       -- Ganho máximo/corte em dB
    DefaultPresets = {                  -- Pré-configurações padrão do equalizador
        flat = {0, 0, 0, 0, 0},
        bassBoost = {10, 5, 0, 0, 0},
        vocalBoost = {-2, 0, 7, 4, -2},
        trebleBoost = {0, 0, 0, 7, 9},
        electronic = {4, 3, 0, 3, 5}
    }
}

-- Configurações de banco de dados
Config.DatabaseTables = {
    users = "tokyo_box_users",
    playlists = "tokyo_box_playlists", 
    songs = "tokyo_box_songs",
    playlistSongs = "tokyo_box_playlist_songs",
    favorites = "tokyo_box_favorites",
    devices = "tokyo_box_devices",        -- Nova tabela para dispositivos pareados
    sessions = "tokyo_box_sessions",      -- Nova tabela para sessões de grupo
    sessionMembers = "tokyo_box_session_members", -- Nova tabela para membros de sessões
    equalizerPresets = "tokyo_box_equalizer_presets" -- Nova tabela para configurações de equalizador
}

-- URLs para APIs de música
Config.MusicAPIs = {
    youtube = "https://www.googleapis.com/youtube/v3",
    soundcloud = "https://api.soundcloud.com"
}

-- Limitações
Config.MaxPlaylists = 10 -- Número máximo de playlists por usuário
Config.MaxSongsPerPlaylist = 100 -- Número máximo de músicas por playlist
Config.MaxRecentSearches = 10 -- Número máximo de pesquisas recentes salvas

-- Textos de interface (pt-BR)
Config.Texts = {
    welcome = "Bem-vindo ao Tokyo Box",
    noAccess = "Desculpe, apenas usuários VIP podem acessar o Tokyo Box",
    playlistCreated = "Playlist criada com sucesso",
    playlistDeleted = "Playlist excluída com sucesso",
    trackAdded = "Música adicionada à playlist",
    trackRemoved = "Música removida da playlist",
    errorPlayback = "Erro ao reproduzir a música",
    
    -- Novos textos para funcionalidades de compartilhamento
    bluetoothEnabled = "Bluetooth ativado",
    bluetoothDisabled = "Bluetooth desativado",
    deviceDiscovered = "Novo dispositivo encontrado",
    deviceConnected = "Dispositivo conectado",
    deviceDisconnected = "Dispositivo desconectado",
    pairingRequest = "Solicitação de pareamento recebida",
    pairingAccepted = "Pareamento aceito",
    pairingRejected = "Pareamento rejeitado",
    sessionCreated = "Sessão de grupo criada",
    sessionJoined = "Você entrou na sessão",
    sessionLeft = "Você saiu da sessão",
    noNearbyDevices = "Nenhum dispositivo próximo encontrado",
    maxConnectionsReached = "Número máximo de conexões atingido"
}

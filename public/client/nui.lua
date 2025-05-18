-- client/nui.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- Callbacks NUI
RegisterNUICallback('closeUI', function(data, cb)
    CloseTokyoBox()
    cb('ok')
end)

-- Callback para reproduzir música
RegisterNUICallback('playTrack', function(data, cb)
    local trackId = data.trackId
    
    -- Solicitar informações da música ao servidor
    TriggerServerEvent('tokyo_box:getTrackInfo', trackId)
    
    cb({
        status = "requestingSong"
    })
end)

-- Callback para pausar música
RegisterNUICallback('pauseTrack', function(data, cb)
    PauseTrack()
    cb('ok')
end)

-- Callback para retomar música
RegisterNUICallback('resumeTrack', function(data, cb)
    ResumeTrack()
    cb('ok')
end)

-- Callback para próxima música
RegisterNUICallback('nextTrack', function(data, cb)
    NextTrack()
    cb('ok')
end)

-- Callback para música anterior
RegisterNUICallback('previousTrack', function(data, cb)
    PreviousTrack()
    cb('ok')
end)

-- Callback para ajustar volume
RegisterNUICallback('setVolume', function(data, cb)
    local volume = tonumber(data.volume)
    SetVolume(volume)
    cb('ok')
end)

-- Callback para buscar músicas
RegisterNUICallback('search', function(data, cb)
    local query = data.query
    
    -- Enviar consulta ao servidor
    TriggerServerEvent('tokyo_box:searchTracks', query)
    
    -- Salvar na pesquisa recente
    if not TokyoBox.playerCache.recentSearches then
        TokyoBox.playerCache.recentSearches = {}
    end
    
    table.insert(TokyoBox.playerCache.recentSearches, 1, query)
    
    -- Limitar tamanho das pesquisas recentes
    if #TokyoBox.playerCache.recentSearches > Config.MaxRecentSearches then
        table.remove(TokyoBox.playerCache.recentSearches)
    end
    
    cb({
        status = "searching"
    })
end)

-- Callback para criar playlist
RegisterNUICallback('createPlaylist', function(data, cb)
    local name = data.name
    local description = data.description or ""
    
    -- Enviar ao servidor para criar playlist
    TriggerServerEvent('tokyo_box:createPlaylist', name, description)
    
    cb({
        status = "creating"
    })
end)

-- Callback para excluir playlist
RegisterNUICallback('deletePlaylist', function(data, cb)
    local playlistId = data.playlistId
    
    -- Enviar ao servidor para excluir playlist
    TriggerServerEvent('tokyo_box:deletePlaylist', playlistId)
    
    cb({
        status = "deleting"
    })
end)

-- Callback para adicionar música à playlist
RegisterNUICallback('addToPlaylist', function(data, cb)
    local trackId = data.trackId
    local playlistId = data.playlistId
    
    -- Enviar ao servidor para adicionar música
    TriggerServerEvent('tokyo_box:addTrackToPlaylist', trackId, playlistId)
    
    cb({
        status = "adding"
    })
end)

-- Callback para remover música da playlist
RegisterNUICallback('removeFromPlaylist', function(data, cb)
    local trackId = data.trackId
    local playlistId = data.playlistId
    
    -- Enviar ao servidor para remover música
    TriggerServerEvent('tokyo_box:removeTrackFromPlaylist', trackId, playlistId)
    
    cb({
        status = "removing"
    })
end)

-- Callback para adicionar música aos favoritos
RegisterNUICallback('addToFavorites', function(data, cb)
    local trackId = data.trackId
    
    -- Enviar ao servidor para adicionar aos favoritos
    TriggerServerEvent('tokyo_box:addToFavorites', trackId)
    
    cb({
        status = "adding"
    })
end)

-- Callback para remover música dos favoritos
RegisterNUICallback('removeFromFavorites', function(data, cb)
    local trackId = data.trackId
    
    -- Enviar ao servidor para remover dos favoritos
    TriggerServerEvent('tokyo_box:removeFromFavorites', trackId)
    
    cb({
        status = "removing"
    })
end)

-- Callback para reproduzir playlist
RegisterNUICallback('playPlaylist', function(data, cb)
    local playlistId = data.playlistId
    
    -- Solicitar playlist completa para reprodução
    TriggerServerEvent('tokyo_box:getPlaylistTracks', playlistId)
    
    cb({
        status = "loadingPlaylist"
    })
end)

-- Event handlers para receber dados de pesquisa do servidor
RegisterNetEvent('tokyo_box:receiveSearchResults')
AddEventHandler('tokyo_box:receiveSearchResults', function(results)
    SendNUIMessage({
        action = "updateSearchResults",
        results = results
    })
end)

-- Event handler para receber informações de uma música
RegisterNetEvent('tokyo_box:receiveTrackInfo')
AddEventHandler('tokyo_box:receiveTrackInfo', function(trackInfo)
    if trackInfo then
        -- Atualizar UI com informações da música
        SendNUIMessage({
            action = "updateCurrentTrack",
            track = trackInfo
        })
        
        -- Reproduzir a música
        PlayTrack(trackInfo)
    else
        -- Música não encontrada ou erro
        if Config.EnableNotifications then
            TriggerEvent('QBCore:Notify', Config.Texts.errorPlayback, 'error')
        end
    end
end)

-- Event handler para confirmações de operações
RegisterNetEvent('tokyo_box:notifyClient')
AddEventHandler('tokyo_box:notifyClient', function(message, type)
    if Config.EnableNotifications then
        TriggerEvent('QBCore:Notify', message, type or 'primary')
    end
    
    SendNUIMessage({
        action = "notification",
        message = message,
        type = type or 'info'
    })
end)

-- Event handler para atualização de playlists após modificações
RegisterNetEvent('tokyo_box:playlistUpdated')
AddEventHandler('tokyo_box:playlistUpdated', function(playlistId)
    -- Solicitar dados atualizados da playlist
    TriggerServerEvent('tokyo_box:getPlaylistTracks', playlistId)
end)

-- Event handler para receber faixas de uma playlist
RegisterNetEvent('tokyo_box:receivePlaylistTracks')
AddEventHandler('tokyo_box:receivePlaylistTracks', function(playlistId, tracks, playlistInfo)
    -- Guardar informações da playlist atual para navegação
    if playlistInfo and tracks and #tracks > 0 then
        TokyoBox.currentPlaylist = {
            id = playlistId,
            name = playlistInfo.name,
            tracks = tracks
        }
    end
    
    SendNUIMessage({
        action = "updatePlaylistTracks",
        playlistId = playlistId,
        tracks = tracks,
        playlistInfo = playlistInfo
    })
end)

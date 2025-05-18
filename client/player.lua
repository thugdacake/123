-- client/player.lua
-- Funções relacionadas à reprodução de música

-- Reproduzir faixa de música
function PlayTrack(trackInfo)
    -- Parar qualquer música que esteja tocando
    if TokyoBox.isPlaying and TokyoBox.currentTrack then
        StopTrack()
    end
    
    -- Atualizar informações da faixa atual
    TokyoBox.currentTrack = trackInfo
    TokyoBox.isPlaying = true
    
    -- Reproduzir áudio usando xSound se disponível
    if xSound and trackInfo.url then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if Config.Enable3DAudio then
            -- Reprodução 3D - outros jogadores podem ouvir
            local pos = GetEntityCoords(PlayerPedId())
            xSound:PlayUrlPos(trackId, trackInfo.url, TokyoBox.volume / 100, pos, false)
            xSound:Distance(trackId, Config.DefaultDistance)
            
            -- Atualizar posição do som 3D quando o jogador se move
            Citizen.CreateThread(function()
                while TokyoBox.isPlaying and TokyoBox.currentTrack and TokyoBox.currentTrack.id == trackInfo.id do
                    local playerPos = GetEntityCoords(PlayerPedId())
                    xSound:Position(trackId, playerPos)
                    Citizen.Wait(1000)
                end
            end)
        else
            -- Reprodução normal - apenas o jogador ouve
            xSound:PlayUrl(trackId, trackInfo.url, TokyoBox.volume / 100, false)
        end
    else
        -- Fallback para sistema de áudio nativo do FiveM se xSound não estiver disponível
        SendNUIMessage({
            action = "playAudio",
            track = trackInfo,
            volume = TokyoBox.volume
        })
    end
    
    -- Notificar UI que a reprodução começou
    SendNUIMessage({
        action = "updatePlaybackState",
        isPlaying = true,
        track = trackInfo
    })
end

-- Pausar faixa atual
function PauseTrack()
    if TokyoBox.isPlaying and TokyoBox.currentTrack then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if xSound then
            xSound:Pause(trackId)
        else
            -- Fallback para sistema de áudio na UI
            SendNUIMessage({
                action = "pauseAudio"
            })
        end
        
        TokyoBox.isPlaying = false
        
        -- Notificar UI que a reprodução está pausada
        SendNUIMessage({
            action = "updatePlaybackState",
            isPlaying = false
        })
    end
end

-- Retomar reprodução da faixa atual
function ResumeTrack()
    if not TokyoBox.isPlaying and TokyoBox.currentTrack then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if xSound then
            xSound:Resume(trackId)
        else
            -- Fallback para sistema de áudio na UI
            SendNUIMessage({
                action = "resumeAudio"
            })
        end
        
        TokyoBox.isPlaying = true
        
        -- Notificar UI que a reprodução foi retomada
        SendNUIMessage({
            action = "updatePlaybackState",
            isPlaying = true
        })
    end
end

-- Parar reprodução da faixa atual
function StopTrack()
    if TokyoBox.currentTrack then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if xSound then
            xSound:Destroy(trackId)
        else
            -- Fallback para sistema de áudio na UI
            SendNUIMessage({
                action = "stopAudio"
            })
        end
        
        TokyoBox.isPlaying = false
        
        -- Notificar UI que a reprodução foi interrompida
        SendNUIMessage({
            action = "updatePlaybackState",
            isPlaying = false
        })
    end
end

-- Próxima faixa na playlist
function NextTrack()
    if TokyoBox.currentPlaylist and TokyoBox.currentTrack then
        local tracks = TokyoBox.currentPlaylist.tracks
        local currentIndex = 0
        
        -- Encontrar índice da faixa atual
        for i, track in ipairs(tracks) do
            if track.id == TokyoBox.currentTrack.id then
                currentIndex = i
                break
            end
        end
        
        -- Próxima faixa ou volta para o início
        local nextIndex = currentIndex + 1
        if nextIndex > #tracks then
            nextIndex = 1
        end
        
        if tracks[nextIndex] then
            -- Solicitar informações da próxima faixa ao servidor
            TriggerServerEvent('tokyo_box:getTrackInfo', tracks[nextIndex].id)
        end
    end
end

-- Faixa anterior na playlist
function PreviousTrack()
    if TokyoBox.currentPlaylist and TokyoBox.currentTrack then
        local tracks = TokyoBox.currentPlaylist.tracks
        local currentIndex = 0
        
        -- Encontrar índice da faixa atual
        for i, track in ipairs(tracks) do
            if track.id == TokyoBox.currentTrack.id then
                currentIndex = i
                break
            end
        end
        
        -- Faixa anterior ou vai para o final
        local prevIndex = currentIndex - 1
        if prevIndex < 1 then
            prevIndex = #tracks
        end
        
        if tracks[prevIndex] then
            -- Solicitar informações da faixa anterior ao servidor
            TriggerServerEvent('tokyo_box:getTrackInfo', tracks[prevIndex].id)
        end
    end
end

-- Ajustar volume
function SetVolume(volumeLevel)
    -- Garantir que o volume está entre 0 e 100
    volumeLevel = math.max(0, math.min(100, volumeLevel))
    
    TokyoBox.volume = volumeLevel
    
    -- Aplicar volume no xSound
    if TokyoBox.isPlaying and TokyoBox.currentTrack then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if xSound then
            xSound:setVolume(trackId, volumeLevel / 100)
        else
            -- Fallback para ajuste de volume na UI
            SendNUIMessage({
                action = "setVolume",
                volume = volumeLevel
            })
        end
    end
    
    -- Salvar configurações de volume
    SavePlayerSettings()
    
    -- Notificar UI sobre mudança no volume
    SendNUIMessage({
        action = "updateVolume",
        volume = volumeLevel
    })
end

-- Manipular evento de reprodução de playlist
RegisterNetEvent('tokyo_box:playPlaylist')
AddEventHandler('tokyo_box:playPlaylist', function(playlist)
    if playlist and playlist.tracks and #playlist.tracks > 0 then
        -- Armazenar informações da playlist atual
        TokyoBox.currentPlaylist = playlist
        
        -- Iniciar reprodução da primeira faixa
        TriggerServerEvent('tokyo_box:getTrackInfo', playlist.tracks[1].id)
    else
        if Config.EnableNotifications then
            TriggerEvent('QBCore:Notify', 'Esta playlist está vazia', 'error')
        end
    end
end)

-- Manipular evento de atualização da duração da faixa
RegisterNUICallback('updateTrackDuration', function(data, cb)
    if TokyoBox.currentTrack then
        TokyoBox.currentTrack.duration = data.duration
    end
    cb('ok')
end)

-- Manipular evento de atualização da posição atual da faixa
RegisterNUICallback('updateTrackPosition', function(data, cb)
    if TokyoBox.currentTrack then
        TokyoBox.currentTrack.position = data.position
    end
    cb('ok')
end)

-- Manipular evento para definir posição da faixa (seek)
RegisterNUICallback('seekTrack', function(data, cb)
    local position = data.position
    
    if TokyoBox.isPlaying and TokyoBox.currentTrack then
        local trackId = "tokyo_box_" .. GetPlayerServerId(PlayerId())
        
        if xSound then
            xSound:setTimeStamp(trackId, position)
        else
            -- Fallback para seek na UI
            SendNUIMessage({
                action = "seekAudio",
                position = position
            })
        end
    end
    
    cb('ok')
end)

-- Evento quando uma faixa termina
RegisterNUICallback('trackEnded', function(data, cb)
    -- Automaticamente ir para a próxima faixa
    NextTrack()
    cb('ok')
end)

-- Exportar funções para outros recursos
exports('PlayTrack', PlayTrack)
exports('PauseTrack', PauseTrack)
exports('ResumeTrack', ResumeTrack)
exports('StopTrack', StopTrack)
exports('NextTrack', NextTrack)
exports('PreviousTrack', PreviousTrack)
exports('SetVolume', SetVolume)

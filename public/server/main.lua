-- server/main.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- Inicialização do servidor
Citizen.CreateThread(function()
    -- Inicializar banco de dados
    InitDatabase()
    
    print("Tokyo Box Server: Inicializado com sucesso!")
end)

-- Evento do jogador quando conecta
RegisterNetEvent('QBCore:Server:PlayerLoaded')
AddEventHandler('QBCore:Server:PlayerLoaded', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        -- Verificar se o jogador já existe no banco de dados
        CheckPlayerExists(Player.PlayerData.citizenid, Player.PlayerData.license)
    end
end)

-- Callback para verificação de permissão VIP
QBCore.Functions.CreateCallback('tokyo_box:checkVIP', function(source, cb)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        local hasVIP = false
        
        -- Verificar se o jogador pertence a um grupo VIP
        for _, group in ipairs(Config.VIPGroups) do
            if QBCore.Functions.HasPermission(src, group) then
                hasVIP = true
                break
            end
        end
        
        -- Verificar se o jogador tem flag VIP
        if not hasVIP and Player.PlayerData.metadata then
            for _, flag in ipairs(Config.VIPFlags) do
                if Player.PlayerData.metadata[flag] then
                    hasVIP = true
                    break
                end
            end
        end
        
        cb(hasVIP)
    else
        cb(false)
    end
end)

-- Obter dados do player
RegisterNetEvent('tokyo_box:getPlayerPlaylists')
AddEventHandler('tokyo_box:getPlayerPlaylists', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        GetPlayerPlaylists(src, Player.PlayerData.citizenid)
    end
end)

RegisterNetEvent('tokyo_box:getPlayerFavorites')
AddEventHandler('tokyo_box:getPlayerFavorites', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        GetPlayerFavorites(src, Player.PlayerData.citizenid)
    end
end)

RegisterNetEvent('tokyo_box:getPlayerSettings')
AddEventHandler('tokyo_box:getPlayerSettings', function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        GetPlayerSettings(src, Player.PlayerData.citizenid)
    end
end)

-- Salvar configurações do jogador
RegisterNetEvent('tokyo_box:savePlayerSettings')
AddEventHandler('tokyo_box:savePlayerSettings', function(settings)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        SavePlayerSettings(Player.PlayerData.citizenid, settings)
    end
end)

-- Gerenciamento de playlists
RegisterNetEvent('tokyo_box:createPlaylist')
AddEventHandler('tokyo_box:createPlaylist', function(name, description)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        CreatePlaylist(src, Player.PlayerData.citizenid, name, description)
    end
end)

RegisterNetEvent('tokyo_box:deletePlaylist')
AddEventHandler('tokyo_box:deletePlaylist', function(playlistId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        DeletePlaylist(src, Player.PlayerData.citizenid, playlistId)
    end
end)

RegisterNetEvent('tokyo_box:getPlaylistTracks')
AddEventHandler('tokyo_box:getPlaylistTracks', function(playlistId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        GetPlaylistTracks(src, playlistId)
    end
end)

-- Gerenciamento de músicas nas playlists
RegisterNetEvent('tokyo_box:addTrackToPlaylist')
AddEventHandler('tokyo_box:addTrackToPlaylist', function(trackId, playlistId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        AddTrackToPlaylist(src, Player.PlayerData.citizenid, trackId, playlistId)
    end
end)

RegisterNetEvent('tokyo_box:removeTrackFromPlaylist')
AddEventHandler('tokyo_box:removeTrackFromPlaylist', function(trackId, playlistId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        RemoveTrackFromPlaylist(src, Player.PlayerData.citizenid, trackId, playlistId)
    end
end)

-- Gerenciamento de favoritos
RegisterNetEvent('tokyo_box:addToFavorites')
AddEventHandler('tokyo_box:addToFavorites', function(trackId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        AddTrackToFavorites(src, Player.PlayerData.citizenid, trackId)
    end
end)

RegisterNetEvent('tokyo_box:removeFromFavorites')
AddEventHandler('tokyo_box:removeFromFavorites', function(trackId)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    
    if Player then
        RemoveTrackFromFavorites(src, Player.PlayerData.citizenid, trackId)
    end
end)

-- Busca de músicas
RegisterNetEvent('tokyo_box:searchTracks')
AddEventHandler('tokyo_box:searchTracks', function(query)
    local src = source
    SearchTracks(src, query)
end)

-- Obter informações de uma música
RegisterNetEvent('tokyo_box:getTrackInfo')
AddEventHandler('tokyo_box:getTrackInfo', function(trackId)
    local src = source
    GetTrackInfo(src, trackId)
end)

-- Enviar notificação ao cliente
function NotifyClient(source, message, type)
    TriggerClientEvent('tokyo_box:notifyClient', source, message, type)
end

-- Exportar funções para outros recursos
exports('NotifyClient', NotifyClient)

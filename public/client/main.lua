-- client/main.lua
local QBCore = exports['qb-core']:GetCoreObject()
TokyoBox = {
    isUIOpen = false,
    currentTrack = nil,
    currentPlaylist = nil,
    volume = Config.DefaultVolume,
    isPlaying = false,
    playerCache = {}
}

-- Carregar biblioteca de som (xSound)
-- Verificar se xSound está disponível ou usar a implementação nativa do FiveM
local xSound = nil
if GetResourceState('xsound') ~= 'missing' then
    xSound = exports.xsound
end

-- Inicialização
Citizen.CreateThread(function()
    -- Registrar comando para abrir o player
    RegisterCommand(Config.CommandName, function()
        ToggleTokyoBox()
    end, false)
    
    -- Registrar keybind para abrir/fechar o player
    RegisterKeyMapping(Config.CommandName, 'Abrir Tokyo Box', 'keyboard', Config.ToggleKeybind)
    
    -- Inicializar cache de dados do player
    InitPlayerCache()
    
    print("Tokyo Box: Inicializado com sucesso!")
end)

-- Função para abrir/fechar o Tokyo Box
function ToggleTokyoBox()
    if TokyoBox.isUIOpen then
        CloseTokyoBox()
    else
        OpenTokyoBox()
    end
end

-- Função para abrir o Tokyo Box
function OpenTokyoBox()
    -- Verificar permissão VIP
    if Config.RequireVIP then
        CheckVipPermission(function(hasPermission)
            if hasPermission then
                -- Abrir a UI
                TokyoBox.isUIOpen = true
                SetNuiFocus(true, true)
                SendNUIMessage({
                    action = "open",
                    volume = TokyoBox.volume
                })
                
                -- Carregar dados do player (playlists, etc)
                LoadPlayerData()
            else
                -- Notificar que o acesso é apenas para VIPs
                if Config.EnableNotifications then
                    TriggerEvent('QBCore:Notify', Config.Texts.noAccess, 'error')
                end
                print("Tokyo Box: Acesso negado - Apenas VIPs podem acessar o player")
            end
        end)
    else
        -- Se não precisa ser VIP, abrir direto
        TokyoBox.isUIOpen = true
        SetNuiFocus(true, true)
        SendNUIMessage({
            action = "open",
            volume = TokyoBox.volume
        })
        
        -- Carregar dados do player (playlists, etc)
        LoadPlayerData()
    end
end

-- Função para fechar o Tokyo Box
function CloseTokyoBox()
    TokyoBox.isUIOpen = false
    SetNuiFocus(false, false)
    SendNUIMessage({
        action = "close"
    })
    
    -- Salvar configurações do player (volume, última música, etc)
    SavePlayerSettings()
end

-- Função para inicializar o cache de dados do player
function InitPlayerCache()
    TokyoBox.playerCache = {
        playlists = {},
        favorites = {},
        recentSearches = {},
        lastPlayed = nil
    }
end

-- Função para carregar dados do player do servidor
function LoadPlayerData()
    -- Solicitar playlists do servidor
    TriggerServerEvent('tokyo_box:getPlayerPlaylists')
    
    -- Solicitar favoritos do servidor
    TriggerServerEvent('tokyo_box:getPlayerFavorites')
    
    -- Solicitar configurações do player
    TriggerServerEvent('tokyo_box:getPlayerSettings')
end

-- Função para salvar configurações do player no servidor
function SavePlayerSettings()
    local settings = {
        volume = TokyoBox.volume,
        lastPlayed = TokyoBox.currentTrack,
        lastPosition = TokyoBox.currentTrack and TokyoBox.currentTrack.position or 0
    }
    
    TriggerServerEvent('tokyo_box:savePlayerSettings', settings)
end

-- Event handlers para receber dados do servidor
RegisterNetEvent('tokyo_box:receivePlayerPlaylists')
AddEventHandler('tokyo_box:receivePlayerPlaylists', function(playlists)
    TokyoBox.playerCache.playlists = playlists
    SendNUIMessage({
        action = "updatePlaylists",
        playlists = playlists
    })
end)

RegisterNetEvent('tokyo_box:receivePlayerFavorites')
AddEventHandler('tokyo_box:receivePlayerFavorites', function(favorites)
    TokyoBox.playerCache.favorites = favorites
    SendNUIMessage({
        action = "updateFavorites",
        favorites = favorites
    })
end)

RegisterNetEvent('tokyo_box:receivePlayerSettings')
AddEventHandler('tokyo_box:receivePlayerSettings', function(settings)
    if settings then
        if settings.volume then
            TokyoBox.volume = settings.volume
        end
        TokyoBox.lastPlayed = settings.lastPlayed
        
        SendNUIMessage({
            action = "updateSettings",
            settings = settings
        })
        
        -- Se houver uma última música tocada, carregar suas informações
        if settings.lastPlayed and settings.lastPlayed.id then
            TriggerServerEvent('tokyo_box:getTrackInfo', settings.lastPlayed.id)
        end
    end
end)

-- Exportar funções para outros recursos
exports('ToggleTokyoBox', ToggleTokyoBox)
exports('IsOpen', function() return TokyoBox.isUIOpen end)

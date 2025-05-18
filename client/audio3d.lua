-- client/audio3d.lua
-- Implementação do sistema de áudio 3D para o Tokyo Box

local TokyoBox3DAudio = {
    equalizerEnabled = false,
    spatialAudioEnabled = false,
    currentPreset = "flat",
    customPreset = nil,
    roomSize = 50,
    reverbLevel = 30,
    position = {x = 0, y = 0}, -- coordenadas centrais
    
    -- Definições das bandas do equalizador
    bands = {
        {freq = "32", value = 0, display = "32Hz"},
        {freq = "64", value = 0, display = "64Hz"},
        {freq = "125", value = 0, display = "125Hz"},
        {freq = "250", value = 0, display = "250Hz"},
        {freq = "500", value = 0, display = "500Hz"},
        {freq = "1k", value = 0, display = "1kHz"},
        {freq = "2k", value = 0, display = "2kHz"},
        {freq = "4k", value = 0, display = "4kHz"},
        {freq = "8k", value = 0, display = "8kHz"},
        {freq = "16k", value = 0, display = "16kHz"}
    },
    
    -- Configurações de presets do equalizador
    presets = {
        flat = {0, 0, 0, 0, 0, 0, 0, 0, 0, 0},
        rock = {4, 3, 2, 0, -1, -1, 0, 2, 3, 4},
        pop = {-2, -1, 0, 2, 4, 4, 2, 0, -1, -2},
        jazz = {3, 2, 1, 2, -2, -2, 0, 1, 2, 3},
        electronic = {4, 3, 0, -2, -4, -4, -2, 0, 3, 4},
        classical = {3, 2, 1, 0, 0, 0, 0, 1, 2, 3},
        hiphop = {4, 4, 2, 0, -2, -1, 0, 1, 3, 2}
    }
}

-- Inicialização
Citizen.CreateThread(function()
    print("Tokyo Box 3D Audio: Inicializando módulo de áudio...")
    Wait(1000)
    SendNUIMessage({
        action = "init3DAudio"
    })
    print("Tokyo Box 3D Audio: Módulo inicializado!")
end)

-- Callbacks do NUI
RegisterNUICallback('eq_preset', function(data, cb)
    local presetName = data.preset
    
    if presetName == "custom" and TokyoBox3DAudio.customPreset then
        -- Aplicar preset personalizado se disponível
        TokyoBox3DAudio.currentPreset = "custom"
        for i, band in ipairs(TokyoBox3DAudio.bands) do
            band.value = TokyoBox3DAudio.customPreset[i]
        end
    elseif TokyoBox3DAudio.presets[presetName] then
        -- Aplicar preset predefinido
        TokyoBox3DAudio.currentPreset = presetName
        for i, band in ipairs(TokyoBox3DAudio.bands) do
            band.value = TokyoBox3DAudio.presets[presetName][i]
        end
    else
        cb({
            status = "error",
            message = "Preset não encontrado"
        })
        return
    end
    
    -- Aplicar as configurações do equalizador
    ApplyEQSettings()
    
    cb({
        status = "success",
        currentPreset = TokyoBox3DAudio.currentPreset,
        bands = TokyoBox3DAudio.bands
    })
end)

RegisterNUICallback('eq_band_change', function(data, cb)
    local bandIndex = data.band
    local value = data.value
    
    if bandIndex >= 1 and bandIndex <= #TokyoBox3DAudio.bands then
        TokyoBox3DAudio.bands[bandIndex].value = value
        
        -- Se alterando valores, definir preset como personalizado
        TokyoBox3DAudio.currentPreset = "custom"
        TokyoBox3DAudio.customPreset = {}
        
        for i, band in ipairs(TokyoBox3DAudio.bands) do
            TokyoBox3DAudio.customPreset[i] = band.value
        end
        
        -- Aplicar as configurações de EQ
        ApplyEQSettings()
        
        cb({
            status = "success",
            currentPreset = "custom"
        })
    else
        cb({
            status = "error",
            message = "Índice de banda inválido"
        })
    end
end)

RegisterNUICallback('save_custom_preset', function(data, cb)
    -- Salvar valores atuais das bandas
    TokyoBox3DAudio.customPreset = {}
    for i, band in ipairs(TokyoBox3DAudio.bands) do
        TokyoBox3DAudio.customPreset[i] = band.value
    end
    
    TokyoBox3DAudio.currentPreset = "custom"
    
    -- Salvar configuração no servidor para persistência (opcional)
    TriggerServerEvent('tokyo_box:saveEqualizerPreset', TokyoBox3DAudio.customPreset)
    
    cb({
        status = "success",
        message = "Preset personalizado salvo"
    })
end)

RegisterNUICallback('toggle_spatial_audio', function(data, cb)
    TokyoBox3DAudio.spatialAudioEnabled = data.enabled
    
    -- Aplicar configurações de áudio espacial
    ApplySpatialAudioSettings()
    
    cb({
        status = "success",
        spatialAudioEnabled = TokyoBox3DAudio.spatialAudioEnabled
    })
end)

RegisterNUICallback('set_room_size', function(data, cb)
    TokyoBox3DAudio.roomSize = data.size
    
    -- Aplicar configurações de áudio espacial
    ApplySpatialAudioSettings()
    
    cb({
        status = "success",
        roomSize = TokyoBox3DAudio.roomSize
    })
end)

RegisterNUICallback('set_reverb_level', function(data, cb)
    TokyoBox3DAudio.reverbLevel = data.level
    
    -- Aplicar configurações de áudio espacial
    ApplySpatialAudioSettings()
    
    cb({
        status = "success",
        reverbLevel = TokyoBox3DAudio.reverbLevel
    })
end)

RegisterNUICallback('set_sound_position', function(data, cb)
    TokyoBox3DAudio.position = {
        x = data.x,
        y = data.y
    }
    
    -- Aplicar configurações de áudio espacial
    ApplySpatialAudioSettings()
    
    cb({
        status = "success",
        position = TokyoBox3DAudio.position
    })
end)

-- Funções auxiliares
function ApplyEQSettings()
    if not TokyoBox.isUIOpen then return end
    
    -- Log dos valores atuais do EQ (para debugging)
    local eqValues = {}
    for i, band in ipairs(TokyoBox3DAudio.bands) do
        eqValues[i] = band.value
    end
    
    -- Aplicar ao xSound se disponível
    if xSound then
        local soundId = "tokyo_box_music"
        if xSound:soundExists(soundId) then
            -- xSound não tem API de EQ nativa, mas poderia ser implementada com filtros
            -- Esta é uma implementação simulada
            xSound:setEffectEnabled(soundId, "equalizer", true)
            -- Em uma implementação real, enviaria os valores das bandas
        end
    end
    
    -- Notificar a NUI das configurações atualizadas
    SendNUIMessage({
        action = "update_eq_settings",
        currentPreset = TokyoBox3DAudio.currentPreset,
        bands = TokyoBox3DAudio.bands
    })
    
    -- Registrar alteração para salvar nas configurações do jogador (opcional)
    TriggerServerEvent('tokyo_box:updatePlayerEqualizer', {
        preset = TokyoBox3DAudio.currentPreset,
        bands = eqValues
    })
end

function ApplySpatialAudioSettings()
    if not TokyoBox.isUIOpen then return end
    
    -- Aplicar ao xSound se disponível
    if xSound then
        local soundId = "tokyo_box_music"
        if xSound:soundExists(soundId) then
            -- Ativar/desativar efeitos 3D
            if TokyoBox3DAudio.spatialAudioEnabled then
                -- Em implementação real, ajustaria o tamanho da sala e reverberação
                xSound:setEffectEnabled(soundId, "reverb", true)
                xSound:setEffectParameter(soundId, "reverb", "roomSize", TokyoBox3DAudio.roomSize / 100)
                xSound:setEffectParameter(soundId, "reverb", "wetLevel", TokyoBox3DAudio.reverbLevel / 100)
                
                -- Posicionamento 3D do som baseado nas coordenadas
                local playerPos = GetEntityCoords(PlayerPedId())
                local soundPos = {
                    x = playerPos.x + TokyoBox3DAudio.position.x * 5, -- Multiplicar por um valor para ter um efeito mais pronunciado
                    y = playerPos.y + TokyoBox3DAudio.position.y * 5,
                    z = playerPos.z
                }
                
                xSound:Position(soundId, soundPos.x, soundPos.y, soundPos.z)
            else
                -- Desativar efeitos 3D
                xSound:setEffectEnabled(soundId, "reverb", false)
                
                -- Reposicionar som para sempre seguir o jogador
                local playerPos = GetEntityCoords(PlayerPedId())
                xSound:Position(soundId, playerPos.x, playerPos.y, playerPos.z)
            end
        end
    end
    
    -- Notificar a NUI das configurações atualizadas
    SendNUIMessage({
        action = "update_spatial_settings",
        spatialAudioEnabled = TokyoBox3DAudio.spatialAudioEnabled,
        roomSize = TokyoBox3DAudio.roomSize,
        reverbLevel = TokyoBox3DAudio.reverbLevel,
        position = TokyoBox3DAudio.position
    })
    
    -- Registrar alteração para salvar nas configurações do jogador (opcional)
    TriggerServerEvent('tokyo_box:updatePlayer3DAudio', {
        enabled = TokyoBox3DAudio.spatialAudioEnabled,
        roomSize = TokyoBox3DAudio.roomSize,
        reverbLevel = TokyoBox3DAudio.reverbLevel,
        position = TokyoBox3DAudio.position
    })
end

-- Eventos do servidor
RegisterNetEvent('tokyo_box:loadEqualizerSettings')
AddEventHandler('tokyo_box:loadEqualizerSettings', function(settings)
    if settings then
        if settings.preset then
            if settings.preset == "custom" and settings.bands then
                TokyoBox3DAudio.currentPreset = "custom"
                TokyoBox3DAudio.customPreset = settings.bands
                
                for i, band in ipairs(TokyoBox3DAudio.bands) do
                    if i <= #settings.bands then
                        band.value = settings.bands[i]
                    end
                end
            elseif TokyoBox3DAudio.presets[settings.preset] then
                TokyoBox3DAudio.currentPreset = settings.preset
                
                for i, band in ipairs(TokyoBox3DAudio.bands) do
                    band.value = TokyoBox3DAudio.presets[settings.preset][i]
                end
            end
        end
        
        -- Aplicar configurações carregadas
        ApplyEQSettings()
    end
end)

RegisterNetEvent('tokyo_box:load3DAudioSettings')
AddEventHandler('tokyo_box:load3DAudioSettings', function(settings)
    if settings then
        if settings.enabled ~= nil then
            TokyoBox3DAudio.spatialAudioEnabled = settings.enabled
        end
        
        if settings.roomSize ~= nil then
            TokyoBox3DAudio.roomSize = settings.roomSize
        end
        
        if settings.reverbLevel ~= nil then
            TokyoBox3DAudio.reverbLevel = settings.reverbLevel
        end
        
        if settings.position ~= nil then
            TokyoBox3DAudio.position = settings.position
        end
        
        -- Aplicar configurações carregadas
        ApplySpatialAudioSettings()
    end
end)

-- Exportar funções para outros scripts
exports('IsEQEnabled', function()
    return TokyoBox3DAudio.equalizerEnabled
end)

exports('Is3DAudioEnabled', function()
    return TokyoBox3DAudio.spatialAudioEnabled
end)

exports('GetCurrentEQPreset', function()
    return TokyoBox3DAudio.currentPreset
end)
-- client/bluetooth.lua
-- Implementação de funcionalidade Bluetooth virtual para Tokyo Box
local TokyoBoxBluetooth = {
    isEnabled = false,
    discoverable = false,
    autoAccept = false,
    bluetoothRange = 50,
    connectedDevices = {},
    nearbyDevices = {}
}

-- Inicialização
Citizen.CreateThread(function()
    print("Tokyo Box Bluetooth: Inicializando módulo...")
    Wait(1000)
    SendNUIMessage({
        action = "initBluetooth"
    })
    print("Tokyo Box Bluetooth: Módulo inicializado!")
end)

-- Callbacks do NUI
RegisterNUICallback('bluetooth_toggle', function(data, cb)
    TokyoBoxBluetooth.isEnabled = data.enabled
    
    -- Notificar outros jogadores da mudança (se estiver em um servidor)
    TriggerServerEvent('tokyo_box:bluetoothStateChanged', TokyoBoxBluetooth.isEnabled)
    
    cb({
        status = "success",
        currentState = TokyoBoxBluetooth.isEnabled
    })
end)

RegisterNUICallback('bluetooth_discoverable', function(data, cb)
    TokyoBoxBluetooth.discoverable = data.discoverable
    
    -- Notificar outros jogadores que estamos descobríveis
    if TokyoBoxBluetooth.isEnabled then
        TriggerServerEvent('tokyo_box:setDiscoverable', TokyoBoxBluetooth.discoverable)
    end
    
    cb({
        status = "success",
        currentState = TokyoBoxBluetooth.discoverable
    })
end)

RegisterNUICallback('bluetooth_autoaccept', function(data, cb)
    TokyoBoxBluetooth.autoAccept = data.autoAccept
    cb({
        status = "success",
        currentState = TokyoBoxBluetooth.autoAccept
    })
end)

RegisterNUICallback('bluetooth_range', function(data, cb)
    TokyoBoxBluetooth.bluetoothRange = data.range
    
    -- Atualizar a lista de dispositivos próximos com base no novo alcance
    if TokyoBoxBluetooth.isEnabled then
        RefreshNearbyDevices()
    end
    
    cb({
        status = "success",
        currentRange = TokyoBoxBluetooth.bluetoothRange
    })
end)

RegisterNUICallback('bluetooth_refresh', function(data, cb)
    if TokyoBoxBluetooth.isEnabled then
        RefreshNearbyDevices()
        cb({
            status = "success"
        })
    else
        cb({
            status = "error",
            message = "Bluetooth não está habilitado"
        })
    end
end)

RegisterNUICallback('bluetooth_connect', function(data, cb)
    if not TokyoBoxBluetooth.isEnabled then
        cb({
            status = "error",
            message = "Bluetooth não está habilitado"
        })
        return
    end
    
    local deviceId = data.deviceId
    local device = FindDeviceById(deviceId)
    
    if device then
        -- Simular o tempo de conexão (entre 1-3 segundos)
        local connectionTime = math.random(1000, 3000)
        
        -- Notificar a UI que estamos tentando conectar
        SendNUIMessage({
            action = "bluetooth_connecting",
            device = device
        })
        
        -- Simular o processo de conexão
        Citizen.SetTimeout(connectionTime, function()
            -- Chance de 80% de sucesso na conexão
            local success = (math.random() < 0.8)
            
            if success then
                -- Adicionar à lista de dispositivos conectados
                table.insert(TokyoBoxBluetooth.connectedDevices, device)
                
                -- Remover da lista de dispositivos próximos
                for i, d in ipairs(TokyoBoxBluetooth.nearbyDevices) do
                    if d.id == deviceId then
                        table.remove(TokyoBoxBluetooth.nearbyDevices, i)
                        break
                    end
                end
                
                -- Se for um jogador real, notificar servidor
                if device.isPlayer then
                    TriggerServerEvent('tokyo_box:bluetoothConnected', device.playerId)
                end
                
                -- Notificar UI de sucesso
                SendNUIMessage({
                    action = "bluetooth_connected",
                    device = device,
                    success = true
                })
            else
                -- Notificar UI de falha
                SendNUIMessage({
                    action = "bluetooth_connected",
                    device = device,
                    success = false,
                    errorMessage = "Falha na conexão: Dispositivo não respondeu"
                })
            end
        end)
        
        cb({
            status = "connecting"
        })
    else
        cb({
            status = "error",
            message = "Dispositivo não encontrado"
        })
    end
end)

RegisterNUICallback('bluetooth_disconnect', function(data, cb)
    local deviceId = data.deviceId
    local device = nil
    
    -- Procurar o dispositivo na lista de conectados
    for i, d in ipairs(TokyoBoxBluetooth.connectedDevices) do
        if d.id == deviceId then
            device = d
            table.remove(TokyoBoxBluetooth.connectedDevices, i)
            
            -- Adicionar de volta à lista de dispositivos próximos
            table.insert(TokyoBoxBluetooth.nearbyDevices, {
                id = device.id,
                name = device.name,
                type = device.type,
                batteryLevel = device.batteryLevel,
                signalStrength = device.signalStrength,
                distance = device.distance,
                isPlayer = device.isPlayer,
                playerId = device.playerId
            })
            
            -- Se for um jogador real, notificar servidor
            if device.isPlayer then
                TriggerServerEvent('tokyo_box:bluetoothDisconnected', device.playerId)
            end
            
            break
        end
    end
    
    if device then
        cb({
            status = "success"
        })
    else
        cb({
            status = "error",
            message = "Dispositivo não encontrado ou não está conectado"
        })
    end
end)

-- Eventos do servidor
RegisterNetEvent('tokyo_box:updateNearbyDevices')
AddEventHandler('tokyo_box:updateNearbyDevices', function(players)
    -- Só processar se o Bluetooth estiver ativado
    if not TokyoBoxBluetooth.isEnabled then return end
    
    -- Filtrar jogadores próximos com base no alcance Bluetooth
    local nearbyPlayers = {}
    local playerPed = PlayerPedId()
    local playerCoords = GetEntityCoords(playerPed)
    
    for _, player in pairs(players) do
        if player.source ~= GetPlayerServerId(PlayerId()) then -- Não incluir a si mesmo
            local targetPed = GetPlayerPed(GetPlayerFromServerId(player.source))
            if DoesEntityExist(targetPed) then
                local targetCoords = GetEntityCoords(targetPed)
                local distance = #(playerCoords - targetCoords)
                
                if distance <= TokyoBoxBluetooth.bluetoothRange then
                    local deviceInfo = {
                        id = "player_" .. player.source,
                        name = player.name .. "'s Phone",
                        type = "phone",
                        batteryLevel = math.random(20, 100),
                        signalStrength = math.max(0, math.floor(100 - (distance / TokyoBoxBluetooth.bluetoothRange * 100))),
                        distance = math.floor(distance),
                        isPlayer = true,
                        playerId = player.source
                    }
                    
                    table.insert(nearbyPlayers, deviceInfo)
                end
            end
        end
    end
    
    -- Combinar com dispositivos simulados
    TokyoBoxBluetooth.nearbyDevices = nearbyPlayers
    
    -- Adicionar alguns dispositivos simulados aleatórios
    local simulatedDevices = GenerateSimulatedDevices()
    for _, device in ipairs(simulatedDevices) do
        table.insert(TokyoBoxBluetooth.nearbyDevices, device)
    end
    
    -- Enviar a lista atualizada para a UI
    SendNUIMessage({
        action = "bluetooth_nearbyDevices",
        devices = TokyoBoxBluetooth.nearbyDevices
    })
end)

RegisterNetEvent('tokyo_box:incomingConnection')
AddEventHandler('tokyo_box:incomingConnection', function(sourcePlayer)
    if not TokyoBoxBluetooth.isEnabled then
        -- Rejeitar automaticamente se bluetooth desligado
        TriggerServerEvent('tokyo_box:rejectConnection', sourcePlayer)
        return
    end
    
    local sourcePlayerInfo = {
        id = "player_" .. sourcePlayer,
        name = GetPlayerName(GetPlayerFromServerId(sourcePlayer)) .. "'s Phone",
        type = "phone"
    }
    
    -- Auto-aceitar se configurado
    if TokyoBoxBluetooth.autoAccept then
        TriggerServerEvent('tokyo_box:acceptConnection', sourcePlayer)
        
        -- Adicionar à lista de dispositivos conectados
        table.insert(TokyoBoxBluetooth.connectedDevices, sourcePlayerInfo)
        
        -- Notificar a UI
        SendNUIMessage({
            action = "bluetooth_autoAccepted",
            device = sourcePlayerInfo
        })
    else
        -- Mostrar solicitação na UI
        SendNUIMessage({
            action = "bluetooth_connectionRequest",
            device = sourcePlayerInfo
        })
    end
end)

-- Funções auxiliares
function RefreshNearbyDevices()
    -- Solicitar jogadores próximos ao servidor
    TriggerServerEvent('tokyo_box:requestNearbyPlayers')
end

function FindDeviceById(deviceId)
    for _, device in ipairs(TokyoBoxBluetooth.nearbyDevices) do
        if device.id == deviceId then
            return device
        end
    end
    return nil
end

function GenerateSimulatedDevices()
    local devices = {}
    
    -- Tipos de dispositivos e marcas possíveis
    local deviceTypes = {"phone", "tablet", "laptop", "headset", "speaker"}
    local deviceBrands = {"Samsung", "Apple", "Sony", "JBL", "Bose", "Motorola", "LG"}
    
    -- Gerar alguns dispositivos aleatórios
    local numDevices = math.random(0, 5)
    for i = 1, numDevices do
        local type = deviceTypes[math.random(1, #deviceTypes)]
        local brand = deviceBrands[math.random(1, #deviceBrands)]
        local distance = math.random(5, TokyoBoxBluetooth.bluetoothRange)
        
        table.insert(devices, {
            id = "simulated_" .. i .. "_" .. os.time(),
            name = brand .. " " .. type:gsub("^%l", string.upper),
            type = type,
            batteryLevel = math.random(20, 100),
            signalStrength = math.max(0, math.floor(100 - (distance / TokyoBoxBluetooth.bluetoothRange * 100))),
            distance = distance,
            isPlayer = false
        })
    end
    
    return devices
end

-- Exportar funções para outros scripts
exports('IsBluetoothEnabled', function()
    return TokyoBoxBluetooth.isEnabled
end)

exports('GetConnectedDevices', function()
    return TokyoBoxBluetooth.connectedDevices
end)
-- client/group_session.lua
-- Implementação de sessões de grupo para o Tokyo Box

local TokyoBoxGroupSession = {
    isActive = false,
    sessionId = nil,
    sessionCode = nil,
    role = nil, -- 'host', 'dj', ou 'listener'
    members = {},
    djMode = false,
    messages = {},
    
    -- Constantes para os tipos de role
    ROLE_HOST = "host",
    ROLE_DJ = "dj",
    ROLE_LISTENER = "listener"
}

-- Inicialização
Citizen.CreateThread(function()
    print("Tokyo Box Group Session: Inicializando módulo...")
    Wait(1000)
    SendNUIMessage({
        action = "initGroupSession"
    })
    print("Tokyo Box Group Session: Módulo inicializado!")
end)

-- Callbacks do NUI
RegisterNUICallback('create_session', function(data, cb)
    -- Verificar se o Bluetooth está ativo
    if exports["tokyo_box"]:IsBluetoothEnabled() then
        -- Gerar um ID de sessão (normalmente viria do servidor)
        local sessionId = GenerateSessionId()
        -- Gerar um código de sessão legível para humanos
        local sessionCode = GenerateSessionCode()
        
        -- Iniciar a sessão
        TokyoBoxGroupSession.isActive = true
        TokyoBoxGroupSession.sessionId = sessionId
        TokyoBoxGroupSession.sessionCode = sessionCode
        TokyoBoxGroupSession.role = TokyoBoxGroupSession.ROLE_HOST
        TokyoBoxGroupSession.members = {
            {
                id = GetPlayerServerId(PlayerId()),
                name = "Você (Host)",
                role = TokyoBoxGroupSession.ROLE_HOST,
                device = "Este dispositivo"
            }
        }
        TokyoBoxGroupSession.messages = {}
        
        -- Notificar o servidor sobre a nova sessão
        TriggerServerEvent('tokyo_box:createGroupSession', {
            sessionId = sessionId,
            sessionCode = sessionCode
        })
        
        -- Adicionar mensagem de boas-vindas
        AddSystemMessage("Sessão de grupo criada. Compartilhe o código com outras pessoas para deixá-las participar!")
        
        cb({
            status = "success",
            sessionId = sessionId,
            sessionCode = sessionCode
        })
    else
        cb({
            status = "error",
            message = "Bluetooth deve estar habilitado para sessões de grupo"
        })
    end
end)

RegisterNUICallback('join_session', function(data, cb)
    -- Verificar se o Bluetooth está ativo
    if not exports["tokyo_box"]:IsBluetoothEnabled() then
        cb({
            status = "error",
            message = "Bluetooth deve estar habilitado para sessões de grupo"
        })
        return
    end
    
    local sessionCode = data.sessionCode
    
    -- Em um app real, isso verificaria o código da sessão com o servidor
    -- Para fins de demonstração, aceitaremos qualquer código
    TriggerServerEvent('tokyo_box:joinGroupSession', sessionCode)
    
    -- Responder imediatamente e a lógica completa será tratada no evento do servidor
    cb({
        status = "joining",
        message = "Tentando entrar na sessão..."
    })
end)

RegisterNUICallback('leave_session', function(data, cb)
    if not TokyoBoxGroupSession.isActive then
        cb({
            status = "error",
            message = "Não há sessão ativa"
        })
        return
    end
    
    -- Notificar o servidor que estamos saindo
    TriggerServerEvent('tokyo_box:leaveGroupSession', TokyoBoxGroupSession.sessionId)
    
    -- Resetar o estado
    ResetSessionState()
    
    cb({
        status = "success",
        message = "Você saiu da sessão"
    })
end)

RegisterNUICallback('toggle_dj_mode', function(data, cb)
    if not TokyoBoxGroupSession.isActive then
        cb({
            status = "error",
            message = "Não há sessão ativa"
        })
        return
    end
    
    -- Apenas hosts e DJs podem usar o modo DJ
    if TokyoBoxGroupSession.role ~= TokyoBoxGroupSession.ROLE_HOST and 
       TokyoBoxGroupSession.role ~= TokyoBoxGroupSession.ROLE_DJ then
        cb({
            status = "error",
            message = "Apenas hosts e DJs podem usar o modo DJ"
        })
        return
    end
    
    local enableDJ = data.enable
    TokyoBoxGroupSession.djMode = enableDJ
    
    -- Notificar o servidor da mudança
    TriggerServerEvent('tokyo_box:toggleDJMode', {
        sessionId = TokyoBoxGroupSession.sessionId,
        enabled = enableDJ
    })
    
    -- Se estiver ativando o modo DJ, adicionar uma mensagem
    if enableDJ then
        AddSystemMessage("Modo DJ ativado! Você agora controla a música para todos.")
    end
    
    cb({
        status = "success",
        djMode = TokyoBoxGroupSession.djMode
    })
end)

RegisterNUICallback('send_chat_message', function(data, cb)
    if not TokyoBoxGroupSession.isActive then
        cb({
            status = "error",
            message = "Não há sessão ativa"
        })
        return
    end
    
    local messageText = data.message
    if messageText and string.len(messageText) > 0 then
        -- Adicionar a mensagem localmente
        table.insert(TokyoBoxGroupSession.messages, {
            id = os.time(),
            senderId = GetPlayerServerId(PlayerId()),
            senderName = "Você",
            message = messageText,
            timestamp = os.time()
        })
        
        -- Enviar a mensagem para todos na sessão
        TriggerServerEvent('tokyo_box:sendSessionMessage', {
            sessionId = TokyoBoxGroupSession.sessionId,
            message = messageText
        })
        
        -- Atualizar a UI
        UpdateChatUI()
        
        cb({
            status = "success"
        })
    else
        cb({
            status = "error",
            message = "Mensagem vazia"
        })
    end
end)

-- Eventos do servidor
RegisterNetEvent('tokyo_box:sessionCreated')
AddEventHandler('tokyo_box:sessionCreated', function(session)
    if session and session.sessionId == TokyoBoxGroupSession.sessionId then
        -- Atualizar a UI
        SendNUIMessage({
            action = "session_created",
            session = session
        })
    end
end)

RegisterNetEvent('tokyo_box:joinedSession')
AddEventHandler('tokyo_box:joinedSession', function(session)
    if session then
        -- Configurar o estado da sessão
        TokyoBoxGroupSession.isActive = true
        TokyoBoxGroupSession.sessionId = session.sessionId
        TokyoBoxGroupSession.sessionCode = session.sessionCode
        TokyoBoxGroupSession.role = TokyoBoxGroupSession.ROLE_LISTENER -- Por padrão, novos membros são ouvintes
        TokyoBoxGroupSession.members = session.members or {}
        TokyoBoxGroupSession.messages = session.messages or {}
        
        -- Adicionar mensagens de boas-vindas
        AddSystemMessage("Você entrou na sessão de grupo. Aproveite a música juntos!")
        
        -- Atualizar a UI
        SendNUIMessage({
            action = "session_joined",
            session = session
        })
        
        -- Atualizar a UI de chat
        UpdateChatUI()
    end
end)

RegisterNetEvent('tokyo_box:sessionMemberJoined')
AddEventHandler('tokyo_box:sessionMemberJoined', function(member)
    if TokyoBoxGroupSession.isActive then
        -- Adicionar o novo membro à lista
        table.insert(TokyoBoxGroupSession.members, member)
        
        -- Adicionar uma mensagem de sistema sobre o novo membro
        AddSystemMessage(member.name .. " entrou na sessão.")
        
        -- Atualizar a UI
        UpdateMembersUI()
    end
end)

RegisterNetEvent('tokyo_box:sessionMemberLeft')
AddEventHandler('tokyo_box:sessionMemberLeft', function(memberId)
    if TokyoBoxGroupSession.isActive then
        -- Encontrar o membro na lista
        local memberName = nil
        for i, member in ipairs(TokyoBoxGroupSession.members) do
            if member.id == memberId then
                memberName = member.name
                table.remove(TokyoBoxGroupSession.members, i)
                break
            end
        end
        
        if memberName then
            -- Adicionar uma mensagem de sistema
            AddSystemMessage(memberName .. " saiu da sessão.")
            
            -- Atualizar a UI
            UpdateMembersUI()
        end
    end
end)

RegisterNetEvent('tokyo_box:sessionEnded')
AddEventHandler('tokyo_box:sessionEnded', function(sessionId)
    if TokyoBoxGroupSession.isActive and TokyoBoxGroupSession.sessionId == sessionId then
        -- Adicionar mensagem de sistema
        AddSystemMessage("Sessão encerrada pelo host.")
        
        -- Atualizar a UI antes de resetar
        SendNUIMessage({
            action = "session_ended"
        })
        
        -- Resetar o estado
        ResetSessionState()
    end
end)

RegisterNetEvent('tokyo_box:receiveSessionMessage')
AddEventHandler('tokyo_box:receiveSessionMessage', function(messageData)
    if TokyoBoxGroupSession.isActive and TokyoBoxGroupSession.sessionId == messageData.sessionId then
        -- Adicionar a mensagem à lista
        table.insert(TokyoBoxGroupSession.messages, {
            id = messageData.id,
            senderId = messageData.senderId,
            senderName = messageData.senderName,
            message = messageData.message,
            timestamp = messageData.timestamp
        })
        
        -- Atualizar a UI de chat
        UpdateChatUI()
    end
end)

RegisterNetEvent('tokyo_box:djModeChanged')
AddEventHandler('tokyo_box:djModeChanged', function(data)
    if TokyoBoxGroupSession.isActive and TokyoBoxGroupSession.sessionId == data.sessionId then
        -- Se o DJ é o jogador atual, atualizar estado
        if data.djId == GetPlayerServerId(PlayerId()) then
            TokyoBoxGroupSession.djMode = data.enabled
            
            -- Atualizar a UI
            SendNUIMessage({
                action = "dj_mode_changed",
                enabled = data.enabled
            })
            
            -- Adicionar mensagem de sistema
            if data.enabled then
                AddSystemMessage("Você agora está no modo DJ!")
            else
                AddSystemMessage("Modo DJ desativado.")
            end
        else
            -- Outro jogador mudou o modo DJ
            if data.enabled then
                -- Encontrar o nome do DJ
                local djName = "Alguém"
                for _, member in ipairs(TokyoBoxGroupSession.members) do
                    if member.id == data.djId then
                        djName = member.name
                        break
                    end
                end
                
                AddSystemMessage(djName .. " está agora no modo DJ e controla a música.")
            end
        end
    end
end)

RegisterNetEvent('tokyo_box:syncTrack')
AddEventHandler('tokyo_box:syncTrack', function(trackData)
    if TokyoBoxGroupSession.isActive then
        -- Sincronizar a música atual com a do DJ/host
        -- Isso substituiria a música atual pelo que o DJ/host está reproduzindo
        
        if TokyoBox.currentTrack == nil or TokyoBox.currentTrack.id ~= trackData.id then
            -- Apenas mudar se for uma música diferente
            
            -- Atualizar a música atual
            TriggerEvent('tokyo_box:updateCurrentTrack', trackData)
            
            -- Notificar o jogador
            local message = "Música alterada para: " .. trackData.title .. " - " .. trackData.artist
            AddSystemMessage(message)
        end
        
        -- Sincronizar estado de reprodução
        if trackData.isPlaying and not TokyoBox.isPlaying then
            -- Iniciar reprodução
            TriggerEvent('tokyo_box:resumeTrack')
        elseif not trackData.isPlaying and TokyoBox.isPlaying then
            -- Pausar reprodução
            TriggerEvent('tokyo_box:pauseTrack')
        end
        
        -- Sincronizar posição (dentro de uma margem de erro)
        if math.abs(TokyoBox.currentTrackPosition - trackData.position) > 3 then
            TriggerEvent('tokyo_box:seekTrack', trackData.position)
        end
    end
end)

-- Funções auxiliares
function GenerateSessionId()
    local timestamp = os.time()
    local random = math.random(1000000, 9999999)
    return timestamp .. "_" .. random
end

function GenerateSessionCode()
    local characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" -- Removido caracteres semelhantes
    local code = ""
    
    -- Gerar código de 6 caracteres
    for i = 1, 6 do
        local random = math.random(1, string.len(characters))
        code = code .. string.sub(characters, random, random)
    end
    
    -- Adicionar hífen para legibilidade
    return string.sub(code, 1, 3) .. "-" .. string.sub(code, 4)
end

function ResetSessionState()
    TokyoBoxGroupSession.isActive = false
    TokyoBoxGroupSession.sessionId = nil
    TokyoBoxGroupSession.sessionCode = nil
    TokyoBoxGroupSession.role = nil
    TokyoBoxGroupSession.members = {}
    TokyoBoxGroupSession.djMode = false
    TokyoBoxGroupSession.messages = {}
end

function AddSystemMessage(message)
    table.insert(TokyoBoxGroupSession.messages, {
        id = os.time(),
        isSystem = true,
        message = message,
        timestamp = os.time()
    })
    
    -- Atualizar a UI de chat
    UpdateChatUI()
end

function UpdateMembersUI()
    SendNUIMessage({
        action = "update_session_members",
        members = TokyoBoxGroupSession.members
    })
end

function UpdateChatUI()
    SendNUIMessage({
        action = "update_session_chat",
        messages = TokyoBoxGroupSession.messages
    })
end

function FormatTimestamp(timestamp)
    local time = os.date("*t", timestamp)
    return string.format("%02d:%02d", time.hour, time.min)
end

-- Eventos para sincronização de música
AddEventHandler('tokyo_box:trackStarted', function(track)
    -- Se estiver em uma sessão como host/DJ, enviar atualização
    if TokyoBoxGroupSession.isActive and 
       (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_HOST or 
        (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_DJ and TokyoBoxGroupSession.djMode)) then
        
        TriggerServerEvent('tokyo_box:broadcastTrack', {
            sessionId = TokyoBoxGroupSession.sessionId,
            track = track,
            isPlaying = true,
            position = 0
        })
    end
end)

AddEventHandler('tokyo_box:trackStopped', function()
    -- Se estiver em uma sessão como host/DJ, enviar atualização
    if TokyoBoxGroupSession.isActive and 
       (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_HOST or 
        (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_DJ and TokyoBoxGroupSession.djMode)) then
        
        TriggerServerEvent('tokyo_box:broadcastTrackStopped', {
            sessionId = TokyoBoxGroupSession.sessionId
        })
    end
end)

AddEventHandler('tokyo_box:trackPaused', function()
    -- Se estiver em uma sessão como host/DJ, enviar atualização
    if TokyoBoxGroupSession.isActive and 
       (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_HOST or 
        (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_DJ and TokyoBoxGroupSession.djMode)) then
        
        TriggerServerEvent('tokyo_box:broadcastTrackState', {
            sessionId = TokyoBoxGroupSession.sessionId,
            isPlaying = false,
            position = TokyoBox.currentTrackPosition
        })
    end
end)

AddEventHandler('tokyo_box:trackResumed', function()
    -- Se estiver em uma sessão como host/DJ, enviar atualização
    if TokyoBoxGroupSession.isActive and 
       (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_HOST or 
        (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_DJ and TokyoBoxGroupSession.djMode)) then
        
        TriggerServerEvent('tokyo_box:broadcastTrackState', {
            sessionId = TokyoBoxGroupSession.sessionId,
            isPlaying = true,
            position = TokyoBox.currentTrackPosition
        })
    end
end)

AddEventHandler('tokyo_box:trackSeeked', function(position)
    -- Se estiver em uma sessão como host/DJ, enviar atualização
    if TokyoBoxGroupSession.isActive and 
       (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_HOST or 
        (TokyoBoxGroupSession.role == TokyoBoxGroupSession.ROLE_DJ and TokyoBoxGroupSession.djMode)) then
        
        TriggerServerEvent('tokyo_box:broadcastTrackState', {
            sessionId = TokyoBoxGroupSession.sessionId,
            isPlaying = TokyoBox.isPlaying,
            position = position
        })
    end
end)

-- Exportar funções para outros scripts
exports('IsInGroupSession', function()
    return TokyoBoxGroupSession.isActive
end)

exports('GetSessionMembers', function()
    return TokyoBoxGroupSession.members
end)

exports('GetSessionRole', function()
    return TokyoBoxGroupSession.role
end)
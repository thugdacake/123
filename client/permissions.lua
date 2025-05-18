-- client/permissions.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- Verifica se o jogador tem permissão VIP
function CheckVipPermission(cb)
    QBCore.Functions.TriggerCallback('tokyo_box:checkVIP', function(hasPermission)
        cb(hasPermission)
    end)
end

-- Utilidades para verificação local de permissão VIP
-- Isso é apenas um backup, a verificação principal é feita no servidor
function IsPlayerVIP()
    local Player = QBCore.Functions.GetPlayerData()
    
    -- Verificar se o jogador pertence a um grupo VIP
    if Player and Player.job then
        for _, group in ipairs(Config.VIPGroups) do
            if Player.job.name == group then
                return true
            end
        end
    end
    
    -- Verificar se o jogador tem flag VIP (dependendo da implementação do servidor)
    if Player and Player.metadata then
        for _, flag in ipairs(Config.VIPFlags) do
            if Player.metadata[flag] then
                return true
            end
        end
    end
    
    return false
end

-- Exportar função para outros recursos
exports('IsPlayerTokyoBoxVIP', IsPlayerVIP)

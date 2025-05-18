-- server/database.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- Inicializar banco de dados (verificar e criar tabelas se não existirem)
function InitDatabase()
    -- Tabela de usuários do Tokyo Box
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `]]..Config.DatabaseTables.users..[[` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `identifier` varchar(50) NOT NULL,
            `license` varchar(50) NOT NULL,
            `settings` TEXT,
            `last_login` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `identifier_UNIQUE` (`identifier`)
        );
    ]], {}, function(result)
        print("Tokyo Box Database: Tabela de usuários verificada.")
    end)
    
    -- Tabela de playlists
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `]]..Config.DatabaseTables.playlists..[[` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `name` varchar(100) NOT NULL,
            `description` varchar(255) NULL,
            `user_identifier` varchar(50) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            KEY `user_identifier_idx` (`user_identifier`),
            CONSTRAINT `fk_playlist_user_identifier` FOREIGN KEY (`user_identifier`) REFERENCES `]]..Config.DatabaseTables.users..[[` (`identifier`) ON DELETE CASCADE
        );
    ]], {}, function(result)
        print("Tokyo Box Database: Tabela de playlists verificada.")
    end)
    
    -- Tabela de músicas
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `]]..Config.DatabaseTables.songs..[[` (
            `id` varchar(100) NOT NULL,
            `title` varchar(150) NOT NULL,
            `artist` varchar(150) NOT NULL,
            `duration` int,
            `album_art` TEXT,
            `url` TEXT,
            `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        );
    ]], {}, function(result)
        print("Tokyo Box Database: Tabela de músicas verificada.")
    end)
    
    -- Tabela de relacionamento entre playlists e músicas
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `]]..Config.DatabaseTables.playlistSongs..[[` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `playlist_id` int(11) NOT NULL,
            `song_id` varchar(100) NOT NULL,
            `position` int(11) NOT NULL,
            `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `playlist_song` (`playlist_id`, `song_id`),
            KEY `song_id` (`song_id`),
            CONSTRAINT `fk_ps_playlist_id` FOREIGN KEY (`playlist_id`) REFERENCES `]]..Config.DatabaseTables.playlists..[[` (`id`) ON DELETE CASCADE,
            CONSTRAINT `fk_ps_song_id` FOREIGN KEY (`song_id`) REFERENCES `]]..Config.DatabaseTables.songs..[[` (`id`) ON DELETE CASCADE
        );
    ]], {}, function(result)
        print("Tokyo Box Database: Tabela de relacionamento playlist-músicas verificada.")
    end)
    
    -- Tabela de favoritos
    MySQL.Async.execute([[
        CREATE TABLE IF NOT EXISTS `]]..Config.DatabaseTables.favorites..[[` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_identifier` varchar(50) NOT NULL,
            `song_id` varchar(100) NOT NULL,
            `added_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `user_song` (`user_identifier`, `song_id`),
            KEY `song_id` (`song_id`),
            CONSTRAINT `fk_fav_user_identifier` FOREIGN KEY (`user_identifier`) REFERENCES `]]..Config.DatabaseTables.users..[[` (`identifier`) ON DELETE CASCADE,
            CONSTRAINT `fk_fav_song_id` FOREIGN KEY (`song_id`) REFERENCES `]]..Config.DatabaseTables.songs..[[` (`id`) ON DELETE CASCADE
        );
    ]], {}, function(result)
        print("Tokyo Box Database: Tabela de favoritos verificada.")
    end)
    
    print("Tokyo Box Database: Inicialização completa.")
end

-- Verificar se o jogador existe no banco de dados
function CheckPlayerExists(citizenid, license)
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.users.." WHERE identifier = ?", {
        citizenid
    }, function(count)
        if count == 0 then
            -- Jogador não existe, criar novo registro
            MySQL.Async.execute("INSERT INTO "..Config.DatabaseTables.users.." (identifier, license) VALUES (?, ?)", {
                citizenid,
                license
            }, function(rowsChanged)
                if rowsChanged > 0 then
                    print("Tokyo Box Database: Novo usuário registrado - " .. citizenid)
                else
                    print("Tokyo Box Database: Erro ao registrar usuário - " .. citizenid)
                end
            end)
        end
    end)
end

-- Salvar configurações do player
function SavePlayerSettings(identifier, settings)
    local settingsJson = json.encode(settings)
    
    MySQL.Async.execute("UPDATE "..Config.DatabaseTables.users.." SET settings = ? WHERE identifier = ?", {
        settingsJson,
        identifier
    }, function(rowsChanged)
        if rowsChanged > 0 then
            print("Tokyo Box Database: Configurações salvas para o usuário - " .. identifier)
        else
            print("Tokyo Box Database: Erro ao salvar configurações para o usuário - " .. identifier)
        end
    end)
end

-- Obter configurações do player
function GetPlayerSettings(source, identifier)
    MySQL.Async.fetchScalar("SELECT settings FROM "..Config.DatabaseTables.users.." WHERE identifier = ?", {
        identifier
    }, function(settings)
        local parsedSettings = nil
        
        if settings then
            parsedSettings = json.decode(settings)
        end
        
        TriggerClientEvent('tokyo_box:receivePlayerSettings', source, parsedSettings)
    end)
end

-- Verificar permissão de playlist
function CheckPlaylistPermission(identifier, playlistId, callback)
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.playlists.." WHERE id = ? AND user_identifier = ?", {
        playlistId,
        identifier
    }, function(count)
        callback(count > 0)
    end)
end

-- Função auxiliar para executar queries e lidar com logs de erro
function ExecuteQuery(query, params, successCallback, errorCallback)
    MySQL.Async.execute(query, params, function(result)
        if result then
            if successCallback then successCallback(result) end
        else
            print("Tokyo Box Database: Erro ao executar query -", query)
            if errorCallback then errorCallback() end
        end
    end)
end

-- Função auxiliar para buscar dados e lidar com logs de erro
function FetchData(query, params, successCallback, errorCallback)
    MySQL.Async.fetchAll(query, params, function(result)
        if result then
            if successCallback then successCallback(result) end
        else
            print("Tokyo Box Database: Erro ao buscar dados -", query)
            if errorCallback then errorCallback() end
        end
    end)
end

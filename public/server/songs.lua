-- server/songs.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- API para busca de músicas (YouTube)
local function SearchYouTube(query, callback)
    -- Implementação básica usando o recurso httpRequest
    local youtubeApiKey = GetConvar("youtube_api_key", "")
    
    if youtubeApiKey == "" then
        print("Tokyo Box: Chave da API do YouTube não configurada")
        callback({})
        return
    end
    
    local endpoint = Config.MusicAPIs.youtube .. "/search?part=snippet&maxResults=20&q=" .. 
                     query .. "&type=video&key=" .. youtubeApiKey
    
    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            local response = json.decode(responseText)
            
            if response and response.items then
                local results = {}
                
                for _, item in ipairs(response.items) do
                    table.insert(results, {
                        id = item.id.videoId,
                        title = item.snippet.title,
                        artist = item.snippet.channelTitle,
                        album_art = item.snippet.thumbnails.high.url,
                        url = "https://www.youtube.com/watch?v=" .. item.id.videoId
                    })
                end
                
                callback(results)
            else
                callback({})
            end
        else
            print("Tokyo Box: Erro ao buscar no YouTube - Status: " .. statusCode)
            callback({})
        end
    end, "GET", "", { ["Content-Type"] = "application/json" })
end

-- API para busca de músicas (SoundCloud)
local function SearchSoundCloud(query, callback)
    -- Implementação básica usando o recurso httpRequest
    local soundcloudApiKey = GetConvar("soundcloud_api_key", "")
    
    if soundcloudApiKey == "" then
        print("Tokyo Box: Chave da API do SoundCloud não configurada")
        callback({})
        return
    end
    
    local endpoint = Config.MusicAPIs.soundcloud .. "/tracks?q=" .. query .. "&client_id=" .. soundcloudApiKey
    
    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            local response = json.decode(responseText)
            
            if response then
                local results = {}
                
                for _, item in ipairs(response) do
                    table.insert(results, {
                        id = "sc_" .. item.id,
                        title = item.title,
                        artist = item.user.username,
                        album_art = item.artwork_url,
                        url = item.permalink_url
                    })
                end
                
                callback(results)
            else
                callback({})
            end
        else
            print("Tokyo Box: Erro ao buscar no SoundCloud - Status: " .. statusCode)
            callback({})
        end
    end, "GET", "", { ["Content-Type"] = "application/json" })
end

-- Função para buscar músicas nas APIs
function SearchTracks(source, query)
    -- Implementação simples que primeiro busca no YouTube
    SearchYouTube(query, function(youtubeResults)
        -- Enviar resultados para o cliente
        local results = youtubeResults or {}
        
        -- Verificar se devemos buscar também no SoundCloud
        if #results < 5 then
            SearchSoundCloud(query, function(soundcloudResults)
                -- Adicionar resultados do SoundCloud
                for _, track in ipairs(soundcloudResults) do
                    table.insert(results, track)
                end
                
                -- Enviar resultados combinados para o cliente
                TriggerClientEvent('tokyo_box:receiveSearchResults', source, results)
            end)
        else
            -- Enviar apenas resultados do YouTube
            TriggerClientEvent('tokyo_box:receiveSearchResults', source, results)
        end
    end)
end

-- Função para obter informações de uma música
function GetTrackInfo(source, trackId)
    -- Verificar se a música já existe no banco de dados
    MySQL.Async.fetchAll("SELECT * FROM "..Config.DatabaseTables.songs.." WHERE id = ?", {
        trackId
    }, function(tracks)
        if tracks and #tracks > 0 then
            -- Música encontrada no banco de dados
            TriggerClientEvent('tokyo_box:receiveTrackInfo', source, tracks[1])
        else
            -- Música não encontrada no banco de dados, buscar na API
            if string.sub(trackId, 1, 3) == "sc_" then
                -- Buscar no SoundCloud
                GetSoundCloudTrack(source, string.sub(trackId, 4))
            else
                -- Buscar no YouTube
                GetYouTubeTrack(source, trackId)
            end
        end
    end)
end

-- Função para buscar informações de uma música no YouTube
function GetYouTubeTrack(source, videoId)
    local youtubeApiKey = GetConvar("youtube_api_key", "")
    
    if youtubeApiKey == "" then
        print("Tokyo Box: Chave da API do YouTube não configurada")
        TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
        return
    end
    
    local endpoint = Config.MusicAPIs.youtube .. "/videos?part=snippet,contentDetails&id=" .. 
                     videoId .. "&key=" .. youtubeApiKey
    
    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            local response = json.decode(responseText)
            
            if response and response.items and #response.items > 0 then
                local item = response.items[1]
                
                -- Converter duração ISO 8601 para segundos
                local duration = 0
                local durationStr = item.contentDetails.duration
                
                -- Extrair minutos e segundos da string PT#M#S
                local minutes = string.match(durationStr, "(%d+)M")
                local seconds = string.match(durationStr, "(%d+)S")
                
                if minutes then duration = duration + tonumber(minutes) * 60 end
                if seconds then duration = duration + tonumber(seconds) end
                
                -- Construir objeto de música
                local track = {
                    id = videoId,
                    title = item.snippet.title,
                    artist = item.snippet.channelTitle,
                    duration = duration,
                    album_art = item.snippet.thumbnails.high.url,
                    url = "https://www.youtube.com/watch?v=" .. videoId
                }
                
                -- Salvar música no banco de dados
                SaveTrack(track)
                
                -- Enviar informações para o cliente
                TriggerClientEvent('tokyo_box:receiveTrackInfo', source, track)
            else
                TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
            end
        else
            print("Tokyo Box: Erro ao buscar vídeo no YouTube - Status: " .. statusCode)
            TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
        end
    end, "GET", "", { ["Content-Type"] = "application/json" })
end

-- Função para buscar informações de uma música no SoundCloud
function GetSoundCloudTrack(source, trackId)
    local soundcloudApiKey = GetConvar("soundcloud_api_key", "")
    
    if soundcloudApiKey == "" then
        print("Tokyo Box: Chave da API do SoundCloud não configurada")
        TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
        return
    end
    
    local endpoint = Config.MusicAPIs.soundcloud .. "/tracks/" .. trackId .. "?client_id=" .. soundcloudApiKey
    
    PerformHttpRequest(endpoint, function(statusCode, responseText, headers)
        if statusCode == 200 then
            local item = json.decode(responseText)
            
            if item then
                -- Construir objeto de música
                local track = {
                    id = "sc_" .. trackId,
                    title = item.title,
                    artist = item.user.username,
                    duration = math.floor(item.duration / 1000), -- Converter de ms para segundos
                    album_art = item.artwork_url,
                    url = item.permalink_url
                }
                
                -- Salvar música no banco de dados
                SaveTrack(track)
                
                -- Enviar informações para o cliente
                TriggerClientEvent('tokyo_box:receiveTrackInfo', source, track)
            else
                TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
            end
        else
            print("Tokyo Box: Erro ao buscar faixa no SoundCloud - Status: " .. statusCode)
            TriggerClientEvent('tokyo_box:receiveTrackInfo', source, nil)
        end
    end, "GET", "", { ["Content-Type"] = "application/json" })
end

-- Função para salvar música no banco de dados
function SaveTrack(track)
    MySQL.Async.execute([[
        INSERT INTO ]]..Config.DatabaseTables.songs..[[ 
        (id, title, artist, duration, album_art, url) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        title = VALUES(title),
        artist = VALUES(artist),
        duration = VALUES(duration),
        album_art = VALUES(album_art),
        url = VALUES(url)
    ]], {
        track.id,
        track.title,
        track.artist,
        track.duration,
        track.album_art,
        track.url
    }, function(rowsChanged)
        if rowsChanged > 0 then
            print("Tokyo Box: Música salva/atualizada no banco de dados - " .. track.id)
        end
    end)
end

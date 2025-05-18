-- server/playlists.lua
local QBCore = exports['qb-core']:GetCoreObject()

-- Obter playlists do player
function GetPlayerPlaylists(source, identifier)
    MySQL.Async.fetchAll("SELECT * FROM "..Config.DatabaseTables.playlists.." WHERE user_identifier = ?", {
        identifier
    }, function(playlists)
        TriggerClientEvent('tokyo_box:receivePlayerPlaylists', source, playlists)
    end)
end

-- Criar nova playlist
function CreatePlaylist(source, identifier, name, description)
    -- Verificar limite de playlists
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.playlists.." WHERE user_identifier = ?", {
        identifier
    }, function(count)
        if count >= Config.MaxPlaylists then
            NotifyClient(source, "Você atingiu o limite de playlists (" .. Config.MaxPlaylists .. ")", "error")
            return
        end
        
        -- Criar nova playlist
        MySQL.Async.execute("INSERT INTO "..Config.DatabaseTables.playlists.." (name, description, user_identifier) VALUES (?, ?, ?)", {
            name,
            description,
            identifier
        }, function(rowsChanged)
            if rowsChanged > 0 then
                MySQL.Async.fetchScalar("SELECT LAST_INSERT_ID() as id", {}, function(playlistId)
                    NotifyClient(source, Config.Texts.playlistCreated, "success")
                    GetPlayerPlaylists(source, identifier)
                end)
            else
                NotifyClient(source, "Erro ao criar playlist", "error")
            end
        end)
    end)
end

-- Excluir playlist
function DeletePlaylist(source, identifier, playlistId)
    CheckPlaylistPermission(identifier, playlistId, function(hasPermission)
        if hasPermission then
            MySQL.Async.execute("DELETE FROM "..Config.DatabaseTables.playlists.." WHERE id = ? AND user_identifier = ?", {
                playlistId,
                identifier
            }, function(rowsChanged)
                if rowsChanged > 0 then
                    NotifyClient(source, Config.Texts.playlistDeleted, "success")
                    GetPlayerPlaylists(source, identifier)
                else
                    NotifyClient(source, "Erro ao excluir playlist", "error")
                end
            end)
        else
            NotifyClient(source, "Você não tem permissão para excluir esta playlist", "error")
        end
    end)
end

-- Obter músicas de uma playlist
function GetPlaylistTracks(source, playlistId)
    -- Obter informações da playlist
    MySQL.Async.fetchAll("SELECT * FROM "..Config.DatabaseTables.playlists.." WHERE id = ?", {
        playlistId
    }, function(playlists)
        if not playlists or #playlists == 0 then
            NotifyClient(source, "Playlist não encontrada", "error")
            return
        end
        
        local playlistInfo = playlists[1]
        
        -- Obter músicas da playlist
        MySQL.Async.fetchAll([[
            SELECT s.*, ps.position 
            FROM ]]..Config.DatabaseTables.songs..[[ s
            JOIN ]]..Config.DatabaseTables.playlistSongs..[[ ps ON s.id = ps.song_id
            WHERE ps.playlist_id = ?
            ORDER BY ps.position
        ]], {
            playlistId
        }, function(tracks)
            TriggerClientEvent('tokyo_box:receivePlaylistTracks', source, playlistId, tracks, playlistInfo)
        end)
    end)
end

-- Adicionar música a uma playlist
function AddTrackToPlaylist(source, identifier, trackId, playlistId)
    -- Verificar permissão para editar a playlist
    CheckPlaylistPermission(identifier, playlistId, function(hasPermission)
        if hasPermission then
            -- Verificar se a música já existe na playlist
            MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.playlistSongs.." WHERE playlist_id = ? AND song_id = ?", {
                playlistId,
                trackId
            }, function(count)
                if count > 0 then
                    NotifyClient(source, "Esta música já existe na playlist", "error")
                    return
                end
                
                -- Verificar limite de músicas na playlist
                MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.playlistSongs.." WHERE playlist_id = ?", {
                    playlistId
                }, function(trackCount)
                    if trackCount >= Config.MaxSongsPerPlaylist then
                        NotifyClient(source, "Você atingiu o limite de músicas nesta playlist (" .. Config.MaxSongsPerPlaylist .. ")", "error")
                        return
                    end
                    
                    -- Obter a próxima posição
                    local position = trackCount + 1
                    
                    -- Adicionar música à playlist
                    MySQL.Async.execute("INSERT INTO "..Config.DatabaseTables.playlistSongs.." (playlist_id, song_id, position) VALUES (?, ?, ?)", {
                        playlistId,
                        trackId,
                        position
                    }, function(rowsChanged)
                        if rowsChanged > 0 then
                            -- Atualizar timestamp da playlist
                            MySQL.Async.execute("UPDATE "..Config.DatabaseTables.playlists.." SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", {
                                playlistId
                            })
                            
                            NotifyClient(source, Config.Texts.trackAdded, "success")
                            TriggerClientEvent('tokyo_box:playlistUpdated', source, playlistId)
                        else
                            NotifyClient(source, "Erro ao adicionar música à playlist", "error")
                        end
                    end)
                end)
            end)
        else
            NotifyClient(source, "Você não tem permissão para editar esta playlist", "error")
        end
    end)
end

-- Remover música de uma playlist
function RemoveTrackFromPlaylist(source, identifier, trackId, playlistId)
    -- Verificar permissão para editar a playlist
    CheckPlaylistPermission(identifier, playlistId, function(hasPermission)
        if hasPermission then
            -- Obter posição atual da música
            MySQL.Async.fetchScalar("SELECT position FROM "..Config.DatabaseTables.playlistSongs.." WHERE playlist_id = ? AND song_id = ?", {
                playlistId,
                trackId
            }, function(position)
                if not position then
                    NotifyClient(source, "Esta música não existe na playlist", "error")
                    return
                end
                
                -- Remover música da playlist
                MySQL.Async.execute("DELETE FROM "..Config.DatabaseTables.playlistSongs.." WHERE playlist_id = ? AND song_id = ?", {
                    playlistId,
                    trackId
                }, function(rowsChanged)
                    if rowsChanged > 0 then
                        -- Atualizar posições das outras músicas
                        MySQL.Async.execute("UPDATE "..Config.DatabaseTables.playlistSongs.." SET position = position - 1 WHERE playlist_id = ? AND position > ?", {
                            playlistId,
                            position
                        })
                        
                        -- Atualizar timestamp da playlist
                        MySQL.Async.execute("UPDATE "..Config.DatabaseTables.playlists.." SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", {
                            playlistId
                        })
                        
                        NotifyClient(source, Config.Texts.trackRemoved, "success")
                        TriggerClientEvent('tokyo_box:playlistUpdated', source, playlistId)
                    else
                        NotifyClient(source, "Erro ao remover música da playlist", "error")
                    end
                end)
            end)
        else
            NotifyClient(source, "Você não tem permissão para editar esta playlist", "error")
        end
    end)
end

-- Obter favoritos do player
function GetPlayerFavorites(source, identifier)
    MySQL.Async.fetchAll([[
        SELECT s.* 
        FROM ]]..Config.DatabaseTables.songs..[[ s
        JOIN ]]..Config.DatabaseTables.favorites..[[ f ON s.id = f.song_id
        WHERE f.user_identifier = ?
        ORDER BY f.added_at DESC
    ]], {
        identifier
    }, function(favorites)
        TriggerClientEvent('tokyo_box:receivePlayerFavorites', source, favorites)
    end)
end

-- Adicionar música aos favoritos
function AddTrackToFavorites(source, identifier, trackId)
    -- Verificar se a música já está nos favoritos
    MySQL.Async.fetchScalar("SELECT COUNT(*) FROM "..Config.DatabaseTables.favorites.." WHERE user_identifier = ? AND song_id = ?", {
        identifier,
        trackId
    }, function(count)
        if count > 0 then
            NotifyClient(source, "Esta música já está nos favoritos", "info")
            return
        end
        
        -- Adicionar aos favoritos
        MySQL.Async.execute("INSERT INTO "..Config.DatabaseTables.favorites.." (user_identifier, song_id) VALUES (?, ?)", {
            identifier,
            trackId
        }, function(rowsChanged)
            if rowsChanged > 0 then
                NotifyClient(source, "Música adicionada aos favoritos", "success")
                GetPlayerFavorites(source, identifier)
            else
                NotifyClient(source, "Erro ao adicionar música aos favoritos", "error")
            end
        end)
    end)
end

-- Remover música dos favoritos
function RemoveTrackFromFavorites(source, identifier, trackId)
    MySQL.Async.execute("DELETE FROM "..Config.DatabaseTables.favorites.." WHERE user_identifier = ? AND song_id = ?", {
        identifier,
        trackId
    }, function(rowsChanged)
        if rowsChanged > 0 then
            NotifyClient(source, "Música removida dos favoritos", "success")
            GetPlayerFavorites(source, identifier)
        else
            NotifyClient(source, "Erro ao remover música dos favoritos", "error")
        end
    end)
end

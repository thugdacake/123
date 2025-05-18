-- fxmanifest.lua
fx_version 'cerulean'
game 'gta5'

author 'Tokyo Box'
description 'Player de música estilo Spotify para servidores QBCore'
version '1.0.0'

-- Especifica os scripts do lado do cliente e servidor
client_scripts {
    'config.lua',
    'client/main.lua',
    'client/nui.lua',
    'client/player.lua',
    'client/permissions.lua',
    'client/bluetooth.lua',
    'client/audio3d.lua',
    'client/group_session.lua',
}

server_scripts {
    '@oxmysql/lib/MySQL.lua', -- Dependência do oxmysql
    'config.lua',
    'server/main.lua',
    'server/database.lua',
    'server/playlists.lua',
    'server/songs.lua',
}

-- Arquivos UI
ui_page 'ui/index.html'

-- Arquivos que serão carregados pela UI
files {
    'ui/index.html',
    'ui/css/*.css',
    'ui/js/*.js',
    'ui/img/*.png',
    'ui/img/*.jpg',
    'ui/img/*.svg',
    'ui/fonts/*.ttf',
    'ui/fonts/*.woff',
    'ui/fonts/*.woff2'
}

-- Dependências
dependency 'qb-core'

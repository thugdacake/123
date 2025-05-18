# Tokyo Box - Player de Música para FiveM

Um player de música estilo Spotify avançado para servidores FiveM QBCore com recursos premium.

## Características

- 🎵 **Player de Música Completo**: Interface moderna com controles de reprodução, playlists e favoritos
- 🔊 **Áudio 3D Aprimorado**: Efeitos espaciais e equalizador de 10 bandas personalizável
- 📱 **Bluetooth Virtual**: Compartilhe música com outros jogadores nas proximidades
- 👥 **Sessões de Grupo**: Sincronize música entre múltiplos jogadores, com controle DJ
- 🎚️ **Equalizador Profissional**: Presets para diferentes gêneros e capacidade de salvar configurações personalizadas
- 🌓 **Design Moderno**: Interface de usuário inspirada em aplicativos de música premium

## Instalação

1. Coloque a pasta `tokyo_box` em seu diretório `resources`
2. Adicione `ensure tokyo_box` ao seu `server.cfg`
3. Reinicie seu servidor FiveM

## Dependências

- QBCore Framework
- xSound (opcional, mas recomendado para melhor qualidade de áudio)

## Uso

### Comandos

- `/tokyobox` - Abre o player de música
- Você também pode vincular uma tecla em suas configurações de keybinding do FiveM

### Funcionalidades Principais

#### Bluetooth Virtual

Conecte-se com outros jogadores para compartilhar sua música:
- Ative o Bluetooth
- Procure por dispositivos próximos
- Conecte e comece a compartilhar!

#### Equalizador e Áudio 3D

Personalize sua experiência sonora:
- Selecione entre presets de equalizador pré-configurados
- Ajuste cada banda manualmente para um som personalizado
- Controle a posição do som no espaço 3D para uma experiência mais imersiva

#### Sessões de Grupo

Ouça música sincronizada com amigos:
- Crie uma sessão e compartilhe o código
- Permita que outros jogadores se juntem
- Use o modo DJ para controlar a música para todos na sessão
- Converse pelo chat integrado da sessão

## Configuração

Ajuste as configurações no arquivo `config.lua`:

```lua
Config = {}

-- Configurações gerais
Config.CommandName = "tokyobox"    -- Comando para abrir o player
Config.ToggleKeybind = "M"         -- Tecla padrão para alternar a interface
Config.DefaultVolume = 70          -- Volume padrão (0-100)

-- Restrições de acesso
Config.RequireVIP = false          -- Define se o player requer status VIP
Config.EnableNotifications = true  -- Ativa notificações do sistema

-- Textos personalizáveis
Config.Texts = {
    noAccess = "Acesso negado: apenas VIPs podem usar o Tokyo Box",
    -- Outros textos personalizáveis...
}

-- Funcionalidades avançadas
Config.EnableBluetooth = true        -- Ativar funcionalidade Bluetooth
Config.Enable3DAudio = true          -- Ativar áudio 3D e equalizador
Config.EnableGroupSessions = true    -- Ativar sessões de grupo
```

## Personalização

Você pode personalizar a aparência e comportamento do Tokyo Box:

- Modifique os arquivos CSS em `ui/css/` para alterar a aparência
- Adicione suas próprias músicas em um servidor remoto e atualize o banco de dados

## Contato & Suporte

Para relatar bugs, fazer sugestões ou obter suporte técnico, entre em contato através do fórum FiveM ou pelo Discord.

---

Desenvolvido com ❤️ para a comunidade FiveM# 123
# 123
# 44

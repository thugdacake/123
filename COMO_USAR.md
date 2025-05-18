# TOKYO BOX - INSTRUÇÕES DE USO

Este recurso é um player de música premium para FiveM com recursos avançados de compartilhamento e áudio 3D.

## INSTALAÇÃO

1. Extraia esta pasta para seu diretório `resources/`
2. Adicione `ensure tokyo_box` ao seu arquivo `server.cfg`
3. Reinicie seu servidor FiveM

## COMANDOS

- `/tokyobox` - Abre o player de música (configurável em config.lua)
- Tecla padrão: `M` (configurável em config.lua)

## RECURSOS NOVOS

### 1. BLUETOOTH VIRTUAL

Permite compartilhar música entre jogadores próximos:

- Acesse a aba "Bluetooth" na navegação inferior
- Ative o toggle do Bluetooth
- Clique em "Atualizar" para encontrar dispositivos próximos
- Clique no ícone de conexão para se conectar a outro jogador
- A música tocará sincronizada entre os jogadores conectados

### 2. EQUALIZADOR E ÁUDIO 3D

Personalização avançada de áudio:

- Acesse a aba "Equalizer" na navegação inferior
- Escolha entre presets pré-configurados ou ajuste manualmente
- Ative o Áudio 3D com o toggle
- Arraste o ponto azul para posicionar o som no espaço
- Ajuste o tamanho da sala e a reverberação para criar ambientes diferentes

### 3. SESSÕES DE GRUPO

Ouça música em grupo com controle de DJ:

- Acesse a aba "Grupo" na navegação inferior
- Clique em "Criar Sessão" para hospedar uma nova sessão
- Compartilhe o código da sessão com outros jogadores
- Os jogadores podem digitar o código e clicar em "Entrar"
- O host ou DJ pode controlar a música para todos na sessão
- Use o chat integrado para conversar com outros membros

## DICAS DE USO

- Verifique se o serviço xSound está instalado em seu servidor para melhor qualidade de áudio
- O alcance do Bluetooth é configurável (padrão: 50m)
- Use o modo DJ em sessões de grupo para controlar totalmente a reprodução
- Experimente diferentes presets de equalização para cada gênero musical
- Ajuste o arquivo config.lua para personalizar as configurações do recurso

## SOLUÇÃO DE PROBLEMAS

- Se o player não abrir, verifique se o recurso está ativado em seu server.cfg
- Para problemas de áudio, verifique se o xSound está instalado e funcionando
- Certifique-se de que seu firewall não está bloqueando os sockets necessários

---

Para mais informações e suporte, consulte o README.md ou entre em contato com o desenvolvedor.
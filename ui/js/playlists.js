/**
 * playlists.js - Funcionalidades específicas para gerenciamento de playlists
 * Implementa funcionalidades como arrastar e soltar nas playlists, etc.
 */

// Implementação de funcionalidades adicionais para playlists 
// que não estão no arquivo principal app.js

// Função para implementar arrastar e soltar (reordenar músicas na playlist)
function enablePlaylistDragAndDrop() {
    // Verificar se o navegador suporta Drag and Drop API
    if (!('draggable' in document.createElement('div'))) {
        return; // Navegador não suporta drag and drop
    }
    
    // Elementos da playlist
    const playlistTracksContainer = document.getElementById('playlist-tracks');
    if (!playlistTracksContainer) return;
    
    // Configuração de estado
    let draggedItem = null;
    let originalIndex = null;
    
    // Função para tornar todos os elementos da playlist arrastáveis
    function makeItemsDraggable() {
        const trackItems = playlistTracksContainer.querySelectorAll('.track-item');
        
        trackItems.forEach((item, index) => {
            // Configurar atributos para arrastar
            item.setAttribute('draggable', 'true');
            item.dataset.index = index;
            
            // Eventos de drag
            item.addEventListener('dragstart', handleDragStart);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragenter', handleDragEnter);
            item.addEventListener('dragleave', handleDragLeave);
            item.addEventListener('drop', handleDrop);
            item.addEventListener('dragend', handleDragEnd);
        });
    }
    
    // Eventos de arrastar
    function handleDragStart(e) {
        draggedItem = this;
        originalIndex = parseInt(this.dataset.index);
        
        // Definir dados de transferência para arrastamento
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
        
        // Adicionar classe para estilo
        this.classList.add('dragging');
        
        // Atrasar o estilo para melhorar visualização
        setTimeout(() => this.classList.add('invisible'), 0);
    }
    
    function handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault(); // Necessário para permitir soltar
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    function handleDragEnter(e) {
        this.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        this.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation(); // Evitar redirecionamento no Firefox
        }
        
        if (draggedItem !== this) {
            // Obter o índice do item atual
            const newIndex = parseInt(this.dataset.index);
            
            // Mover o item para a nova posição
            if (originalIndex < newIndex) {
                playlistTracksContainer.insertBefore(draggedItem, this.nextSibling);
            } else {
                playlistTracksContainer.insertBefore(draggedItem, this);
            }
            
            // Atualizar índices de todos os itens
            const trackItems = playlistTracksContainer.querySelectorAll('.track-item');
            trackItems.forEach((item, index) => {
                item.dataset.index = index;
            });
            
            // Enviar atualização para o servidor
            updatePlaylistOrder();
        }
        
        this.classList.remove('drag-over');
        return false;
    }
    
    function handleDragEnd(e) {
        this.classList.remove('invisible');
        this.classList.remove('dragging');
        
        // Remover classes de estilo de todos os itens
        const trackItems = playlistTracksContainer.querySelectorAll('.track-item');
        trackItems.forEach(item => {
            item.classList.remove('drag-over');
        });
    }
    
    // Função para enviar a nova ordem para o servidor
    function updatePlaylistOrder() {
        // Verificar se temos uma playlist atual
        if (!TokyoBox || !TokyoBox.state || !TokyoBox.state.currentPlaylist) return;
        
        const playlistId = TokyoBox.state.currentPlaylist.id;
        const trackItems = playlistTracksContainer.querySelectorAll('.track-item');
        const newOrder = Array.from(trackItems).map(item => item.dataset.id);
        
        // Enviar nova ordem para o servidor
        fetch(`https://tokyo_box/updatePlaylistOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playlistId: playlistId,
                trackOrder: newOrder
            })
        })
        .catch(error => {
            console.error('Tokyo Box: Erro ao atualizar ordem da playlist', error);
        });
    }
    
    // Observer para detectar quando a lista de músicas da playlist é atualizada
    const observer = new MutationObserver(mutations => {
        // Verificar se há mudanças relevantes nos nós filhos
        const hasChildChanges = mutations.some(mutation => mutation.type === 'childList');
        
        if (hasChildChanges) {
            // Tornar os novos elementos arrastáveis
            makeItemsDraggable();
        }
    });
    
    // Iniciar observação de mudanças
    observer.observe(playlistTracksContainer, { childList: true });
    
    // Adicionar estilo para elementos arrastáveis
    const style = document.createElement('style');
    style.innerHTML = `
        .track-item.dragging {
            opacity: 0.5;
        }
        .track-item.invisible {
            visibility: hidden;
        }
        .track-item.drag-over {
            border: 2px dashed var(--primary-color);
            padding: 7px;
        }
    `;
    document.head.appendChild(style);
}

// Função para implementar exportação de playlist
function setupPlaylistExport() {
    // Criar botão de exportação
    const exportButton = document.createElement('button');
    exportButton.className = 'btn-secondary';
    exportButton.innerHTML = '<i data-feather="share-2"></i>';
    exportButton.title = 'Compartilhar playlist';
    exportButton.style.marginLeft = '10px';
    
    // Adicionar botão ao layout
    const playlistActionsContainer = document.querySelector('.playlist-actions');
    if (playlistActionsContainer) {
        playlistActionsContainer.appendChild(exportButton);
        feather.replace();
    }
    
    // Adicionar evento de clique
    exportButton.addEventListener('click', function() {
        // Verificar se temos uma playlist atual
        if (!TokyoBox || !TokyoBox.state || !TokyoBox.state.currentPlaylist) return;
        
        const playlist = TokyoBox.state.currentPlaylist;
        
        // Criar texto para compartilhar
        let shareText = `🎵 Playlist: ${playlist.name} 🎵\n\n`;
        
        if (playlist.tracks && playlist.tracks.length > 0) {
            playlist.tracks.forEach((track, index) => {
                shareText += `${index + 1}. ${track.title} - ${track.artist}\n`;
            });
        } else {
            shareText += "Playlist vazia";
        }
        
        // Criar elemento temporário para copiar
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        textarea.style.position = 'fixed';
        textarea.style.opacity = 0;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            // Copiar para a área de transferência
            document.execCommand('copy');
            TokyoBox.showNotification('Playlist copiada para a área de transferência', 'success');
        } catch (err) {
            TokyoBox.showNotification('Não foi possível copiar a playlist', 'error');
        }
        
        document.body.removeChild(textarea);
    });
}

// Implementar funcionalidade para trocar a capa da playlist
function setupPlaylistCoverChange() {
    const playlistCover = document.querySelector('.playlist-header .playlist-cover');
    if (!playlistCover) return;
    
    // Adicionar evento de clique na capa
    playlistCover.addEventListener('click', function() {
        // Verificar se temos uma playlist atual
        if (!TokyoBox || !TokyoBox.state || !TokyoBox.state.currentPlaylist) return;
        
        // Selecionar uma capa aleatória (simulação, já que não podemos gerar imagens reais)
        const coverVariants = [
            'purple',
            'blue',
            'pink',
            'green',
            'orange'
        ];
        
        const randomVariant = coverVariants[Math.floor(Math.random() * coverVariants.length)];
        
        // Adicionar efeito de rotação ao trocar a capa
        playlistCover.querySelector('img').style.transition = 'transform 0.5s ease';
        playlistCover.querySelector('img').style.transform = 'rotateY(180deg)';
        
        // Após a animação, alterar a cor do SVG
        setTimeout(() => {
            // Aqui simulamos a troca de capa alterando uma classe
            playlistCover.querySelector('img').className = `cover-${randomVariant}`;
            playlistCover.querySelector('img').style.transform = 'rotateY(0deg)';
            
            TokyoBox.showNotification('Capa da playlist atualizada', 'success');
        }, 250);
    });
    
    // Adicionar tooltip
    playlistCover.title = 'Clique para trocar a capa';
    
    // Adicionar estilos para as variantes de cores
    const style = document.createElement('style');
    style.innerHTML = `
        .cover-purple { filter: hue-rotate(0deg); }
        .cover-blue { filter: hue-rotate(60deg); }
        .cover-pink { filter: hue-rotate(120deg); }
        .cover-green { filter: hue-rotate(180deg); }
        .cover-orange { filter: hue-rotate(240deg); }
    `;
    document.head.appendChild(style);
}

// Inicializar funcionalidades adicionais quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Habilitar arrasto e soltura para reordenar músicas
    enablePlaylistDragAndDrop();
    
    // Configurar exportação de playlist
    setupPlaylistExport();
    
    // Configurar troca de capa da playlist
    setupPlaylistCoverChange();
});

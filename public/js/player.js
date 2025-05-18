/**
 * player.js - Funcionalidades específicas do player de música
 * Manipula a interação com o player, progresso da música, etc.
 */

// Esta classe é uma extensão do objeto TokyoBox principal
// Todas as funções específicas de player já estão implementadas em app.js

// Alguns helpers adicionais para o player

// Formatar segundos em formato MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Animar capa do álbum quando tocando
function setupAlbumAnimation() {
    const fullThumbnail = document.getElementById('full-thumbnail');
    const miniThumbnail = document.getElementById('current-thumbnail');
    
    // Observar mudanças no estado de reprodução
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'data-feather' && 
                mutation.target.parentElement.id === 'full-player-toggle') {
                
                const isPlaying = mutation.target.getAttribute('data-feather') === 'pause';
                
                if (isPlaying) {
                    fullThumbnail.classList.add('rotating');
                } else {
                    fullThumbnail.classList.remove('rotating');
                }
            }
        });
    });
    
    const config = { attributes: true, childList: false, subtree: false };
    const toggleIcon = document.querySelector('#full-player-toggle i');
    
    if (toggleIcon) {
        observer.observe(toggleIcon, config);
    }
    
    // Adicionar classe CSS para animação
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        .full-track-thumbnail img.rotating {
            animation: rotate 20s linear infinite;
        }
    `;
    document.head.appendChild(style);
}

// Configurar visualizador de áudio (background effect)
function setupAudioVisualizer() {
    // Verificar se o navegador suporta Canvas
    if (!document.createElement('canvas').getContext) return;
    
    // Criar canvas para visualizador
    const visualizer = document.createElement('canvas');
    visualizer.id = 'audio-visualizer';
    visualizer.width = 250;
    visualizer.height = 250;
    visualizer.style.position = 'absolute';
    visualizer.style.top = '50%';
    visualizer.style.left = '50%';
    visualizer.style.transform = 'translate(-50%, -50%)';
    visualizer.style.opacity = '0.2';
    visualizer.style.zIndex = '0';
    visualizer.style.pointerEvents = 'none';
    
    // Adicionar ao fundo do player
    const fullPlayerContent = document.querySelector('.full-player-content');
    fullPlayerContent.style.position = 'relative';
    fullPlayerContent.appendChild(visualizer);
    
    // Adicionar estilo para o visualizador
    const style = document.createElement('style');
    style.innerHTML = `
        #audio-visualizer {
            filter: hue-rotate(240deg) brightness(1.5);
        }
    `;
    document.head.appendChild(style);
    
    const audio = document.getElementById('audio-player');
    if (!audio) return;
    
    // Verificar se o navegador suporta Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) return;
    
    // Criar contexto de áudio
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Conectar elemento de áudio ao analisador
    const source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    // Obter dados para visualização
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    // Obter contexto 2D do canvas
    const ctx = visualizer.getContext('2d');
    
    // Função para desenhar o visualizador
    function drawVisualizer() {
        if (!document.querySelector('.full-player.active')) {
            requestAnimationFrame(drawVisualizer);
            return;
        }
        
        // Limpar canvas
        ctx.clearRect(0, 0, visualizer.width, visualizer.height);
        
        // Obter dados de frequência atual
        analyser.getByteFrequencyData(dataArray);
        
        // Calcular raio do círculo
        const radius = Math.min(visualizer.width, visualizer.height) / 2 - 10;
        const centerX = visualizer.width / 2;
        const centerY = visualizer.height / 2;
        
        // Desenhar círculo de frequência
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(140, 92, 245, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Desenhar barras de frequência
        const barCount = bufferLength / 2;
        const barWidth = (2 * Math.PI) / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const barHeight = dataArray[i] * 0.5;
            const angle = i * barWidth;
            
            // Cores baseadas na frequência
            const hue = i / barCount * 240;
            ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.7)`;
            
            // Calcular pontos para a barra
            const x1 = centerX + (radius - 5) * Math.cos(angle);
            const y1 = centerY + (radius - 5) * Math.sin(angle);
            const x2 = centerX + (radius + barHeight) * Math.cos(angle);
            const y2 = centerY + (radius + barHeight) * Math.sin(angle);
            
            // Desenhar linha para cada barra
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.lineWidth = 2;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
            
            // Desenhar círculo no final de cada linha
            ctx.beginPath();
            ctx.arc(x2, y2, 2, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        requestAnimationFrame(drawVisualizer);
    }
    
    // Iniciar visualização
    drawVisualizer();
}

// Configurar as funcionalidades adicionais quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Configurar animação da capa do álbum
    setupAlbumAnimation();
    
    // Configurar visualizador de áudio
    // O visualizador será inicializado apenas se o audio-element for usado
    // como fallback (quando xSound não estiver disponível)
    setupAudioVisualizer();
    
    // Adicionar class para efeito de galáxia no player fullscreen
    const fullPlayer = document.querySelector('.full-player');
    if (fullPlayer) {
        fullPlayer.classList.add('galaxy-theme');
        
        // Adicionar estrelas como partículas ao fundo
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'galaxy-particle';
            const size = Math.random() * 2 + 1;
            
            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background-color: white;
                border-radius: 50%;
                opacity: ${Math.random() * 0.7 + 0.3};
                top: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                box-shadow: 0 0 ${size * 2}px ${size}px rgba(255, 255, 255, 0.8);
                animation: twinkle ${Math.random() * 8 + 2}s infinite alternate;
            `;
            
            fullPlayer.appendChild(particle);
        }
        
        // Adicionar estilo para a animação
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes twinkle {
                0% { opacity: 0.3; }
                100% { opacity: 1; }
            }
            
            .galaxy-theme {
                position: relative;
                overflow: hidden;
            }
            
            .galaxy-theme::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at center, #1e1e42 0%, #0a0a16 70%);
                z-index: -2;
            }
            
            .galaxy-theme::after {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(circle at 30% 40%, rgba(140, 92, 245, 0.3), transparent 30%),
                    radial-gradient(circle at 70% 60%, rgba(92, 58, 204, 0.2), transparent 40%);
                z-index: -1;
            }
        `;
        document.head.appendChild(style);
    }
});

// Adicionar função para atualizar tempo atual e duração total da música
function updatePlayerTimes(currentTime, totalTime) {
    const currentTimeElement = document.getElementById('current-time');
    const totalTimeElement = document.getElementById('total-time');
    
    if (currentTimeElement && !isNaN(currentTime)) {
        currentTimeElement.textContent = formatTime(currentTime);
    }
    
    if (totalTimeElement && !isNaN(totalTime)) {
        totalTimeElement.textContent = formatTime(totalTime);
    }
}

// Adicionar tratamento para audio-element (fallback)
document.addEventListener('DOMContentLoaded', function() {
    const audioElement = document.getElementById('audio-player');
    
    if (audioElement) {
        audioElement.addEventListener('timeupdate', function() {
            updatePlayerTimes(audioElement.currentTime, audioElement.duration);
        });
        
        audioElement.addEventListener('loadedmetadata', function() {
            updatePlayerTimes(0, audioElement.duration);
        });
    }
});

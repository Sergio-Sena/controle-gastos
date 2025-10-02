// API com sincronização automática via GitHub Gist
class FinancasAPI {
    constructor() {
        this.gistId = localStorage.getItem('gistId') || null;
        this.token = localStorage.getItem('githubToken') || null;
        this.autoSync = localStorage.getItem('autoSync') === 'true';
    }

    async salvarDados(lancamentos, reserva) {
        // Sempre salvar no localStorage
        localStorage.setItem('lancamentos', JSON.stringify(lancamentos));
        localStorage.setItem('reservaEmergencia', reserva.toString());
        localStorage.setItem('ultimaAtualizacao', new Date().toISOString());
        
        // Criar link de download para backup
        this.criarBackupDownload(lancamentos, reserva);
        
        // Sincronização automática se configurada
        if (this.autoSync && this.token) {
            await this.sincronizarNuvem(lancamentos, reserva);
        }
        
        return true;
    }

    criarBackupDownload(lancamentos, reserva) {
        const dados = {
            lancamentos: lancamentos,
            reservaEmergencia: reserva,
            ultimaAtualizacao: new Date().toISOString(),
            versao: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(dados, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        // Atualizar link de backup se existir
        let backupLink = document.getElementById('backup-link');
        if (backupLink) {
            backupLink.href = url;
            backupLink.download = `financas-backup-${new Date().toISOString().split('T')[0]}.json`;
        }
    }

    async carregarDados() {
        // Sempre carregar do localStorage primeiro
        const dadosLocal = {
            lancamentos: JSON.parse(localStorage.getItem('lancamentos')) || [],
            reservaEmergencia: parseFloat(localStorage.getItem('reservaEmergencia')) || 0
        };
        
        // Se tem dados locais, usar eles
        if (dadosLocal.lancamentos.length > 0 || dadosLocal.reservaEmergencia > 0) {
            return dadosLocal;
        }
        
        // Só tentar nuvem se não tem dados locais
        if (this.autoSync && this.gistId && this.token) {
            try {
                const dadosNuvem = await this.carregarDaNuvem();
                if (dadosNuvem && (dadosNuvem.lancamentos.length > 0 || dadosNuvem.reservaEmergencia > 0)) {
                    localStorage.setItem('lancamentos', JSON.stringify(dadosNuvem.lancamentos));
                    localStorage.setItem('reservaEmergencia', dadosNuvem.reservaEmergencia.toString());
                    return dadosNuvem;
                }
            } catch (error) {
                console.log('Erro ao carregar da nuvem, usando local');
            }
        }
        
        return dadosLocal;
    }

    async sincronizarNuvem(lancamentos, reserva) {
        const dados = {
            lancamentos: lancamentos,
            reservaEmergencia: reserva,
            ultimaAtualizacao: new Date().toISOString(),
            versao: '1.0'
        };
        
        try {
            const url = this.gistId 
                ? `https://api.github.com/gists/${this.gistId}`
                : 'https://api.github.com/gists';
            
            const method = this.gistId ? 'PATCH' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `token ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: 'Dados Financas Pessoais - Backup Automático',
                    public: false,
                    files: {
                        'financas-dados.json': {
                            content: JSON.stringify(dados, null, 2)
                        }
                    }
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                if (!this.gistId) {
                    this.gistId = result.id;
                    localStorage.setItem('gistId', this.gistId);
                }
                return true;
            }
        } catch (error) {
            console.error('Erro na sincronização:', error);
        }
        return false;
    }
    
    async carregarDaNuvem() {
        try {
            const response = await fetch(`https://api.github.com/gists/${this.gistId}`, {
                headers: {
                    'Authorization': `token ${this.token}`
                }
            });
            
            if (response.ok) {
                const gist = await response.json();
                const content = gist.files['financas-dados.json'].content;
                return JSON.parse(content);
            }
        } catch (error) {
            console.error('Erro ao carregar da nuvem:', error);
        }
        return null;
    }
    
    configurarSincronizacao(token) {
        this.token = token;
        localStorage.setItem('githubToken', token);
        this.autoSync = true;
        localStorage.setItem('autoSync', 'true');
        // Buscar gist existente
        this.buscarGistExistente();
    }
    
    async buscarGistExistente() {
        try {
            const response = await fetch('https://api.github.com/gists', {
                headers: { 'Authorization': `token ${this.token}` }
            });
            
            if (response.ok) {
                const gists = await response.json();
                const financasGist = gists.find(g => 
                    g.description && g.description.includes('Financas') || 
                    g.files['financas-dados.json']
                );
                
                if (financasGist) {
                    this.gistId = financasGist.id;
                    localStorage.setItem('gistId', this.gistId);
                }
            }
        } catch (error) {
            console.log('Erro ao buscar gist existente:', error);
        }
    }
    
    desabilitarSincronizacao() {
        this.autoSync = false;
        localStorage.setItem('autoSync', 'false');
    }
    



}
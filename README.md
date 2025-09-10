# bot-dublador

## Descrição
Este projeto implementa um bot para Telegram capaz de:
- Receber mensagens de áudio do usuário, transcrever (speech-to-text), traduzir para outro idioma e gerar uma nova faixa de áudio (text-to-speech) com a tradução — ou simplesmente fazer *dubbing* mantendo o idioma com uma voz diferente.
- Traduzir mensagens de texto quando solicitado (com comando ou automaticamente dependendo da configuração).

> Observação: O projeto usa TypeScript e depende do FFmpeg instalado no sistema para manipulação/conveter formatos de áudio.

## Funcionalidades
- Receber e processar áudios enviados em diferentes formatos (ogg, mp3, m4a, etc.).
- Conversão de formatos via FFmpeg (por exemplo: `.wav` → `.ogg`).
- Integração com serviços de **Speech-to-Text** (STT) e **Text-to-Speech** (TTS).

## Requisitos
- Node.js (versão LTS recomendada, 22+)
- TypeScript
- FFmpeg **instalado no sistema** (obrigatório)
- Token do bot do Telegram (Telegram Bot API)
- Chave de API do Gemini

## Instalação do FFmpeg (exemplos)
> Instale o FFmpeg no sistema — o bot espera que o binário `ffmpeg` esteja disponível no PATH.

- macOS (Homebrew):
```bash
brew install ffmpeg
```

- Linux:
```bash
sudo apt update
sudo apt install ffmpeg -y
```

- Windows (Chocolatey):
```powershell
choco install ffmpeg
```

## Como subir o projeto (passo a passo)

1. Clone o repositório
```bash
git clone <REPO_URL>
cd <REPO_NAME>
```

2. Instale dependências
```bash
# com npm
npm install

# ou com yarn
yarn install
```

3. Copie o arquivo `.env.example` e renomeie para `.env`

> Ajuste os valores das variáveis para sua Telegram Bot API e sua chave de API do Gemini.

4. Rodando em desenvolvimento
```bash
# rodar diretamente com ts-node (se configurado)
npm run dev

# ou rodar
npm start
```

Exemplos de scripts (package.json):
```json
"scripts": {
  "start": "npx ts-node src/index.ts",
  "dev": "nodemon --watch src --ext ts --exec ts-node src/index.ts"
}
```

## Uso
- Envie um áudio para o bot: ele deve responder com a versão dublada / traduzida (dependendo das opções e do idioma de destino).
- Comando de texto:
  - `<sua mensagem>` — traduz o texto para o idioma especificado.
  - `<seu áudio>` — dubla o áudio para o inglês.

## Fluxo interno (resumo técnico)
1. Bot recebe áudio do usuário (Telegram File API).
2. Faz download do arquivo.
3. Envia áudio para um serviço de STT para obter transcrição.
4. Envia transcrição para serviço de tradução para o inglês.
5. Envia texto traduzido para o serviço de TTS para gerar a nova faixa de áudio.
6. Retorna o áudio ao usuário.

## Erros comuns
- `ffmpeg: command not found` — FFmpeg não está instalado ou não está no PATH.
- Limites de API / chaves inválidas — verifique as credenciais das APIs de STT/TTS/Tradução.
- Arquivo muito grande — implemente chunking ou limite de tamanho de upload para evitar timeouts.

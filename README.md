🚀 HomeLab - Daily Planner API

Uma API de alta performance para planejamento diário, desenvolvida com Node.js. Este projeto vai além do CRUD básico, implementando estruturas de dados avançadas, estratégias de cache e um tratamento de erros robusto para simular um ambiente de engenharia real.

🛠 Tecnologias

    Runtime: Node.js (v20+)

    Linguagem: TypeScript

    Framework: Express 5

    Banco de Dados: PostgreSQL

    ORM: Prisma

    Cache e Estado: Redis

    Validação: Zod

    Segurança: JWT (JSON Web Tokens) e Argon2

🧠 Engenharia e Arquitetura
1. Sistema de "Desfazer" (Ctrl+Z) via Pilhas no Redis

  Em vez de apenas deletar registros, implementei uma estrutura de Pilha (LIFO - Last In, First Out) usando o Redis.

  - Ao excluir uma tarefa, os dados são "empurrados" (push) para uma lista no Redis com um tempo de expiração (TTL) de 5 minutos.

  - O endpoint /undo retira (pop) o item mais recente da pilha e o restaura no PostgreSQL, mantendo a integridade do ID original.

2. Analytics de Alta Performance com Hash Maps

  Para os recursos de Heatmap e Progresso Diário do rastreador de hábitos:

  - Para evitar loops aninhados ineficientes (O(N^2)), a API utiliza Hash Maps (Objetos Record) para agregar milhares de logs em uma única passagem de tempo linear O(N).

  - Isso garante que o frontend receba os dados processados e prontos para renderização em tempo constante O(1).

3. Resiliência e Tratamento Global de Erros

  - Implementação de um Middleware de Erro Global para capturar exceções assíncronas de forma centralizada.

  - Mapeamento automático de erros do Prisma (P2002, P2025) e esquemas do Zod para respostas HTTP padronizadas.

  - Proteção estrita contra IDOR (Insecure Direct Object Reference) em todas as rotas de dados sensíveis.

📖 O que aprendi neste projeto
O Desafio da Pilha no Redis

Um dos maiores aprendizados foi a implementação do sistema de Undo utilizando o Redis. Inicialmente, pensei em usar apenas uma coluna deletedAt no banco relacional (Soft Delete), mas percebi que isso poluiria as consultas principais de performance.

Ao optar por uma Pilha no Redis, aprendi a manipular dados voláteis fora do banco de dados principal. Entender a lógica LIFO (o último a entrar é o primeiro a sair) foi crucial: quando o usuário clica em "desfazer", ele espera recuperar a última coisa que apagou. Usar os comandos LPUSH e LPOP do Redis me deu uma visão prática de como grandes aplicações gerenciam estados temporários de forma extremamente rápida, sem onerar o disco rígido do PostgreSQL.
🏁 Como Rodar o Projeto
Pré-requisitos

    Docker e Docker Compose

    Node.js e npm/yarn

Instalação

    Clone o repositório:
    Bash

    git clone https://github.com/seu-usuario/homelab-api.git
    cd homelab-api

    Configuração de Ambiente:
    Crie um arquivo .env baseado no .env.example:
    Snippet de código

    DATABASE_URL="postgresql://user:pass@localhost:5432/homelab"
    REDIS_URL="redis://localhost:6379"
    JWT_SECRET="sua_chave_secreta"

    Rodar com Docker:
    Bash

    docker-compose up -d

    Sincronizar Banco de Dados:
    Bash

    npx prisma db push

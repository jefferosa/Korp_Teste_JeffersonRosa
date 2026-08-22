# Sistema de Estoque e Faturamento

## 💻 Sobre o Projeto
Este projeto é um sistema distribuído (Microsserviços) desenvolvido em **.NET 8** (C#) para o backend e **React** (TypeScript) para o frontend. O objetivo é gerenciar o cadastro de produtos, controle de estoque e a emissão/impressão de Notas Fiscais, simulando regras de negócio reais e resiliência entre serviços.

## 🚀 Tecnologias Utilizadas
* **Backend:** C#, .NET 8, ASP.NET Core Web API, Entity Framework Core (SQLite), LINQ
* **Frontend:** React, TypeScript, Tailwind CSS, RxJS
* **Arquitetura:** Microsserviços (Estoque.API e Faturamento.API)

## ⚙️ Como Executar o Projeto

### 1. Backend (APIs)
Abra dois terminais separados, um para cada API:

**Terminal 1 - Estoque API (Porta 5192):**
```bash
cd Estoque.API
dotnet run
```

**Terminal 2 - Faturamento API (Porta 5055):**
```bash
cd Faturamento.API
dotnet run
```

### 2. Frontend (React)
Abra um terceiro terminal para o frontend:
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Principais Funcionalidades
* **Cadastro de Produtos:** Criação de produtos com validação de saldo inicial e proteção contra códigos duplicados.
* **Emissão de Notas (Aberta):** Criação de notas validando o saldo em tempo real (Fail Fast) direto no frontend.
* **Impressão de Notas (Fechada):** Integração via **RxJS** para gerenciar a chamada HTTP assíncrona. A API de Faturamento comunica-se com a de Estoque realizando a dedução de saldo com robusto tratamento de exceções.
* **Prevenção de Erros:** Bloqueio de exclusão de notas já impressas, tratamento amigável de saldo indisponível e queda de comunicação entre serviços.
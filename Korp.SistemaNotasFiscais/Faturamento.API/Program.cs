using Faturamento.API.Data;
using Microsoft.EntityFrameworkCore;
using Faturamento.API.Services;
using Polly;
using Polly.Extensions.Http;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do CORS para permitir que o Frontend se comunique com a API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Registrando o contexto do banco de dados (SQLite) para o Faturamento
builder.Services.AddDbContext<FaturamentoDbContext>(options =>
    options.UseSqlite("Data Source=faturamento.db"));

// Configuração do Tratamento de Falhas (Polly)
var retryPolicy = HttpPolicyExtensions
    .HandleTransientHttpError()
    .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

// Registra o EstoqueService e o HttpClient apontando para a porta do Estoque
// IMPORTANTE: Troque a porta 5001 abaixo pela porta real que o seu Estoque.API abriu (ex: 5192, 5001, etc)
builder.Services.AddHttpClient<EstoqueService>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5192");
})
.AddPolicyHandler(retryPolicy);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();

// Aplica a política de CORS criada acima
app.UseCors("AllowAll");

app.MapControllers();

app.Run();
